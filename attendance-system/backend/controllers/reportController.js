const db = require('../config/database');

// Get monthly report for a worker
const getMonthlyReport = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { month, year } = req.query;

    const [attendance] = await db.query(
      `SELECT 
         a.*,
         w.name,
         w.daily_wage,
         w.overtime_rate
       FROM attendance a
       JOIN workers w ON a.worker_id = w.id
       WHERE a.worker_id = ? 
         AND MONTH(a.attendance_date) = ? 
         AND YEAR(a.attendance_date) = ?
       ORDER BY a.attendance_date`,
      [workerId, month, year]
    );

    // Calculate totals
    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let totalOvertimeHours = 0;

    attendance.forEach(record => {
      if (record.status === 'present') presentDays++;
      else if (record.status === 'half-day') halfDays++;
      else if (record.status === 'absent') absentDays++;
      else if (record.status === 'leave') leaveDays++;
      
      totalOvertimeHours += parseFloat(record.overtime_hours || 0);
    });

    const dailyWage = attendance[0]?.daily_wage || 0;
    const overtimeRate = attendance[0]?.overtime_rate || 0;

    const totalDays = presentDays + (halfDays * 0.5);
    const baseWage = totalDays * dailyWage;
    const overtimeWage = totalOvertimeHours * overtimeRate;
    const totalWage = baseWage + overtimeWage;

    res.json({
      worker: {
        id: workerId,
        name: attendance[0]?.name || 'Unknown'
      },
      period: { month, year },
      summary: {
        present_days: presentDays,
        half_days: halfDays,
        absent_days: absentDays,
        leave_days: leaveDays,
        total_working_days: totalDays,
        overtime_hours: totalOvertimeHours,
        daily_wage: dailyWage,
        base_wage: baseWage,
        overtime_wage: overtimeWage,
        total_wage: totalWage
      },
      attendance_records: attendance
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Get all workers monthly summary
const getAllWorkersMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const [workers] = await db.query('SELECT * FROM workers WHERE status = "active"');

    const reports = [];

    for (const worker of workers) {
      const [attendance] = await db.query(
        `SELECT * FROM attendance 
         WHERE worker_id = ? 
           AND MONTH(attendance_date) = ? 
           AND YEAR(attendance_date) = ?`,
        [worker.id, month, year]
      );

      let presentDays = 0;
      let halfDays = 0;
      let totalOvertimeHours = 0;

      attendance.forEach(record => {
        if (record.status === 'present') presentDays++;
        else if (record.status === 'half-day') halfDays++;
        totalOvertimeHours += parseFloat(record.overtime_hours || 0);
      });

      const totalDays = presentDays + (halfDays * 0.5);
      const baseWage = totalDays * worker.daily_wage;
      const overtimeWage = totalOvertimeHours * worker.overtime_rate;
      const totalWage = baseWage + overtimeWage;

      reports.push({
        worker_id: worker.id,
        worker_name: worker.name,
        contact: worker.contact,
        worker_type: worker.worker_type,
        present_days: presentDays,
        half_days: halfDays,
        total_working_days: totalDays,
        overtime_hours: totalOvertimeHours,
        daily_wage: worker.daily_wage,
        total_wage: totalWage
      });
    }

    res.json({
      period: { month, year },
      reports
    });
  } catch (error) {
    console.error('Get all workers report error:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
};

// Get payment report
const getPaymentReport = async (req, res) => {
  try {
    const { start_date, end_date, status } = req.query;

    let query = `
      SELECT 
        p.*,
        w.name as worker_name,
        w.contact
      FROM payments p
      JOIN workers w ON p.worker_id = w.id
      WHERE 1=1
    `;
    let params = [];

    if (start_date && end_date) {
      query += ' AND p.payment_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    if (status) {
      query += ' AND p.payment_status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.payment_date DESC';

    const [payments] = await db.query(query, params);

    const totalPaid = payments
      .filter(p => p.payment_status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.net_amount), 0);

    const totalUnpaid = payments
      .filter(p => p.payment_status === 'unpaid')
      .reduce((sum, p) => sum + parseFloat(p.net_amount), 0);

    res.json({
      payments,
      summary: {
        total_paid: totalPaid,
        total_unpaid: totalUnpaid,
        total_count: payments.length
      }
    });
  } catch (error) {
    console.error('Get payment report error:', error);
    res.status(500).json({ error: 'Failed to generate payment report' });
  }
};

// Add payment
const addPayment = async (req, res) => {
  try {
    const {
      worker_id,
      payment_date,
      period_start,
      period_end,
      total_days,
      total_amount,
      advance_paid,
      payment_status,
      payment_method,
      notes
    } = req.body;

    const net_amount = total_amount - (advance_paid || 0);

    const [result] = await db.query(
      `INSERT INTO payments 
       (worker_id, payment_date, period_start, period_end, total_days, 
        total_amount, advance_paid, net_amount, payment_status, payment_method, notes, paid_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [worker_id, payment_date, period_start, period_end, total_days, 
       total_amount, advance_paid || 0, net_amount, payment_status, 
       payment_method, notes, req.user.id]
    );

    res.status(201).json({
      message: 'Payment added successfully',
      paymentId: result.insertId
    });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { payment_status } = req.body;

    await db.query(
      'UPDATE payments SET payment_status = ? WHERE id = ?',
      [payment_status, paymentId]
    );

    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

// Get advances
const getAdvances = async (req, res) => {
  try {
    const { worker_id, status } = req.query;

    let query = `
      SELECT a.*, w.name as worker_name
      FROM advances a
      JOIN workers w ON a.worker_id = w.id
      WHERE 1=1
    `;
    let params = [];

    if (worker_id) {
      query += ' AND a.worker_id = ?';
      params.push(worker_id);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.advance_date DESC';

    const [advances] = await db.query(query, params);
    res.json(advances);
  } catch (error) {
    console.error('Get advances error:', error);
    res.status(500).json({ error: 'Failed to fetch advances' });
  }
};

// Add advance
const addAdvance = async (req, res) => {
  try {
    const { worker_id, amount, advance_date, reason } = req.body;

    const [result] = await db.query(
      'INSERT INTO advances (worker_id, amount, advance_date, reason, given_by) VALUES (?, ?, ?, ?, ?)',
      [worker_id, amount, advance_date, reason, req.user.id]
    );

    res.status(201).json({
      message: 'Advance added successfully',
      advanceId: result.insertId
    });
  } catch (error) {
    console.error('Add advance error:', error);
    res.status(500).json({ error: 'Failed to add advance' });
  }
};

module.exports = {
  getMonthlyReport,
  getAllWorkersMonthlyReport,
  getPaymentReport,
  addPayment,
  updatePaymentStatus,
  getAdvances,
  addAdvance
};