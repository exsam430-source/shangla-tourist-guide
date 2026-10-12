const Place = require('../models/Place');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { paginate } = require('../utils/helpers');
const axios = require('axios');

// Helper: Parse form data fields
const parseFormData = (body) => {
  const data = {};
  const jsonFields = [
    'category', 'coordinates', 'activities', 'suitableFor',
    'localTips', 'localTipsUr', 'detailedInfo', 'bestTimeToVisit',
    'weatherProfile', 'nearbyFacilities', 'routesFromCities',
    'nearbyAttractions', 'tags',
  ];

  Object.keys(body).forEach((key) => {
    const value = body[key];

    if (jsonFields.includes(key)) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    } else if (value === 'true') {
      data[key] = true;
    } else if (value === 'false') {
      data[key] = false;
    } else if (!isNaN(value) && value !== '' && key !== 'nameEn' && key !== 'nameUr' && key !== 'slug' && key !== 'descriptionEn' && key !== 'descriptionUr' && key !== 'entryFee' && key !== 'mobileNetwork' && key !== 'estimatedVisitTime' && key !== 'tehsil' && key !== 'address' && key !== 'addressUr') {
      data[key] = Number(value);
    } else {
      data[key] = value;
    }
  });

  return data;
};

// @desc    Get all places
const getAllPlaces = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 12, category, difficulty,
    search, featured, sort = '-averageRating',
  } = req.query;

  const query = { isActive: true };
  if (category) query.category = { $in: category.split(',') };
  if (difficulty) query.difficultyLevel = difficulty;
  if (featured === 'true') query.isFeatured = true;
  if (search) query.$text = { $search: search };

  const { skip, limit: limitNum, page: pageNum } = paginate(null, page, limit);

  const [places, total] = await Promise.all([
    Place.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('nameEn nameUr slug category images coordinates altitudeMeters averageRating totalReviews isFeatured difficultyLevel estimatedVisitTime descriptionEn descriptionUr'),
    Place.countDocuments(query),
  ]);

  return paginatedResponse(res, 200, 'Places fetched successfully', places, {
    page: pageNum, limit: limitNum, total,
  });
});

// @desc    Get single place by slug or ID
const getPlaceBySlug = asyncHandler(async (req, res) => {
  const param = req.params.slug;

  // Try slug first, then ID
  let place = await Place.findOne({ slug: param, isActive: true })
    .populate('nearbyAttractions.place', 'nameEn nameUr slug images averageRating');

  if (!place) {
    // Try by ID (for admin edit)
    try {
      place = await Place.findById(param)
        .populate('nearbyAttractions.place', 'nameEn nameUr slug images averageRating');
    } catch {
      // Invalid ID format
    }
  }

  if (!place) {
    return errorResponse(res, 404, 'Place not found');
  }

  await place.incrementView();
  return successResponse(res, 200, 'Place fetched successfully', place);
});

// @desc    Get featured places
const getFeaturedPlaces = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const places = await Place.find({ isFeatured: true, isActive: true })
    .sort('-averageRating')
    .limit(parseInt(limit))
    .select('nameEn nameUr slug category images coordinates averageRating totalReviews difficultyLevel descriptionEn descriptionUr estimatedVisitTime altitudeMeters');

  return successResponse(res, 200, 'Featured places fetched', places);
});

// @desc    Search places
const searchPlaces = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return errorResponse(res, 400, 'Search query must be at least 2 characters');
  }

  const places = await Place.find(
    { $text: { $search: q }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .select('nameEn nameUr slug images averageRating category');

  return successResponse(res, 200, 'Search results', places);
});

// @desc    Get nearby places
const getNearbyPlaces = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const place = await Place.findById(req.params.id);
  if (!place) {
    return errorResponse(res, 404, 'Place not found');
  }

  const nearbyPlaces = await Place.find({
    _id: { $ne: place._id },
    isActive: true,
  })
    .limit(parseInt(limit))
    .select('nameEn nameUr slug images averageRating category coordinates');

  return successResponse(res, 200, 'Nearby places fetched', nearbyPlaces);
});

// @desc    Get route info
const getRouteInfo = asyncHandler(async (req, res) => {
  const { fromLat, fromLng, fromCity } = req.query;

  const place = await Place.findById(req.params.id)
    .select('nameEn coordinates routesFromCities nearbyFacilities');

  if (!place) {
    return errorResponse(res, 404, 'Place not found');
  }

  let cityRoute = null;
  if (fromCity) {
    cityRoute = place.routesFromCities.find(
      (route) => route.city.toLowerCase() === fromCity.toLowerCase()
    );
  }

  return successResponse(res, 200, 'Route info fetched', {
    place: { nameEn: place.nameEn, coordinates: place.coordinates },
    cityRoute,
    facilities: place.nearbyFacilities,
  });
});

// @desc    Get categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Place.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$category' },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return successResponse(res, 200, 'Categories fetched', categories);
});

// @desc    Create place (Admin)
const createPlace = asyncHandler(async (req, res) => {
  const placeData = parseFormData(req.body);
  placeData.addedBy = req.user._id;

  // Handle uploaded images from Cloudinary
  if (req.files && req.files.length > 0) {
    placeData.images = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isMain: index === 0,
    }));
  }

  const place = await Place.create(placeData);
  return successResponse(res, 201, 'Place created successfully 🏔️', place);
});

// @desc    Update place (Admin)
const updatePlace = asyncHandler(async (req, res) => {
  let place = await Place.findById(req.params.id);
  if (!place) {
    return errorResponse(res, 404, 'Place not found');
  }

  const updateData = parseFormData(req.body);

  // Handle new uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isMain: place.images.length === 0 && index === 0,
    }));
    updateData.images = [...(place.images || []), ...newImages];
  }

  place = await Place.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, 200, 'Place updated successfully', place);
});

// @desc    Delete place (Admin)
const deletePlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);
  if (!place) {
    return errorResponse(res, 404, 'Place not found');
  }

  place.isActive = false;
  await place.save();
  return successResponse(res, 200, 'Place removed successfully');
});

// @desc    Get all places for map
const getPlacesForMap = asyncHandler(async (req, res) => {
  const places = await Place.find({ isActive: true })
    .select('nameEn nameUr slug coordinates category averageRating images');

  return successResponse(res, 200, 'Map data fetched', places);
});

module.exports = {
  getAllPlaces, getPlaceBySlug, getFeaturedPlaces, searchPlaces,
  getNearbyPlaces, getRouteInfo, getCategories, createPlace,
  updatePlace, deletePlace, getPlacesForMap,
};