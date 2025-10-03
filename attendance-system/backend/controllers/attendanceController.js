const db = require('../config/database');

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const { worker_id, attendance_date, status, check_in_time, check_out_time, overtime_hours, notes } = req.body;

    // Check if attendance already exists
    const [existing] = await db.query(
      'SELECT * FROM attendance WHERE worker_id = ? AND attendance_date = ?',
      [worker_id, attendance_date]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        `UPDATE attendance 
         SET status = ?, check_in_time = ?, check_out_time = ?, 
             overtime_hours = ?, notes = ?, marked_by = ?
         WHERE worker_id = ? AND attendance_date = ?`,
        [status, check_in_time, check_out_time, overtime_hours || 0, notes, req.user.id, worker_id, attendance_date]
      );
      return res.json({ message: 'Attendance updated successfully' });
    }

    // Insert new
    await db.query(
      `INSERT INTO attendance 
       (worker_id, attendance_date, status, check_in_time, check_out_time, overtime_hours, notes, marked_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [worker_id, attendance_date, status, check_in_time, check_out_time, overtime_hours || 0, notes, req.user.id]
    );

    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

// Bulk mark attendance
const bulkMarkAttendance = async (req, res) => {
  try {
    const { attendance_date, records } = req.body;

    for (const record of records) {
      const { worker_id, status } = record;
      
      const [existing] = await db.query(
        'SELECT * FROM attendance WHERE worker_id = ? AND attendance_date = ?',
        [worker_id, attendance_date]
      );

      if (existing.length > 0) {
        await db.query(
          'UPDATE attendance SET status = ?, marked_by = ? WHERE worker_id = ? AND attendance_date = ?',
          [status, req.user.id, worker_id, attendance_date]
        );
      } else {
        await db.query(
          'INSERT INTO attendance (worker_id, attendance_date, status, marked_by) VALUES (?, ?, ?, ?)',
          [worker_id, attendance_date, status, req.user.id]
        );
      }
    }

    res.json({ message: 'Bulk attendance marked successfully' });
  } catch (error) {
    console.error('Bulk attendance error:', error);
    res.status(500).json({ error: 'Failed to mark bulk attendance' });
  }
};

// Get attendance by date
const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const [attendance] = await db.query(
      `SELECT a.*, w.name, w.worker_type, w.daily_wage 
       FROM attendance a
       JOIN workers w ON a.worker_id = w.id
       WHERE a.attendance_date = ?
       ORDER BY w.name`,
      [date]
    );

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// Get attendance for worker
const getWorkerAttendance = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT a.*, w.name, w.daily_wage 
      FROM attendance a
      JOIN workers w ON a.worker_id = w.id
      WHERE a.worker_id = ?
    `;
    let params = [workerId];

    if (start_date && end_date) {
      query += ' AND a.attendance_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    query += ' ORDER BY a.attendance_date DESC';

    const [attendance] = await db.query(query, params);
    res.json(attendance);
  } catch (error) {
    console.error('Get worker attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch worker attendance' });
  }
};

// Get today's attendance summary
const getTodaysSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [summary] = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'half-day' THEN 1 END) as half_day,
        COUNT(CASE WHEN status = 'leave' THEN 1 END) as on_leave,
        COUNT(*) as total_marked
      FROM attendance
      WHERE attendance_date = ?
    `, [today]);

    const [totalWorkers] = await db.query(
      'SELECT COUNT(*) as total FROM workers WHERE status = "active"'
    );

    res.json({
      ...summary[0],
      total_workers: totalWorkers[0].total,
      not_marked: totalWorkers[0].total - summary[0].total_marked
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

// Delete attendance
const deleteAttendance = async (req, res) => {
  try {
    await db.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
};

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  getAttendanceByDate,
  getWorkerAttendance,
  getTodaysSummary,
  deleteAttendance
};