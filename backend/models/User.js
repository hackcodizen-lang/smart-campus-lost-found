/**
 * User Model
 * Represents a user in the Smart Campus Lost & Found system
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  studentId: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true
  },
  department: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for lost items
userSchema.virtual('lostItems', {
  ref: 'LostItem',
  localField: '_id',
  foreignField: 'userId'
});

// Virtual for found items
userSchema.virtual('foundItems', {
  ref: 'FoundItem',
  localField: '_id',
  foreignField: 'userId'
});

export default mongoose.model('User', userSchema);
