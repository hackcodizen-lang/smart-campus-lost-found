/**
 * LostItem Model
 * Represents a lost item reported by a user
 */

import mongoose from 'mongoose';

const lostItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['ID Card', 'Wallet', 'Keys', 'Phone', 'Laptop', 'Bag', 'Clothing', 'Books', 'Other'],
    default: 'Other'
  },
  image: {
    type: String,
    default: ''
  },
  imageFeatures: {
    type: [Number], // Store pre-computed image features for AI matching
    default: []
  },
  aiProbability: {
    type: Number,
    default: 0
  },
  aiLabel: {
    type: String,
    enum: ['real', 'suspected'],
    default: 'real'
  },
  aiAnalysis: {
    type: Object,
    default: {}
  },
  location: {
    type: String,
    required: [true, 'Please provide location where item was lost']
  },
  dateLost: {
    type: Date,
    required: [true, 'Please provide date when item was lost']
  },
  status: {
    type: String,
    enum: ['active', 'found', 'claimed', 'expired'],
    default: 'active'
  },
  reward: {
    type: Number,
    default: 0
  },
  contactInfo: {
    type: String,
    default: ''
  },
  notificationsSent: {
    type: Number,
    default: 0
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

// Index for efficient searching
lostItemSchema.index({ userId: 1, status: 1 });
lostItemSchema.index({ category: 1, status: 1 });
lostItemSchema.index({ createdAt: -1 });

// Virtual for user
lostItemSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for matches
lostItemSchema.virtual('matches', {
  ref: 'Match',
  localField: '_id',
  foreignField: 'lostItemId'
});

export default mongoose.model('LostItem', lostItemSchema);
