const Review = require('../models/Review');
const Place = require('../models/Place');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { paginate } = require('../utils/helpers');

const getPlaceReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const { skip, limit: limitNum, page: pageNum } = paginate(null, page, limit);

  const [reviews, total] = await Promise.all([
    Review.find({ place: req.params.placeId, isApproved: true, isHidden: false })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name profileImage'),
    Review.countDocuments({ place: req.params.placeId, isApproved: true, isHidden: false }),
  ]);

  return paginatedResponse(res, 200, 'Reviews fetched', reviews, {
    page: pageNum,
    limit: limitNum,
    total,
  });
});

const submitReview = asyncHandler(async (req, res) => {
  const { placeId, rating, textEn, textUr, aspectRatings, visitDate, travelType, reportedIssues } = req.body;

  const place = await Place.findById(placeId);
  if (!place) {
    return errorResponse(res, 404, 'Place not found');
  }

  const existingReview = await Review.findOne({ user: req.user._id, place: placeId });
  if (existingReview) {
    return errorResponse(res, 400, 'You have already reviewed this place');
  }

  const images = req.files
    ? req.files.map((file) => ({ url: file.path, publicId: file.filename }))
    : [];

  const review = await Review.create({
    user: req.user._id,
    place: placeId,
    rating,
    textEn,
    textUr,
    aspectRatings,
    images,
    visitDate,
    travelType,
    reportedIssues,
    language: textUr && !textEn ? 'ur' : textEn && textUr ? 'both' : 'en',
  });

  await review.populate('user', 'name profileImage');

  const io = req.app.get('io');
  if (io) {
    io.to(`place_${placeId}`).emit('new_review', { review, placeId });
  }

  return successResponse(res, 201, 'Review submitted successfully! ⭐', review);
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return errorResponse(res, 404, 'Review not found');
  }

  if (review.user.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'You can only edit your own reviews');
  }

  const { rating, textEn, textUr, aspectRatings, visitDate, travelType } = req.body;

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, textEn, textUr, aspectRatings, visitDate, travelType },
    { new: true, runValidators: true }
  ).populate('user', 'name profileImage');

  return successResponse(res, 200, 'Review updated successfully', updatedReview);
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return errorResponse(res, 404, 'Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized to delete this review');
  }

  await Review.findByIdAndDelete(req.params.id);

  return successResponse(res, 200, 'Review deleted successfully');
});

const toggleHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return errorResponse(res, 404, 'Review not found');
  }

  const hasVoted = review.helpfulVotes.includes(req.user._id);

  if (hasVoted) {
    review.helpfulVotes = review.helpfulVotes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    review.helpfulVotes.push(req.user._id);
    review.helpfulCount += 1;
  }

  await review.save();

  return successResponse(res, 200, hasVoted ? 'Vote removed' : 'Marked as helpful', {
    helpfulCount: review.helpfulCount,
    hasVoted: !hasVoted,
  });
});

const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('place', 'nameEn nameUr slug images');

  return successResponse(res, 200, 'Your reviews fetched', reviews);
});

module.exports = {
  getPlaceReviews,
  submitReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  getMyReviews,
};