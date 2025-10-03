const db = require('../config/database');

// Get all workers
const getAllWorkers = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM workers';
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    if (search) {
      query += status ? ' AND' : ' WHERE';
      query += ' (name LIKE ? OR contact LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name';

    const [workers] = await db.query(query, params);
    res.json(workers);
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
};

// Get worker by ID
const getWorkerById = async (req, res) => {
  try {
    const [workers] = await db.query(
      'SELECT * FROM workers WHERE id = ?',
      [req.params.id]
    );

    if (workers.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json(workers[0]);
  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
};

// Add new worker
const addWorker = async (req, res) => {
  try {
    const {
      name,
      contact,
      email,
      worker_type,
      daily_wage,
      overtime_rate,
      address,
      joining_date
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO workers 
       (name, contact, email, worker_type, daily_wage, overtime_rate, address, joining_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, contact, email || null, worker_type, daily_wage, overtime_rate || 0, address || null, joining_date]
    );

    res.status(201).json({
      message: 'Worker added successfully',
      workerId: result.insertId
    });
  } catch (error) {
    console.error('Add worker error:', error);
    res.status(500).json({ error: 'Failed to add worker' });
  }
};

// Update worker
const updateWorker = async (req, res) => {
  try {
    const {
      name,
      contact,
      email,
      worker_type,
      daily_wage,
      overtime_rate,
      address,
      status
    } = req.body;

    await db.query(
      `UPDATE workers 
       SET name = ?, contact = ?, email = ?, worker_type = ?, 
           daily_wage = ?, overtime_rate = ?, address = ?, status = ?
       WHERE id = ?`,
      [name, contact, email, worker_type, daily_wage, overtime_rate, address, status, req.params.id]
    );

    res.json({ message: 'Worker updated successfully' });
  } catch (error) {
    console.error('Update worker error:', error);
    res.status(500).json({ error: 'Failed to update worker' });
  }
};

// Delete worker
const deleteWorker = async (req, res) => {
  try {
    await db.query('DELETE FROM workers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Delete worker error:', error);
    res.status(500).json({ error: 'Failed to delete worker' });
  }
};

// Get worker statistics
const getWorkerStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_workers,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_workers,
        SUM(CASE WHEN worker_type = 'daily' THEN 1 ELSE 0 END) as daily_workers,
        SUM(CASE WHEN worker_type = 'contract' THEN 1 ELSE 0 END) as contract_workers
      FROM workers
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

module.exports = {
  getAllWorkers,
  getWorkerById,
  addWorker,
  updateWorker,
  deleteWorker,
  getWorkerStats
};