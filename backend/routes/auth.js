/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import LoginActivity from '../models/LoginActivity.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const normalizeIp = (ip = '') => {
  if (!ip) return '';
  if (ip === '::1') return '127.0.0.1';
  return ip.replace(/^::ffff:/, '');
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    phone
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated. Contact admin.'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      studentId: user.studentId,
      department: user.department,
      isActive: user.isActive
    }
  });
}));

/**
 * @route   POST /api/auth/admin-login
 * @desc    Login admin user
 * @access  Public
 */
router.post('/admin-login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Admin credentials are invalid'
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Admin account is deactivated'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Admin credentials are invalid'
    });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Admin login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

/**
 * @route   POST /api/auth/student-login
 * @desc    Login student with department + student ID
 * @access  Public
 */
router.post('/student-login', asyncHandler(async (req, res) => {
  const { studentId, department } = req.body;

  if (!studentId || !department) {
    return res.status(400).json({
      success: false,
      message: 'Please provide student ID and department'
    });
  }

  const normalizedId = String(studentId).trim().toUpperCase();
  const normalizedDept = String(department).trim().toUpperCase();
  const currentIp = normalizeIp(req.ip || '');

  const student = await Student.findOne({
    studentId: normalizedId,
    department: normalizedDept
  });

  if (!student) {
    await LoginActivity.create({
      studentId: normalizedId,
      department: normalizedDept,
      status: 'failed',
      ip: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    return res.status(401).json({
      success: false,
      message: 'Student not found in dataset'
    });
  }

  if (!student.active) {
    await LoginActivity.create({
      studentId: normalizedId,
      department: normalizedDept,
      status: 'deactivated',
      ip: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    return res.status(403).json({
      success: false,
      message: 'Student account is deactivated'
    });
  }

  if (student.lastLoginIp && student.lastLoginIp !== currentIp) {
    await LoginActivity.create({
      studentId: normalizedId,
      department: normalizedDept,
      status: 'failed',
      ip: currentIp,
      userAgent: req.headers['user-agent'] || ''
    });

    return res.status(403).json({
      success: false,
      message: 'Student ID is already active on another device'
    });
  }

  let user = await User.findOne({ studentId: normalizedId });
  if (!user) {
    const tempPassword = `${normalizedId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    user = await User.create({
      name: normalizedId,
      email: `${normalizedId.toLowerCase()}@smartcampus.edu`,
      password: tempPassword,
      role: 'user',
      studentId: normalizedId,
      department: normalizedDept,
      isActive: true
    });
  } else {
    user.department = normalizedDept;
    user.isActive = true;
    await user.save();
  }

  const token = generateToken(user._id);

  student.lastLoginIp = currentIp;
  student.lastLoginAt = new Date();
  await student.save();

  await LoginActivity.create({
    studentId: normalizedId,
    department: normalizedDept,
    status: 'success',
    ip: req.ip,
    userAgent: req.headers['user-agent'] || ''
  });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      isActive: user.isActive
    }
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      studentId: user.studentId,
      department: user.department,
      isActive: user.isActive
    }
  });
}));

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, avatar, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar
    }
  });
}));

/**
 * @route   PUT /api/auth/password
 * @desc    Update password
 * @access  Private
 */
router.put('/password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Password updated successfully',
    token
  });
}));

export default router;
