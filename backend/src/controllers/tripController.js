const Trip = require('../models/Trip');
const axios = require('axios');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateTrip = asyncHandler(async (req, res) => {
  const {
    budget, durationDays, groupSize, interests,
    transportType, stayPreference, startLocation, startDate, environmentType,
  } = req.body;

  if (!budget || !durationDays) {
    return errorResponse(res, 400, 'Budget and duration are required');
  }

  try {
    const aiResponse = await axios.post(
      `${process.env.AI_SERVER_URL}/ai/plan-trip`,
      {
        budget: parseFloat(budget),
        duration_days: parseInt(durationDays),
        group_size: parseInt(groupSize) || 1,
        interests: interests || [],
        transport_type: transportType || 'own_car',
        stay_preference: stayPreference || 'any',
        start_location: startLocation,
        start_date: startDate,
        environment_type: environmentType || [],
      },
      { timeout: 60000 }
    );

    const generatedPlan = aiResponse.data;

    let savedTrip = null;
    if (req.user) {
      savedTrip = await Trip.create({
        user: req.user._id,
        preferences: { budget, durationDays, groupSize, interests, transportType, stayPreference, startLocation, startDate, environmentType },
        plan: generatedPlan.plan,
        title: generatedPlan.title || `Shangla Trip - ${durationDays} Days`,
      });
    }

    return successResponse(res, 200, 'Trip plan generated successfully! 🎒', {
      plan: generatedPlan,
      tripId: savedTrip ? savedTrip._id : null,
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ERR_NETWORK') {
      return errorResponse(res, 503, 'AI trip planner is temporarily unavailable. Please start the Python AI server.');
    }
    return errorResponse(res, 500, 'Failed to generate trip plan: ' + error.message);
  }
});

const getMyTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('plan.placesIncluded', 'nameEn nameUr slug images');

  return successResponse(res, 200, 'Your trips fetched', trips);
});

const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({
    _id: req.params.id,
    $or: [{ user: req.user._id }, { isPublic: true }],
  }).populate('plan.placesIncluded', 'nameEn nameUr slug images coordinates');

  if (!trip) {
    return errorResponse(res, 404, 'Trip not found');
  }

  return successResponse(res, 200, 'Trip fetched', trip);
});

const saveTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.create({
    user: req.user._id,
    ...req.body,
  });

  return successResponse(res, 201, 'Trip saved successfully', trip);
});

const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return errorResponse(res, 404, 'Trip not found');
  }

  const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, 200, 'Trip updated', updatedTrip);
});

const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return errorResponse(res, 404, 'Trip not found');
  }

  await Trip.findByIdAndDelete(req.params.id);

  return successResponse(res, 200, 'Trip deleted');
});

module.exports = { generateTrip, getMyTrips, getTrip, saveTrip, updateTrip, deleteTrip };