const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        'general', 'history', 'culture', 'geography', 'wildlife',
        'food', 'transport', 'safety', 'tips', 'faq', 'events',
        'accommodation', 'places', 'routes',
      ],
      required: true,
    },
    titleEn: { type: String, required: true },
    titleUr: { type: String },
    contentEn: { type: String, required: true },
    contentUr: { type: String },
    tags: [{ type: String, lowercase: true }],
    relatedPlaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
    ],
    source: { type: String },
    isVerified: { type: Boolean, default: true },
    lastVerified: { type: Date, default: Date.now },
    vectorized: { type: Boolean, default: false },
    vectorizedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

knowledgeSchema.index({ category: 1 });
knowledgeSchema.index({ titleEn: 'text', contentEn: 'text', tags: 'text' });

module.exports = mongoose.model('Knowledge', knowledgeSchema);