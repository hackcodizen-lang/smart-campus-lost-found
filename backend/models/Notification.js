/**
 * Notification Model
 * Represents broadcast notifications for new posts
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 200
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
