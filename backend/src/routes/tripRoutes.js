const express = require('express');
const router = express.Router();
const { generateTrip, getMyTrips, getTrip, saveTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate', optionalAuth, generateTrip);
router.get('/my', protect, getMyTrips);
router.post('/', protect, saveTrip);
router.get('/:id', protect, getTrip);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);

module.exports = router;