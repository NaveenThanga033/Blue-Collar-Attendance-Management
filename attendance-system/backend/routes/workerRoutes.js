const express = require('express');
const router = express.Router();
const {
  getAllWorkers,
  getWorkerById,
  addWorker,
  updateWorker,
  deleteWorker,
  getWorkerStats
} = require('../controllers/workerController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getAllWorkers);
router.get('/stats', getWorkerStats);
router.get('/:id', getWorkerById);
router.post('/', addWorker);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);

module.exports = router;