import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllWorkers, bulkMarkAttendance, getAttendanceByDate } from '../../services/api';
import { formatDate, formatDisplayDate } from '../../utils/helpers';
import './Attendance.css';

function MarkAttendance() {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    fetchExistingAttendance();
  }, [selectedDate]);

  const fetchWorkers = async () => {
    try {
      const response = await getAllWorkers({ status: 'active' });
      setWorkers(response.data);
      
      // Initialize attendance state
      const initialAttendance = {};
      response.data.forEach(worker => {
        initialAttendance[worker.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await getAttendanceByDate(selectedDate);
      const existingAttendance = {};
      response.data.forEach(record => {
        existingAttendance[record.worker_id] = record.status;
      });
      setAttendance(prev => ({ ...prev, ...existingAttendance }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleAttendanceChange = (workerId, status) => {
    setAttendance({
      ...attendance,
      [workerId]: status
    });
  };

  const handleBulkAction = (status) => {
    const updatedAttendance = {};
    workers.forEach(worker => {
      updatedAttendance[worker.id] = status;
    });
    setAttendance(updatedAttendance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const records = workers.map(worker => ({
        worker_id: worker.id,
        status: attendance[worker.id] || 'absent'
      }));

      await bulkMarkAttendance({
        attendance_date: selectedDate,
        records
      });

      setMessage('Attendance marked successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status) => {
    return Object.values(attendance).filter(s => s === status).length;
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <Link to="/attendance/history" className="btn btn-secondary">
          View History
        </Link>
      </div>

      {message && (
        <div className={message.includes('success') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="attendance-header">
          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={formatDate(new Date())}
            />
          </div>

          <div className="bulk-actions">
            <span>Quick Actions: </span>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => handleBulkAction('present')}
            >
              Mark All Present
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => handleBulkAction('absent')}
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="attendance-summary-bar">
          <div className="summary-item">
            <span className="summary-badge success">{getStatusCount('present')}</span>
            <span>Present</span>
          </div>
          <div className="summary-item">
            <span className="summary-badge danger">{getStatusCount('absent')}</span>
            <span>Absent</span>
          </div>
          <div className="summary-item">
            <span className="summary-badge warning">{getStatusCount('half-day')}</span>
            <span>Half Day</span>
          </div>
          <div className="summary-item">
            <span className="summary-badge info">{getStatusCount('leave')}</span>
            <span>Leave</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="attendance-grid">
            {workers.map(worker => (
              <div key={worker.id} className="attendance-card">
                <div className="worker-info">
                  <h3>{worker.name}</h3>
                  <p>{worker.contact}</p>
                  <span className={`badge ${worker.worker_type === 'daily' ? 'badge-info' : 'badge-warning'}`}>
                    {worker.worker_type}
                  </span>
                </div>
                <div className="attendance-options">
                  <label className={`radio-option ${attendance[worker.id] === 'present' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`attendance_${worker.id}`}
                      value="present"
                      checked={attendance[worker.id] === 'present'}
                      onChange={() => handleAttendanceChange(worker.id, 'present')}
                    />
                    <span>Present</span>
                  </label>
                  <label className={`radio-option ${attendance[worker.id] === 'absent' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`attendance_${worker.id}`}
                      value="absent"
                      checked={attendance[worker.id] === 'absent'}
                      onChange={() => handleAttendanceChange(worker.id, 'absent')}
                    />
                    <span>Absent</span>
                  </label>
                  <label className={`radio-option ${attendance[worker.id] === 'half-day' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`attendance_${worker.id}`}
                      value="half-day"
                      checked={attendance[worker.id] === 'half-day'}
                      onChange={() => handleAttendanceChange(worker.id, 'half-day')}
                    />
                    <span>Half Day</span>
                  </label>
                  <label className={`radio-option ${attendance[worker.id] === 'leave' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`attendance_${worker.id}`}
                      value="leave"
                      checked={attendance[worker.id] === 'leave'}
                      onChange={() => handleAttendanceChange(worker.id, 'leave')}
                    />
                    <span>Leave</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MarkAttendance;