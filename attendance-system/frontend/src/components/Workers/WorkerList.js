import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllWorkers, deleteWorker } from '../../services/api';
import { formatDisplayDate, formatCurrency } from '../../utils/helpers';
import './Workers.css';

function WorkerList() {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    filterWorkers();
  }, [workers, searchTerm, statusFilter, typeFilter]);

  const fetchWorkers = async () => {
    try {
      const response = await getAllWorkers();
      setWorkers(response.data);
      setFilteredWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
      alert('Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const filterWorkers = () => {
    let filtered = workers;

    if (searchTerm) {
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.contact?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(worker => worker.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(worker => worker.worker_type === typeFilter);
    }

    setFilteredWorkers(filtered);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteWorker(id);
        alert('Worker deleted successfully');
        fetchWorkers();
      } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Failed to delete worker');
      }
    }
  };

  if (loading) {
    return <div className="container">Loading workers...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Workers Management</h1>
        <Link to="/workers/add" className="btn btn-primary">
          + Add New Worker
        </Link>
      </div>

      <div className="card">
        <div className="filter-section">
          <input
            type="text"
            placeholder="Search by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="daily">Daily</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Daily Wage</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    No workers found
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(worker => (
                  <tr key={worker.id}>
                    <td>{worker.name}</td>
                    <td>{worker.contact || 'N/A'}</td>
                    <td>
                      <span className={`badge ${worker.worker_type === 'daily' ? 'badge-info' : 'badge-warning'}`}>
                        {worker.worker_type}
                      </span>
                    </td>
                    <td>{formatCurrency(worker.daily_wage)}</td>
                    <td>{formatDisplayDate(worker.joining_date)}</td>
                    <td>
                      <span className={`badge ${worker.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {worker.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-inline">
                        <Link to={`/workers/edit/${worker.id}`} className="btn btn-primary btn-sm">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(worker.id, worker.name)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <p>Total: {filteredWorkers.length} workers</p>
        </div>
      </div>
    </div>
  );
}

export default WorkerList;