/**
 * Match Routes
 * Handles match management, claims, and notifications
 */

import express from 'express';
import Match from '../models/Match.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/matches
 * @desc    Get all matches (with filters)
 * @access  Private
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const { status, userId, page = 1, limit = 10 } = req.query;

  let query = {};

  // If user is not admin, only show their matches
  if (req.user.role !== 'admin') {
    // Get items owned by user
    const lostItems = await LostItem.find({ userId: req.user.id }).select('_id');
    const foundItems = await FoundItem.find({ userId: req.user.id }).select('_id');
    
    const lostItemIds = lostItems.map(item => item._id);
    const foundItemIds = foundItems.map(item => item._id);

    query.$or = [
      { lostItemId: { $in: lostItemIds } },
      { foundItemId: { $in: foundItemIds } }
    ];
  }

  if (status) query.status = status;
  if (userId) {
    // Get items for specific user
    const userLostItems = await LostItem.find({ userId }).select('_id');
    const userFoundItems = await FoundItem.find({ userId }).select('_id');
    
    query.$or = [
      { lostItemId: { $in: userLostItems.map(i => i._id) } },
      { foundItemId: { $in: userFoundItems.map(i => i._id) } }
    ];
  }

  const total = await Match.countDocuments(query);
  const matches = await Match.find(query)
    .populate({
      path: 'lostItemId',
      select: 'title description image location dateLost status userId',
      populate: { path: 'userId', select: 'name email' }
    })
    .populate({
      path: 'foundItemId',
      select: 'description image location dateFound status userId isAnonymouslyReported',
      populate: { path: 'userId', select: 'name email' }
    })
    .sort({ similarityScore: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    success: true,
    matches,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @route   GET /api/matches/pending
 * @desc    Get pending matches for current user
 * @access  Private
 */
router.get('/pending', protect, asyncHandler(async (req, res) => {
  // Get items owned by user
  const lostItems = await LostItem.find({ userId: req.user.id }).select('_id');
  const foundItems = await FoundItem.find({ userId: req.user.id }).select('_id');
  
  const lostItemIds = lostItems.map(item => item._id);
  const foundItemIds = foundItems.map(item => item._id);

  const matches = await Match.find({
    $or: [
      { lostItemId: { $in: lostItemIds }, status: 'pending' },
      { foundItemId: { $in: foundItemIds }, status: 'pending' }
    ]
  })
    .populate({
      path: 'lostItemId',
      select: 'title description image location dateLost status',
      populate: { path: 'userId', select: 'name email' }
    })
    .populate({
      path: 'foundItemId',
      select: 'description image location dateFound status isAnonymouslyReported',
      populate: { path: 'userId', select: 'name email' }
    })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    matches,
    count: matches.length
  });
}));

/**
 * @route   GET /api/matches/:id
 * @desc    Get single match details
 * @access  Private
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id)
    .populate({
      path: 'lostItemId',
      populate: { path: 'userId', select: 'name email phone' }
    })
    .populate({
      path: 'foundItemId',
      populate: { path: 'userId', select: 'name email phone' }
    });

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Match not found'
    });
  }

  res.json({
    success: true,
    match
  });
}));

/**
 * @route   POST /api/matches/:id/claim
 * @desc    Claim a match (lost item owner claims found item)
 * @access  Private
 */
router.post('/:id/claim', protect, asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id)
    .populate({
      path: 'lostItemId',
      select: 'userId title'
    })
    .populate({
      path: 'foundItemId',
      select: 'userId'
    });

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Match not found'
    });
  }

  // Check if user owns the lost item
  if (match.lostItemId.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only claim matches for your own lost items'
    });
  }

  // Update match status
  match.status = 'claimed';
  match.claimedAt = new Date();
  await match.save();

  // Update lost item status
  await LostItem.findByIdAndUpdate(match.lostItemId._id, {
    status: 'claimed',
    updatedAt: Date.now()
  });

  // Update found item status
  await FoundItem.findByIdAndUpdate(match.foundItemId._id, {
    status: 'claimed',
    updatedAt: Date.now()
  });

  res.json({
    success: true,
    message: 'Item claimed successfully! The finder will be notified.',
    match
  });
}));

/**
 * @route   POST /api/matches/:id/confirm
 * @desc    Confirm a match
 * @access  Private
 */
router.post('/:id/confirm', protect, asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id)
    .populate({
      path: 'lostItemId foundItemId',
      select: 'userId'
    });

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Match not found'
    });
  }

  // Check if user owns either the lost or found item
  const isOwner = 
    match.lostItemId.userId.toString() === req.user.id ||
    match.foundItemId.userId.toString() === req.user.id;

  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to confirm this match'
    });
  }

  // Update match status
  match.status = 'confirmed';
  match.confirmedAt = new Date();
  await match.save();

  res.json({
    success: true,
    message: 'Match confirmed successfully!',
    match
  });
}));

/**
 * @route   POST /api/matches/:id/reject
 * @desc    Reject a match
 * @access  Private
 */
router.post('/:id/reject', protect, asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id)
    .populate({
      path: 'lostItemId foundItemId',
      select: 'userId'
    });

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Match not found'
    });
  }

  // Check if user owns either the lost or found item
  const isOwner = 
    match.lostItemId.userId.toString() === req.user.id ||
    match.foundItemId.userId.toString() === req.user.id;

  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to reject this match'
    });
  }

  const { reason } = req.body;

  // Update match status
  match.status = 'rejected';
  match.rejectedAt = new Date();
  match.notes = reason || 'Rejected by user';
  await match.save();

  res.json({
    success: true,
    message: 'Match rejected',
    match
  });
}));

/**
 * @route   GET /api/matches/stats
 * @desc    Get match statistics
 * @access  Private
 */
router.get('/stats/summary', protect, asyncHandler(async (req, res) => {
  // Get user's items
  const lostItems = await LostItem.find({ userId: req.user.id }).select('_id');
  const foundItems = await FoundItem.find({ userId: req.user.id }).select('_id');
  
  const lostItemIds = lostItems.map(item => item._id);
  const foundItemIds = foundItems.map(item => item._id);

  // Get match counts
  const pendingMatches = await Match.countDocuments({
    $or: [
      { lostItemId: { $in: lostItemIds }, status: 'pending' },
      { foundItemId: { $in: foundItemIds }, status: 'pending' }
    ]
  });

  const confirmedMatches = await Match.countDocuments({
    $or: [
      { lostItemId: { $in: lostItemIds }, status: 'confirmed' },
      { foundItemId: { $in: foundItemIds }, status: 'confirmed' }
    ]
  });

  const claimedMatches = await Match.countDocuments({
    $or: [
      { lostItemId: { $in: lostItemIds }, status: 'claimed' },
      { foundItemId: { $in: foundItemIds }, status: 'claimed' }
    ]
  });

  const rejectedMatches = await Match.countDocuments({
    $or: [
      { lostItemId: { $in: lostItemIds }, status: 'rejected' },
      { foundItemId: { $in: foundItemIds }, status: 'rejected' }
    ]
  });

  res.json({
    success: true,
    stats: {
      pending: pendingMatches,
      confirmed: confirmedMatches,
      claimed: claimedMatches,
      rejected: rejectedMatches,
      total: pendingMatches + confirmedMatches + claimedMatches + rejectedMatches
    }
  });
}));

/**
 * @route   DELETE /api/matches/:id
 * @desc    Delete a match (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Match not found'
    });
  }

  await Match.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Match deleted successfully'
  });
}));

export default router;
