const express = require('express');
const router = express.Router();
const { getActiveAlerts, getAlert, createAlert, updateAlert, resolveAlert, deleteAlert } = require('../controllers/alertController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getActiveAlerts);
router.get('/:id', getAlert);
router.post('/', protect, createAlert);
router.put('/:id', protect, adminOnly, updateAlert);
router.put('/:id/resolve', protect, adminOnly, resolveAlert);
router.delete('/:id', protect, adminOnly, deleteAlert);

module.exports = router;