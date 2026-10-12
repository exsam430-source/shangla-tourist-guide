const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: { type: String, required: true },
  language: { type: String, enum: ['en', 'ur'], default: 'en' },
  isVoice: { type: Boolean, default: false },
  relatedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
  suggestedActions: [
    {
      label: String,
      action: String,
      data: mongoose.Schema.Types.Mixed,
    },
  ],
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [messageSchema],
    contextPlaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
    ],
    language: { type: String, enum: ['en', 'ur'], default: 'en' },
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
    totalMessages: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ user: 1, lastActive: -1 });
chatSessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 86400 * 30 }); // 30 days

module.exports = mongoose.model('ChatSession', chatSessionSchema);