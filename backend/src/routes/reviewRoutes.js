const express = require('express');
const router = express.Router();
const {
  getPlaceReviews, submitReview, updateReview,
  deleteReview, toggleHelpful, getMyReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { uploadReviewImage } = require('../config/cloudinary');

router.get('/my', protect, getMyReviews);
router.get('/place/:placeId', getPlaceReviews);
router.post('/', protect, uploadReviewImage.array('images', 5), submitReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, toggleHelpful);

module.exports = router;