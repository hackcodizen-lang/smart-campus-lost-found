/**
 * FoundItem Model
 * Represents a found item reported by a user
 */

import mongoose from 'mongoose';

const foundItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  image: {
    type: String,
    required: [true, 'Please upload an image of the found item']
  },
  imageFeatures: {
    type: [Number], // Store pre-computed image features for AI matching
    default: []
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    default: ''
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
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['ID Card', 'Wallet', 'Keys', 'Phone', 'Laptop', 'Bag', 'Clothing', 'Books', 'Other'],
    default: 'Other'
  },
  location: {
    type: String,
    required: [true, 'Please provide location where item was found']
  },
  dateFound: {
    type: Date,
    required: [true, 'Please provide date when item was found']
  },
  status: {
    type: String,
    enum: ['active', 'matched', 'claimed', 'returned'],
    default: 'active'
  },
  contactInfo: {
    type: String,
    default: ''
  },
  isAnonymouslyReported: {
    type: Boolean,
    default: false
  },
  matchesFound: {
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
foundItemSchema.index({ userId: 1, status: 1 });
foundItemSchema.index({ category: 1, status: 1 });
foundItemSchema.index({ createdAt: -1 });

// Virtual for user
foundItemSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for matches
foundItemSchema.virtual('matches', {
  ref: 'Match',
  localField: '_id',
  foreignField: 'foundItemId'
});

export default mongoose.model('FoundItem', foundItemSchema);
