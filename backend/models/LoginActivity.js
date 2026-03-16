/**
 * LoginActivity Model
 * Tracks student login attempts for admin monitoring
 */

import mongoose from 'mongoose';

const loginActivitySchema = new mongoose.Schema({
  studentId: {
    type: String,
    trim: true,
    uppercase: true
  },
  department: {
    type: String,
    trim: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'deactivated'],
    default: 'failed'
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

loginActivitySchema.index({ createdAt: -1 });
loginActivitySchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.model('LoginActivity', loginActivitySchema);
