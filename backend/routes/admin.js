/**
 * Admin Routes
 * Handles student dataset management, login monitoring, and moderation
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Student from '../models/Student.js';
import LoginActivity from '../models/LoginActivity.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(protect, adminOnly);

/**
 * @route   GET /api/admin/students
 * @desc    List students
 * @access  Admin
 */
router.get('/students', asyncHandler(async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json({ success: true, students });
}));

/**
 * @route   POST /api/admin/students
 * @desc    Add student to dataset
 * @access  Admin
 */
router.post('/students', asyncHandler(async (req, res) => {
  const { studentId, department } = req.body;

  if (!studentId || !department) {
    return res.status(400).json({
      success: false,
      message: 'Student ID and department are required'
    });
  }

  const normalizedId = String(studentId).trim().toUpperCase();
  const normalizedDept = String(department).trim().toUpperCase();

  const existing = await Student.findOne({ studentId: normalizedId });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Student already exists'
    });
  }

  const student = await Student.create({
    studentId: normalizedId,
    department: normalizedDept,
    active: true
  });

  res.status(201).json({
    success: true,
    message: 'Student added',
    student
  });
}));

/**
 * @route   PUT /api/admin/students/:id/toggle
 * @desc    Activate/deactivate student
 * @access  Admin
 */
router.put('/students/:id/toggle', asyncHandler(async (req, res) => {
  const { active } = req.body;
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  student.active = typeof active === 'boolean' ? active : !student.active;
  if (!student.active) {
    student.lastLoginIp = '';
    student.lastLoginAt = null;
  }
  await student.save();

  await User.updateOne(
    { studentId: student.studentId },
    { isActive: student.active }
  );

  res.json({
    success: true,
    message: 'Student status updated',
    student
  });
}));

/**
 * @route   GET /api/admin/logins
 * @desc    Get recent login activity
 * @access  Admin
 */
router.get('/logins', asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const logins = await LoginActivity.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({ success: true, logins });
}));

/**
 * @route   GET /api/admin/items
 * @desc    Get items for moderation
 * @access  Admin
 */
router.get('/items', asyncHandler(async (req, res) => {
  const { type = 'all', limit = 100 } = req.query;

  let items = [];
  if (type === 'lost' || type === 'all') {
    const lostItems = await LostItem.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    items = items.concat(lostItems.map(item => ({ ...item.toObject(), itemType: 'lost' })));
  }

  if (type === 'found' || type === 'all') {
    const foundItems = await FoundItem.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    items = items.concat(foundItems.map(item => ({ ...item.toObject(), itemType: 'found' })));
  }

  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ success: true, items });
}));

/**
 * @route   DELETE /api/admin/items/:type/:id
 * @desc    Delete item (lost/found)
 * @access  Admin
 */
router.delete('/items/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  const model = type === 'found' ? FoundItem : LostItem;
  const item = await model.findById(id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  if (item.aiLabel !== 'suspected') {
    return res.status(403).json({
      success: false,
      message: 'Only AI-suspected posts can be deleted'
    });
  }

  const imagePath = path.join(__dirname, '..', item.image.replace(/^\/+/, ''));
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  if (type === 'lost') {
    await Match.deleteMany({ lostItemId: id });
  } else {
    await Match.deleteMany({ foundItemId: id });
  }

  await model.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Item deleted'
  });
}));

export default router;
