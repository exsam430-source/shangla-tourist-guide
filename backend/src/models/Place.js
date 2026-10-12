const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String },
  caption: { type: String, default: '' },
  captionUr: { type: String, default: '' },
  season: {
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter', 'all'],
    default: 'all',
  },
  isMain: { type: Boolean, default: false },
});

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameUr: { type: String },
  type: {
    type: String,
    enum: ['hotel', 'guesthouse', 'camping', 'homestay', 'restaurant',
           'dhaba', 'fuel', 'hospital', 'pharmacy', 'police', 'atm', 'shop'],
  },
  priceRange: { type: String },
  contact: { type: String },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  distance: { type: String },
});

const routeFromCitySchema = new mongoose.Schema({
  city: { type: String, required: true },
  distanceKm: { type: Number },
  timeHours: { type: Number },
  route: { type: String },
  routeUr: { type: String },
  stayPoints: [{ type: String }],
  fuelStops: [{ type: String }],
  transportOptions: [{ type: String }],
});

const nearbyAttractionSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  placeName: { type: String },
  distanceKm: { type: Number },
  travelTime: { type: String },
});

const placeSchema = new mongoose.Schema(
  {
    // Basic Info
    nameEn: {
      type: String,
      required: [true, 'Place name (English) is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    nameUr: {
      type: String,
      trim: true,
      maxlength: [100, 'Urdu name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // Categories & Tags
    category: {
      type: [String],
      enum: [
        'viewpoint', 'mountain', 'valley', 'waterfall', 'lake',
        'historical', 'religious', 'forest', 'village', 'scenic',
        'adventure', 'camping', 'photography', 'trekking', 'cultural',
      ],
      required: [true, 'At least one category is required'],
    },
    tags: [{ type: String, lowercase: true }],

    // Location
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180,
      },
    },
    altitudeMeters: { type: Number },
    district: { type: String, default: 'Shangla' },
    tehsil: { type: String },
    unionCouncil: { type: String },
    address: { type: String },
    addressUr: { type: String },

    // Descriptions
    descriptionEn: {
      type: String,
      required: [true, 'English description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    descriptionUr: {
      type: String,
      maxlength: [5000, 'Urdu description cannot exceed 5000 characters'],
    },

    // Detailed Information
    detailedInfo: {
      history: { type: String },
      historyUr: { type: String },
      geography: { type: String },
      geographyUr: { type: String },
      floraFauna: { type: String },
      localCulture: { type: String },
      localCultureUr: { type: String },
      significance: { type: String },
      significanceUr: { type: String },
      mythsLegends: { type: String },
      accessibilityNotes: { type: String },
      accessibilityNotesUr: { type: String },
      safetyNotes: { type: String },
      safetyNotesUr: { type: String },
      photographyTips: { type: String },
    },

    // Images
    images: [imageSchema],

    // Weather & Best Time
    weatherProfile: {
      summerTemp: { type: String },
      winterTemp: { type: String },
      rainfall: { type: String },
      snowfall: { type: String },
      bestMonths: [{ type: String }],
    },
    bestTimeToVisit: {
      peakSeason: { type: String },
      offSeason: { type: String },
      recommended: { type: String },
      avoid: { type: String },
    },

    // Practical Info
    entryFee: { type: String, default: 'Free' },
    estimatedVisitTime: { type: String },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'moderate', 'hard', 'expert'],
      default: 'easy',
    },
    activities: [{ type: String }],
    suitableFor: [{ type: String }],
    parkingAvailable: { type: Boolean, default: true },
    mobileNetwork: { type: String },
    localTips: [{ type: String }],
    localTipsUr: [{ type: String }],

    // Facilities
    nearbyFacilities: [facilitySchema],

    // Routes
    routesFromCities: [routeFromCitySchema],

    // Nearby Attractions
    nearbyAttractions: [nearbyAttractionSchema],

    // Ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      accessibility: { type: Number, default: 0 },
      cleanliness: { type: Number, default: 0 },
      safety: { type: Number, default: 0 },
      valueForMoney: { type: Number, default: 0 },
      scenicBeauty: { type: Number, default: 0 },
    },

    // Status
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    searchCount: { type: Number, default: 0 },

    // Added by
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
placeSchema.index({ nameEn: 'text', nameUr: 'text', descriptionEn: 'text', tags: 'text' });
placeSchema.index({ coordinates: '2dsphere' });
placeSchema.index({ slug: 1 });
placeSchema.index({ category: 1 });
placeSchema.index({ isFeatured: 1, isActive: 1 });
placeSchema.index({ averageRating: -1 });

// Auto-generate slug before saving
placeSchema.pre('save', function (next) {
  if (this.isModified('nameEn')) {
    this.slug = this.nameEn
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Virtual: Main image
placeSchema.virtual('mainImage').get(function () {
  if (this.images && this.images.length > 0) {
    const main = this.images.find((img) => img.isMain);
    return main ? main.url : this.images[0].url;
  }
  return null;
});

// Method: Increment view count
placeSchema.methods.incrementView = function () {
  this.viewCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Method: Update rating
placeSchema.methods.updateRating = async function () {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { place: this._id, isApproved: true } },
    {
      $group: {
        _id: '$place',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
        avgAccessibility: { $avg: '$aspectRatings.accessibility' },
        avgCleanliness: { $avg: '$aspectRatings.cleanliness' },
        avgSafety: { $avg: '$aspectRatings.safety' },
        avgValue: { $avg: '$aspectRatings.valueForMoney' },
        avgScenic: { $avg: '$aspectRatings.scenicBeauty' },
      },
    },
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].avgRating * 10) / 10;
    this.totalReviews = stats[0].count;
    this.ratingBreakdown = {
      accessibility: Math.round(stats[0].avgAccessibility * 10) / 10,
      cleanliness: Math.round(stats[0].avgCleanliness * 10) / 10,
      safety: Math.round(stats[0].avgSafety * 10) / 10,
      valueForMoney: Math.round(stats[0].avgValue * 10) / 10,
      scenicBeauty: Math.round(stats[0].avgScenic * 10) / 10,
    };
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
  }

  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Place', placeSchema);