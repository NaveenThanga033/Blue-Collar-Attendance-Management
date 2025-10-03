import React, { useState, useEffect } from 'react';
import { 
  getAllWorkers, 
  getPaymentReport, 
  addPayment,
  updatePaymentStatus,
  getAdvances,
  addAdvance 
} from '../../services/api';
import { formatCurrency, formatDate, formatDisplayDate, getCurrentMonthYear } from '../../utils/helpers';
import './Payments.css';

function PaymentManagement() {
  const [activeTab, setActiveTab] = useState('payments');
  const [workers, setWorkers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    worker_id: '',
    payment_date: formatDate(new Date()),
    period_start: '',
    period_end: '',
    total_days: '',
    total_amount: '',
    advance_paid: '0',
    payment_status: 'unpaid',
    payment_method: 'cash',
    notes: ''
  });

  const [advanceForm, setAdvanceForm] = useState({
    worker_id: '',
    amount: '',
    advance_date: formatDate(new Date()),
    reason: ''
  });

  useEffect(() => {
    fetchWorkers();
    fetchPayments();
    fetchAdvances();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await getAllWorkers({ status: 'active' });
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await getPaymentReport({});
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchAdvances = async () => {
    try {
      const response = await getAdvances({});
      setAdvances(response.data);
    } catch (error) {
      console.error('Error fetching advances:', error);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addPayment(paymentForm);
      alert('Payment added successfully');
      setShowPaymentModal(false);
      resetPaymentForm();
      fetchPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addAdvance(advanceForm);
      alert('Advance added successfully');
      setShowAdvanceModal(false);
      resetAdvanceForm();
      fetchAdvances();
    } catch (error) {
      console.error('Error adding advance:', error);
      alert('Failed to add advance');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = async (paymentId, newStatus) => {
    try {
      await updatePaymentStatus(paymentId, { payment_status: newStatus });
      alert('Payment status updated');
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      worker_id: '',
      payment_date: formatDate(new Date()),
      period_start: '',
      period_end: '',
      total_days: '',
      total_amount: '',
      advance_paid: '0',
      payment_status: 'unpaid',
      payment_method: 'cash',
      notes: ''
    });
  };

  const resetAdvanceForm = () => {
    setAdvanceForm({
      worker_id: '',
      amount: '',
      advance_date: formatDate(new Date()),
      reason: ''
    });
  };

  const getPendingAdvances = (workerId) => {
    return advances
      .filter(adv => adv.worker_id === parseInt(workerId) && adv.status === 'pending')
      .reduce((sum, adv) => sum + parseFloat(adv.amount), 0);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Payment Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)}>
            + Add Payment
          </button>
          <button className="btn btn-success" onClick={() => setShowAdvanceModal(true)}>
            + Add Advance
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
        <button
          className={`tab ${activeTab === 'advances' ? 'active' : ''}`}
          onClick={() => setActiveTab('advances')}
        >
          Advances
        </button>
      </div>

      {activeTab === 'payments' && (
        <div className="card">
          <h2>Payment Records</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Period</th>
                  <th>Total Days</th>
                  <th>Total Amount</th>
                  <th>Advance</th>
                  <th>Net Amount</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>
                      No payment records found
                    </td>
                  </tr>
                ) : (
                  payments.map(payment => (
                    <tr key={payment.id}>
                      <td>{payment.worker_name}</td>
                      <td>
                        {formatDisplayDate(payment.period_start)} - {formatDisplayDate(payment.period_end)}
                      </td>
                      <td>{payment.total_days}</td>
                      <td>{formatCurrency(payment.total_amount)}</td>
                      <td>{formatCurrency(payment.advance_paid)}</td>
                      <td><strong>{formatCurrency(payment.net_amount)}</strong></td>
                      <td>
                        <span className={`badge ${
                          payment.payment_status === 'paid' ? 'badge-success' : 
                          payment.payment_status === 'partial' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td>{formatDisplayDate(payment.payment_date)}</td>
                      <td>
                        {payment.payment_status !== 'paid' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handlePaymentStatusChange(payment.id, 'paid')}
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'advances' && (
        <div className="card">
          <h2>Advance Records</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {advances.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No advance records found
                    </td>
                  </tr>
                ) : (
                  advances.map(advance => (
                    <tr key={advance.id}>
                      <td>{advance.worker_name}</td>
                      <td>{formatCurrency(advance.amount)}</td>
                      <td>{formatDisplayDate(advance.advance_date)}</td>
                      <td>{advance.reason || '-'}</td>
                      <td>
                        <span className={`badge ${
                          advance.status === 'adjusted' ? 'badge-success' : 
                          advance.status === 'refunded' ? 'badge-info' : 'badge-warning'
                        }`}>
                          {advance.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Payment</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label>Worker *</label>
                <select
                  value={paymentForm.worker_id}
                  onChange={(e) => {
                    const workerId = e.target.value;
                    const pendingAdvance = getPendingAdvances(workerId);
                    setPaymentForm({
                      ...paymentForm,
                      worker_id: workerId,
                      advance_paid: pendingAdvance.toString()
                    });
                  }}
                  required
                >
                  <option value="">Select Worker</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Period Start *</label>
                  <input
                    type="date"
                    value={paymentForm.period_start}
                    onChange={(e) => setPaymentForm({ ...paymentForm, period_start: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Period End *</label>
                  <input
                    type="date"
                    value={paymentForm.period_end}
                    onChange={(e) => setPaymentForm({ ...paymentForm, period_end: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Days *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={paymentForm.total_days}
                    onChange={(e) => setPaymentForm({ ...paymentForm, total_days: e.target.value })}
                    required
                    placeholder="Enter total working days"
                  />
                </div>
                <div className="form-group">
                  <label>Total Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.total_amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, total_amount: e.target.value })}
                    required
                    placeholder="Enter total amount"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Advance Paid (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.advance_paid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, advance_paid: e.target.value })}
                    placeholder="Advance amount to deduct"
                  />
                  {paymentForm.worker_id && getPendingAdvances(paymentForm.worker_id) > 0 && (
                    <small style={{ color: '#f57f17' }}>
                      Pending advance: {formatCurrency(getPendingAdvances(paymentForm.worker_id))}
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Payment Date *</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select
                    value={paymentForm.payment_status}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_status: e.target.value })}
                    required
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows="3"
                  placeholder="Add any notes about this payment"
                />
              </div>

              <div className="net-amount-display">
                <strong>Net Amount:</strong>
                <span>
                  {formatCurrency(
                    (parseFloat(paymentForm.total_amount) || 0) - (parseFloat(paymentForm.advance_paid) || 0)
                  )}
                </span>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Payment'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Advance Modal */}
      {showAdvanceModal && (
        <div className="modal-overlay" onClick={() => setShowAdvanceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Advance</h2>
              <button className="close-btn" onClick={() => setShowAdvanceModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAdvanceSubmit}>
              <div className="form-group">
                <label>Worker *</label>
                <select
                  value={advanceForm.worker_id}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, worker_id: e.target.value })}
                  required
                >
                  <option value="">Select Worker</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                    required
                    placeholder="Enter advance amount"
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={advanceForm.advance_date}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, advance_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={advanceForm.reason}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                  rows="3"
                  placeholder="Reason for advance payment"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Advance'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAdvanceModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentManagement;