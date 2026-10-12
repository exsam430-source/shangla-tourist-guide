const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    aspectRatings: {
      accessibility: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      safety: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
      scenicBeauty: { type: Number, min: 1, max: 5 },
    },
    textEn: {
      type: String,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },
    textUr: {
      type: String,
      maxlength: [2000, 'Urdu review cannot exceed 2000 characters'],
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
        caption: { type: String },
      },
    ],
    visitDate: { type: Date },
    travelType: {
      type: String,
      enum: ['solo', 'couple', 'family', 'friends', 'group'],
    },
    helpfulCount: { type: Number, default: 0 },
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reportedIssues: [
      {
        issue: {
          type: String,
          enum: ['road_blocked', 'unsafe', 'litter', 'closed', 'incorrect_info', 'other'],
        },
        description: { type: String },
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    language: {
      type: String,
      enum: ['en', 'ur', 'both'],
      default: 'en',
    },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate reviews from same user for same place
reviewSchema.index({ user: 1, place: 1 }, { unique: true });
reviewSchema.index({ place: 1, isApproved: 1, createdAt: -1 });

// After save, update place rating
reviewSchema.post('save', async function () {
  const Place = mongoose.model('Place');
  const place = await Place.findById(this.place);
  if (place) await place.updateRating();
});

// After delete, update place rating
reviewSchema.post('remove', async function () {
  const Place = mongoose.model('Place');
  const place = await Place.findById(this.place);
  if (place) await place.updateRating();
});

module.exports = mongoose.model('Review', reviewSchema);