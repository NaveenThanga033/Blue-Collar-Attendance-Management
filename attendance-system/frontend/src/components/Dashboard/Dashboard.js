import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTodaysSummary, getWorkerStats } from '../../services/api';
import { formatDisplayDate } from '../../utils/helpers';
import './Dashboard.css';

function Dashboard() {
  const [todaySummary, setTodaySummary] = useState(null);
  const [workerStats, setWorkerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, statsRes] = await Promise.all([
        getTodaysSummary(),
        getWorkerStats()
      ]);
      setTodaySummary(summaryRes.data);
      setWorkerStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading dashboard...</div>;
  }

  const today = new Date();

  return (
    <div className="container dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="dashboard-date">{formatDisplayDate(today)}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{workerStats?.total_workers || 0}</h3>
            <p>Total Workers</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <h3>{workerStats?.active_workers || 0}</h3>
            <p>Active Workers</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{workerStats?.daily_workers || 0}</h3>
            <p>Daily Workers</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{workerStats?.contract_workers || 0}</h3>
            <p>Contract Workers</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Today's Attendance Summary</h2>
        {todaySummary && (
          <div className="attendance-summary">
            <div className="summary-row">
              <div className="summary-item">
                <span className="summary-label">Present:</span>
                <span className="summary-value success">{todaySummary.present}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Absent:</span>
                <span className="summary-value danger">{todaySummary.absent}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Half Day:</span>
                <span className="summary-value warning">{todaySummary.half_day}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">On Leave:</span>
                <span className="summary-value info">{todaySummary.on_leave}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Not Marked:</span>
                <span className="summary-value">{todaySummary.not_marked}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/attendance" className="action-btn">
            <div className="action-icon">✓</div>
            <div className="action-text">Mark Attendance</div>
          </Link>
          <Link to="/workers/add" className="action-btn">
            <div className="action-icon">+</div>
            <div className="action-text">Add Worker</div>
          </Link>
          <Link to="/reports" className="action-btn">
            <div className="action-icon">📊</div>
            <div className="action-text">View Reports</div>
          </Link>
          <Link to="/payments" className="action-btn">
            <div className="action-icon">💰</div>
            <div className="action-text">Manage Payments</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;