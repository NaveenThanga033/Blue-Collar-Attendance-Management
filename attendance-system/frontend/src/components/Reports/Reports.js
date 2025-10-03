import React, { useState, useEffect } from 'react';
import { getAllWorkers, getMonthlyReport, getAllWorkersMonthlyReport } from '../../services/api';
import { getCurrentMonthYear, getMonthName, formatCurrency, exportToCSV } from '../../utils/helpers';
import './Reports.css';

function Reports() {
  const [reportType, setReportType] = useState('individual');
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [filters, setFilters] = useState({
    month: getCurrentMonthYear().month,
    year: getCurrentMonthYear().year
  });
  const [report, setReport] = useState(null);
  const [allWorkersReport, setAllWorkersReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await getAllWorkers({ status: 'active' });
      setWorkers(response.data);
      if (response.data.length > 0) {
        setSelectedWorker(response.data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'individual') {
        const response = await getMonthlyReport(selectedWorker, filters);
        setReport(response.data);
        setAllWorkersReport(null);
      } else {
        const response = await getAllWorkersMonthlyReport(filters);
        setAllWorkersReport(response.data);
        setReport(null);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportType === 'individual' && report) {
      const data = report.attendance_records.map(record => ({
        Date: record.attendance_date,
        Status: record.status,
        'Check In': record.check_in_time || '-',
        'Check Out': record.check_out_time || '-',
        'Overtime Hours': record.overtime_hours || 0
      }));
      exportToCSV(data, `${report.worker.name}_${getMonthName(filters.month)}_${filters.year}`);
    } else if (reportType === 'all' && allWorkersReport) {
      const data = allWorkersReport.reports.map(r => ({
        'Worker Name': r.worker_name,
        'Contact': r.contact,
        'Type': r.worker_type,
        'Present Days': r.present_days,
        'Half Days': r.half_days,
        'Total Working Days': r.total_working_days,
        'Overtime Hours': r.overtime_hours,
        'Daily Wage': r.daily_wage,
        'Total Wage': r.total_wage
      }));
      exportToCSV(data, `All_Workers_${getMonthName(filters.month)}_${filters.year}`);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Reports</h1>
      </div>

      <div className="card">
        <div className="report-controls">
          <div className="form-group">
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setReport(null);
                setAllWorkersReport(null);
              }}
            >
              <option value="individual">Individual Worker</option>
              <option value="all">All Workers Summary</option>
            </select>
          </div>

          {reportType === 'individual' && (
            <div className="form-group">
              <label>Select Worker</label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
              >
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>&nbsp;</label>
            <button
              className="btn btn-primary"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {report && (
        <div className="card">
          <div className="report-header">
            <h2>Monthly Report - {report.worker.name}</h2>
            <button className="btn btn-success" onClick={handleExport}>
              Export to CSV
            </button>
          </div>

          <div className="report-summary">
            <div className="summary-card">
              <h3>Attendance Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Present Days:</span>
                  <span className="value">{report.summary.present_days}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Half Days:</span>
                  <span className="value">{report.summary.half_days}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Absent Days:</span>
                  <span className="value">{report.summary.absent_days}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Leave Days:</span>
                  <span className="value">{report.summary.leave_days}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Working Days:</span>
                  <span className="value highlight">{report.summary.total_working_days}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Overtime Hours:</span>
                  <span className="value">{report.summary.overtime_hours}</span>
                </div>
              </div>
            </div>

            <div className="summary-card">
              <h3>Wage Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Daily Wage:</span>
                  <span className="value">{formatCurrency(report.summary.daily_wage)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Base Wage:</span>
                  <span className="value">{formatCurrency(report.summary.base_wage)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Overtime Wage:</span>
                  <span className="value">{formatCurrency(report.summary.overtime_wage)}</span>
                </div>
                <div className="summary-item total">
                  <span className="label">Total Wage:</span>
                  <span className="value">{formatCurrency(report.summary.total_wage)}</span>
                </div>
              </div>
            </div>
          </div>

          <h3>Detailed Attendance</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Overtime Hours</th>
                </tr>
              </thead>
              <tbody>
                {report.attendance_records.map(record => (
                  <tr key={record.id}>
                    <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${
                        record.status === 'present' ? 'success' : 
                        record.status === 'absent' ? 'danger' : 
                        record.status === 'half-day' ? 'warning' : 'info'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.check_in_time || '-'}</td>
                    <td>{record.check_out_time || '-'}</td>
                    <td>{record.overtime_hours || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {allWorkersReport && (
        <div className="card">
          <div className="report-header">
            <h2>All Workers Monthly Summary</h2>
            <button className="btn btn-success" onClick={handleExport}>
              Export to CSV
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Present</th>
                  <th>Half Days</th>
                  <th>Total Days</th>
                  <th>Overtime</th>
                  <th>Daily Wage</th>
                  <th>Total Wage</th>
                </tr>
              </thead>
              <tbody>
                {allWorkersReport.reports.map(r => (
                  <tr key={r.worker_id}>
                    <td>{r.worker_name}</td>
                    <td>{r.contact}</td>
                    <td>
                      <span className={`badge ${r.worker_type === 'daily' ? 'badge-info' : 'badge-warning'}`}>
                        {r.worker_type}
                      </span>
                    </td>
                    <td>{r.present_days}</td>
                    <td>{r.half_days}</td>
                    <td><strong>{r.total_working_days}</strong></td>
                    <td>{r.overtime_hours}</td>
                    <td>{formatCurrency(r.daily_wage)}</td>
                    <td><strong>{formatCurrency(r.total_wage)}</strong></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="8" style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
                  <td style={{ fontWeight: 'bold' }}>
                    {formatCurrency(
                      allWorkersReport.reports.reduce((sum, r) => sum + r.total_wage, 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;