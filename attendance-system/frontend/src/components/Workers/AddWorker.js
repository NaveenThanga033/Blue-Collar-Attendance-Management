import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addWorker, updateWorker, getWorkerById } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import './Workers.css';

function AddWorker() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    worker_type: 'daily',
    daily_wage: '',
    overtime_rate: '',
    address: '',
    joining_date: formatDate(new Date()),
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchWorker();
    }
  }, [id]);

  const fetchWorker = async () => {
    try {
      const response = await getWorkerById(id);
      const worker = response.data;
      setFormData({
        ...worker,
        joining_date: formatDate(worker.joining_date)
      });
    } catch (error) {
      console.error('Error fetching worker:', error);
      setError('Failed to load worker details');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await updateWorker(id, formData);
        alert('Worker updated successfully');
      } else {
        await addWorker(formData);
        alert('Worker added successfully');
      }
      navigate('/workers');
    } catch (error) {
      console.error('Error saving worker:', error);
      setError(error.response?.data?.error || 'Failed to save worker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>{isEditMode ? 'Edit Worker' : 'Add New Worker'}</h1>
      </div>

      <div className="card">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter worker name"
              />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter contact number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label>Worker Type *</label>
              <select
                name="worker_type"
                value={formData.worker_type}
                onChange={handleChange}
                required
              >
                <option value="daily">Daily</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Daily Wage (₹) *</label>
              <input
                type="number"
                name="daily_wage"
                value={formData.daily_wage}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                placeholder="Enter daily wage"
              />
            </div>

            <div className="form-group">
              <label>Overtime Rate (₹/hour)</label>
              <input
                type="number"
                name="overtime_rate"
                value={formData.overtime_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Enter overtime rate"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Joining Date *</label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Worker' : 'Add Worker')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/workers')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWorker;