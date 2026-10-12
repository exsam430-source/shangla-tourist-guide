const mongoose = require('mongoose');

const dayActivitySchema = new mongoose.Schema({
  time: { type: String },
  activity: { type: String },
  activityUr: { type: String },
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  placeName: { type: String },
  duration: { type: String },
  cost: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ['travel', 'visit', 'food', 'stay', 'rest', 'activity'],
  },
  notes: { type: String },
  coordinates: { lat: Number, lng: Number },
});

const tripDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  date: { type: Date },
  title: { type: String },
  activities: [dayActivitySchema],
  totalCost: { type: Number, default: 0 },
  stayPlace: { type: String },
  stayPlaceName: { type: String },
  stayCost: { type: Number, default: 0 },
  notes: { type: String },
});

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: { type: String },

    // User preferences for trip generation
    preferences: {
      budget: { type: Number, required: true },
      durationDays: { type: Number, required: true },
      groupSize: { type: Number, default: 1 },
      interests: [{ type: String }],
      transportType: {
        type: String,
        enum: ['own_car', 'public', 'rental', 'mixed'],
        default: 'own_car',
      },
      stayPreference: {
        type: String,
        enum: ['hotel', 'guesthouse', 'camping', 'homestay', 'any'],
        default: 'any',
      },
      startLocation: {
        city: { type: String },
        lat: { type: Number },
        lng: { type: Number },
      },
      startDate: { type: Date },
      environmentType: [{ type: String }],
    },

    // Generated plan
    plan: {
      days: [tripDaySchema],
      totalEstimatedCost: {
        transport: { type: Number, default: 0 },
        food: { type: Number, default: 0 },
        stay: { type: Number, default: 0 },
        activities: { type: Number, default: 0 },
        misc: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
      placesIncluded: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Place',
        },
      ],
      aiNotes: { type: String },
      aiNotesUr: { type: String },
    },

    status: {
      type: String,
      enum: ['draft', 'planned', 'ongoing', 'completed', 'cancelled'],
      default: 'planned',
    },
    isPublic: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ status: 1 });

module.exports = mongoose.model('Trip', tripSchema);