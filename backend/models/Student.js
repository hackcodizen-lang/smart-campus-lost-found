/**
 * Student Model
 * Represents a student who can access the Smart Campus Lost & Found system
 */

import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    uppercase: true
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLoginIp: {
    type: String,
    default: ''
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

studentSchema.index({ department: 1, active: 1 });

export default mongoose.model('Student', studentSchema);
