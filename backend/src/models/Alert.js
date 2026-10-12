const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    titleEn: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    titleUr: { type: String, trim: true },
    descriptionEn: {
      type: String,
      required: [true, 'Alert description is required'],
    },
    descriptionUr: { type: String },
    severity: {
      type: String,
      enum: ['green', 'yellow', 'orange', 'red'],
      required: true,
      default: 'yellow',
    },
    type: {
      type: String,
      enum: ['road_blocked', 'landslide', 'flood', 'snow', 'construction',
             'weather', 'security', 'closed', 'other'],
      required: true,
    },
    affectedArea: { type: String },
    affectedRoute: { type: String },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    affectedPlaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
    ],
    alternativeRoute: { type: String },
    alternativeRouteUr: { type: String },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedByType: {
      type: String,
      enum: ['admin', 'user', 'system'],
      default: 'admin',
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    expiresAt: { type: Date },
    resolvedAt: { type: Date },
    resolvedNote: { type: String },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ isActive: 1, severity: 1, createdAt: -1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Alert', alertSchema);