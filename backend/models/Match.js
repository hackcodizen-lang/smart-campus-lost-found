/**
 * Match Model
 * Represents a match between lost and found items
 */

import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  lostItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem',
    required: [true, 'Lost item ID is required']
  },
  foundItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem',
    required: [true, 'Found item ID is required']
  },
  similarityScore: {
    type: Number,
    required: [true, 'Similarity score is required'],
    min: [0, 'Similarity score cannot be less than 0'],
    max: [1, 'Similarity score cannot be more than 1']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'claimed'],
    default: 'pending'
  },
  matchType: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'auto'
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
  },
  claimedAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
matchSchema.index({ lostItemId: 1, status: 1 });
matchSchema.index({ foundItemId: 1, status: 1 });
matchSchema.index({ similarityScore: -1 });
matchSchema.index({ createdAt: -1 });

// Compound index to prevent duplicate matches
matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

// Virtual for lost item
matchSchema.virtual('lostItem', {
  ref: 'LostItem',
  localField: 'lostItemId',
  foreignField: '_id',
  justOne: true
});

// Virtual for found item
matchSchema.virtual('foundItem', {
  ref: 'FoundItem',
  localField: 'foundItemId',
  foreignField: '_id',
  justOne: true
});

export default mongoose.model('Match', matchSchema);
