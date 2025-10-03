import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import WorkerList from './components/Workers/WorkerList';
import AddWorker from './components/Workers/AddWorker';
import MarkAttendance from './components/Attendance/MarkAttendance';
import AttendanceHistory from './components/Attendance/AttendanceHistory';
import Reports from './components/Reports/Reports';
import PaymentManagement from './components/Payments/PaymentManagement';
import Navbar from './components/Common/Navbar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/workers" 
            element={
              isAuthenticated ? <WorkerList /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/workers/add" 
            element={
              isAuthenticated ? <AddWorker /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/workers/edit/:id" 
            element={
              isAuthenticated ? <AddWorker /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/attendance" 
            element={
              isAuthenticated ? <MarkAttendance /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/attendance/history" 
            element={
              isAuthenticated ? <AttendanceHistory /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/reports" 
            element={
              isAuthenticated ? <Reports /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/payments" 
            element={
              isAuthenticated ? <PaymentManagement /> : <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;