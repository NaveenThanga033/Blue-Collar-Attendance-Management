import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

// Worker APIs
export const getAllWorkers = (params) => api.get('/workers', { params });
export const getWorkerById = (id) => api.get(`/workers/${id}`);
export const addWorker = (data) => api.post('/workers', data);
export const updateWorker = (id, data) => api.put(`/workers/${id}`, data);
export const deleteWorker = (id) => api.delete(`/workers/${id}`);
export const getWorkerStats = () => api.get('/workers/stats');

// Attendance APIs
export const markAttendance = (data) => api.post('/attendance/mark', data);
export const bulkMarkAttendance = (data) => api.post('/attendance/bulk-mark', data);
export const getAttendanceByDate = (date) => api.get(`/attendance/date/${date}`);
export const getWorkerAttendance = (workerId, params) => 
  api.get(`/attendance/worker/${workerId}`, { params });
export const getTodaysSummary = () => api.get('/attendance/today-summary');
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

// Report APIs
export const getMonthlyReport = (workerId, params) => 
  api.get(`/reports/monthly/${workerId}`, { params });
export const getAllWorkersMonthlyReport = (params) => 
  api.get('/reports/monthly-all', { params });
export const getPaymentReport = (params) => api.get('/reports/payments', { params });
export const addPayment = (data) => api.post('/reports/payments', data);
export const updatePaymentStatus = (paymentId, data) => 
  api.put(`/reports/payments/${paymentId}`, data);
export const getAdvances = (params) => api.get('/reports/advances', { params });
export const addAdvance = (data) => api.post('/reports/advances', data);

export default api;