const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/apiResponse');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Alert = require('../models/Alert');
const Trip = require('../models/Trip');

router.use(protect, adminOnly);

// Dashboard stats
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [totalUsers, totalPlaces, totalReviews, activeAlerts, totalTrips] = await Promise.all([
    User.countDocuments(),
    Place.countDocuments({ isActive: true }),
    Review.countDocuments({ isApproved: true }),
    Alert.countDocuments({ isActive: true }),
    Trip.countDocuments(),
  ]);

  const recentReviews = await Review.find({ isApproved: false })
    .sort('-createdAt')
    .limit(5)
    .populate('user', 'name')
    .populate('place', 'nameEn');

  const recentUsers = await User.find()
    .sort('-createdAt')
    .limit(5)
    .select('name email createdAt');

  const topPlaces = await Place.find({ isActive: true })
    .sort('-averageRating -viewCount')
    .limit(5)
    .select('nameEn averageRating totalReviews viewCount');

  return successResponse(res, 200, 'Dashboard data fetched', {
    stats: { totalUsers, totalPlaces, totalReviews, activeAlerts, totalTrips },
    recentReviews,
    recentUsers,
    topPlaces,
  });
}));

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort('-createdAt').skip(skip).limit(parseInt(limit)),
    User.countDocuments(),
  ]);

  return successResponse(res, 200, 'Users fetched', { users, total, page: parseInt(page) });
}));

// Toggle user status
router.put('/users/:id/toggle-status', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save();

  return successResponse(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, { isActive: user.isActive });
}));

// Get pending reviews
router.get('/reviews/pending', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ isApproved: false })
    .sort('-createdAt')
    .populate('user', 'name email')
    .populate('place', 'nameEn');

  return successResponse(res, 200, 'Pending reviews fetched', reviews);
}));

// Moderate review
router.put('/reviews/:id/moderate', asyncHandler(async (req, res) => {
  const { action } = req.body;
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  review.isApproved = action === 'approve';
  review.isHidden = action === 'reject';
  await review.save();

  return successResponse(res, 200, `Review ${action}d successfully`);
}));

// Get unverified alerts
router.get('/alerts/unverified', asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ isVerified: false })
    .sort('-createdAt')
    .populate('reportedBy', 'name email');

  return successResponse(res, 200, 'Unverified alerts fetched', alerts);
}));

// Verify alert
router.put('/alerts/:id/verify', asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, isActive: true },
    { new: true }
  );

  return successResponse(res, 200, 'Alert verified and published', alert);
}));

// Get all places for admin (including inactive)
router.get('/places', asyncHandler(async (req, res) => {
  const places = await Place.find()
    .sort('-createdAt')
    .select('nameEn nameUr slug category images averageRating totalReviews viewCount isFeatured isActive difficultyLevel createdAt');

  return successResponse(res, 200, 'All places fetched', places);
}));

// Delete image from place
router.delete('/places/:placeId/images/:imageIndex', asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) return res.status(404).json({ success: false, message: 'Place not found' });

  const index = parseInt(req.params.imageIndex);
  if (index >= 0 && index < place.images.length) {
    place.images.splice(index, 1);
    await place.save();
  }

  return successResponse(res, 200, 'Image removed', place);
}));

// Set main image
router.put('/places/:placeId/images/:imageIndex/main', asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) return res.status(404).json({ success: false, message: 'Place not found' });

  place.images.forEach((img, i) => {
    img.isMain = i === parseInt(req.params.imageIndex);
  });
  await place.save();

  return successResponse(res, 200, 'Main image updated', place);
}));

module.exports = router;