const express = require('express');
const router = express.Router();
const {
  getMonthlyReport,
  getAllWorkersMonthlyReport,
  getPaymentReport,
  addPayment,
  updatePaymentStatus,
  getAdvances,
  addAdvance
} = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/monthly/:workerId', getMonthlyReport);
router.get('/monthly-all', getAllWorkersMonthlyReport);
router.get('/payments', getPaymentReport);
router.post('/payments', addPayment);
router.put('/payments/:paymentId',updatePaymentStatus);
router.get('/advances', getAdvances);
router.post('/advances', addAdvance);

module.exports = router;