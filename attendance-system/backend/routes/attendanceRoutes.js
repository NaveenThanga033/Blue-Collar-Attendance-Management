const express = require('express');
const router = express.Router();
const {
  markAttendance,
  bulkMarkAttendance,
  getAttendanceByDate,
  getWorkerAttendance,
  getTodaysSummary,
  deleteAttendance
} = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/mark', markAttendance);
router.post('/bulk-mark', bulkMarkAttendance);
router.get('/date/:date', getAttendanceByDate);
router.get('/worker/:workerId', getWorkerAttendance);
router.get('/today-summary', getTodaysSummary);
router.delete('/:id', deleteAttendance);

module.exports = router;