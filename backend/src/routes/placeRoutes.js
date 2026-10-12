const express = require('express');
const router = express.Router();
const {
  getAllPlaces,
  getPlaceBySlug,
  getFeaturedPlaces,
  searchPlaces,
  getNearbyPlaces,
  getRouteInfo,
  getCategories,
  createPlace,
  updatePlace,
  deletePlace,
  getPlacesForMap,
} = require('../controllers/placeController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');
const { uploadPlaceImage } = require('../config/cloudinary');

// ✅ IMPORTANT: Specific routes MUST come BEFORE dynamic routes (:slug, :id)

// Static/specific routes first
router.get('/featured', getFeaturedPlaces);
router.get('/search', searchPlaces);
router.get('/categories', getCategories);
router.get('/map', getPlacesForMap);

// Root route
router.get('/', getAllPlaces);

// Admin create
router.post(
  '/',
  protect,
  adminOnly,
  uploadPlaceImage.array('images', 20),
  createPlace
);

// Dynamic routes (MUST be after static routes)
router.get('/:id/nearby', getNearbyPlaces);
router.get('/:id/route', getRouteInfo);

// Admin update/delete
router.put(
  '/:id',
  protect,
  adminOnly,
  uploadPlaceImage.array('images', 10),
  updatePlace
);
router.delete('/:id', protect, adminOnly, deletePlace);

// Slug route LAST (most generic dynamic route)
router.get('/:slug', optionalAuth, getPlaceBySlug);

module.exports = router;