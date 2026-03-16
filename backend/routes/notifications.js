import express from 'express';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get recent notifications
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({
    success: true,
    notifications
  });
}));

export default router;
