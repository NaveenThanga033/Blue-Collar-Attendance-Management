import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllWorkers, getWorkerAttendance } from '../../services/api';
import { formatDate, formatDisplayDate, getCurrentMonthYear, getMonthName } from '../../utils/helpers';
import './Attendance.css';

function AttendanceHistory() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: getCurrentMonthYear().month,
    year: getCurrentMonthYear().year
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (selectedWorker) {
      fetchAttendance();
    }
  }, [selectedWorker, filters]);

  const fetchWorkers = async () => {
    try {
      const response = await getAllWorkers();
      setWorkers(response.data);
      if (response.data.length > 0) {
        setSelectedWorker(response.data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const startDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
      const endDate = new Date(filters.year, filters.month, 0).toISOString().split('T')[0];

      const response = await getWorkerAttendance(selectedWorker, {
        start_date: startDate,
        end_date: endDate
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      present: 'badge-success',
      absent: 'badge-danger',
      'half-day': 'badge-warning',
      leave: 'badge-info'
    };
    return statusMap[status] || '';
  };

  const calculateStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
      totalDays: 0
    };

    attendance.forEach(record => {
      if (record.status === 'present') stats.present++;
      else if (record.status === 'absent') stats.absent++;
      else if (record.status === 'half-day') stats.halfDay++;
      else if (record.status === 'leave') stats.leave++;
    });

    stats.totalDays = stats.present + (stats.halfDay * 0.5);
    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="container">
      <div className="page-header">
        <h1>Attendance History</h1>
        <Link to="/attendance" className="btn btn-primary">
          Mark Attendance
        </Link>
      </div>

      <div className="card">
        <div className="filter-section">
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
        </div>

        {selectedWorker && (
          <div className="attendance-stats">
            <div className="stat-item">
              <span className="stat-label">Present:</span>
              <span className="stat-value success">{stats.present}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Absent:</span>
              <span className="stat-value danger">{stats.absent}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Half Days:</span>
              <span className="stat-value warning">{stats.halfDay}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Leaves:</span>
              <span className="stat-value info">{stats.leave}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Working Days:</span>
              <span className="stat-value">{stats.totalDays}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Overtime Hours</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendance.map(record => (
                    <tr key={record.id}>
                      <td>{formatDisplayDate(record.attendance_date)}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.check_in_time || '-'}</td>
                      <td>{record.check_out_time || '-'}</td>
                      <td>{record.overtime_hours || 0}</td>
                      <td>{record.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceHistory;