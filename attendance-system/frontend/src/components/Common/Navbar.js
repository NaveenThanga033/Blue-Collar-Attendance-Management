import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">Attendance System</Link>
        </div>

        <div className="navbar-menu">
          <Link to="/" className={isActive('/')}>Dashboard</Link>
          <Link to="/workers" className={isActive('/workers')}>Workers</Link>
          <Link to="/attendance" className={isActive('/attendance')}>Attendance</Link>
          <Link to="/reports" className={isActive('/reports')}>Reports</Link>
          <Link to="/payments" className={isActive('/payments')}>Payments</Link>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user.username}</span>
          <button onClick={onLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;