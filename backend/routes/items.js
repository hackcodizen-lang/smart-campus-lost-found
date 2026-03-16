/**
 * Item Routes
 * Handles lost and found item reporting
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Match from '../models/Match.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { extractFeatures, compareImages, cosineSimilarity, detectImageAuthenticity } from '../services/imageMatchingService.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

/**
 * @route   POST /api/items/lost
 * @desc    Report a lost item
 * @access  Private
 */
router.post('/lost', protect, upload.single('image'), asyncHandler(async (req, res) => {
  const { title, description, category, location, dateLost, reward, contactInfo } = req.body;

  let imageFeatures = [];
  let authenticity = { aiProbability: 0, label: 'real', signals: {} };
  let imagePath = '';

  if (req.file) {
    imagePath = path.join(uploadsDir, req.file.filename);
    imageFeatures = await extractFeatures(imagePath);
    authenticity = await detectImageAuthenticity(imagePath);
  }

  // Create lost item
  const lostItem = await LostItem.create({
    userId: req.user.id,
    title,
    description,
    category: category || 'Other',
    image: req.file ? `/uploads/${req.file.filename}` : '',
    imageFeatures,
    aiProbability: authenticity.aiProbability,
    aiLabel: authenticity.label,
    aiAnalysis: authenticity.signals,
    location,
    dateLost: new Date(dateLost),
    reward: reward || 0,
    contactInfo: contactInfo || ''
  });

  await Notification.create({
    type: 'lost',
    message: `New lost item reported: ${title}`,
    itemId: lostItem._id
  });

  // Search for potential matches in existing found items
  await findMatchesForLostItem(lostItem);

  res.status(201).json({
    success: true,
    message: 'Lost item reported successfully',
    item: lostItem
  });
}));

/**
 * @route   POST /api/items/found
 * @desc    Report a found item
 * @access  Private
 */
router.post('/found', protect, upload.single('image'), asyncHandler(async (req, res) => {
  const { title, description, category, location, dateFound, isAnonymouslyReported, contactInfo } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image of the found item'
    });
  }

  if (!contactInfo) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number is required'
    });
  }

  // Extract image features for AI matching
  const imagePath = path.join(uploadsDir, req.file.filename);
  const imageFeatures = await extractFeatures(imagePath);
  const authenticity = await detectImageAuthenticity(imagePath);

  // Create found item
  const foundItem = await FoundItem.create({
    userId: req.user.id,
    image: `/uploads/${req.file.filename}`,
    imageFeatures,
    title: title || '',
    aiProbability: authenticity.aiProbability,
    aiLabel: authenticity.label,
    aiAnalysis: authenticity.signals,
    description: description || '',
    category: category || 'Other',
    location,
    dateFound: new Date(dateFound),
    isAnonymouslyReported: isAnonymouslyReported === 'true',
    contactInfo: contactInfo || ''
  });

  await Notification.create({
    type: 'found',
    message: `New found item posted: ${title || 'Found item'}`,
    itemId: foundItem._id
  });

  // Search for potential matches in existing lost items
  await findMatchesForFoundItem(foundItem);

  res.status(201).json({
    success: true,
    message: 'Found item reported successfully',
    item: foundItem
  });
}));

/**
 * @route   GET /api/items/lost
 * @desc    Get all lost items (with optional filters)
 * @access  Public
 */
router.get('/lost', asyncHandler(async (req, res) => {
  const { category, status, userId, q, page = 1, limit = 10 } = req.query;

  const query = {};
  
  if (category) query.category = category;
  if (status) query.status = status;
  if (userId) query.userId = userId;
  if (q) {
    query.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') }
    ];
  }

  const total = await LostItem.countDocuments(query);
  const lostItems = await LostItem.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    success: true,
    items: lostItems,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @route   GET /api/items/found
 * @desc    Get all found items (with optional filters)
 * @access  Public
 */
router.get('/found', asyncHandler(async (req, res) => {
  const { category, status, userId, q, page = 1, limit = 10 } = req.query;

  const query = {};
  
  if (category) query.category = category;
  if (status) query.status = status;
  if (userId) query.userId = userId;
  if (q) {
    query.$or = [
      { description: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') }
    ];
  }

  const total = await FoundItem.countDocuments(query);
  const foundItems = await FoundItem.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    success: true,
    items: foundItems,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @route   GET /api/items/lost/:id
 * @desc    Get single lost item
 * @access  Public
 */
router.get('/lost/:id', asyncHandler(async (req, res) => {
  const lostItem = await LostItem.findById(req.params.id).populate('userId', 'name email');

  if (!lostItem) {
    return res.status(404).json({
      success: false,
      message: 'Lost item not found'
    });
  }

  res.json({
    success: true,
    item: lostItem
  });
}));

/**
 * @route   GET /api/items/found/:id
 * @desc    Get single found item
 * @access  Public
 */
router.get('/found/:id', asyncHandler(async (req, res) => {
  const foundItem = await FoundItem.findById(req.params.id).populate('userId', 'name email');

  if (!foundItem) {
    return res.status(404).json({
      success: false,
      message: 'Found item not found'
    });
  }

  res.json({
    success: true,
    item: foundItem
  });
}));

/**
 * @route   GET /api/items/my
 * @desc    Get current user's items (lost and found)
 * @access  Private
 */
router.get('/my', protect, asyncHandler(async (req, res) => {
  const lostItems = await LostItem.find({ userId: req.user.id }).sort({ createdAt: -1 });
  const foundItems = await FoundItem.find({ userId: req.user.id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    lostItems,
    foundItems
  });
}));

/**
 * @route   PUT /api/items/lost/:id
 * @desc    Update lost item
 * @access  Private (owner only)
 */
router.put('/lost/:id', protect, asyncHandler(async (req, res) => {
  let lostItem = await LostItem.findById(req.params.id);

  if (!lostItem) {
    return res.status(404).json({
      success: false,
      message: 'Lost item not found'
    });
  }

  // Check ownership
  if (lostItem.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this item'
    });
  }

  const { title, description, category, location, dateLost, reward, contactInfo, status } = req.body;

  lostItem = await LostItem.findByIdAndUpdate(
    req.params.id,
    { title, description, category, location, dateLost, reward, contactInfo, status, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Lost item updated successfully',
    item: lostItem
  });
}));

/**
 * @route   PUT /api/items/found/:id
 * @desc    Update found item
 * @access  Private (owner only)
 */
router.put('/found/:id', protect, asyncHandler(async (req, res) => {
  let foundItem = await FoundItem.findById(req.params.id);

  if (!foundItem) {
    return res.status(404).json({
      success: false,
      message: 'Found item not found'
    });
  }

  // Check ownership
  if (foundItem.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this item'
    });
  }

  const { description, category, location, dateFound, contactInfo, status } = req.body;

  foundItem = await FoundItem.findByIdAndUpdate(
    req.params.id,
    { description, category, location, dateFound, contactInfo, status, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Found item updated successfully',
    item: foundItem
  });
}));

/**
 * @route   DELETE /api/items/lost/:id
 * @desc    Delete lost item
 * @access  Private (owner only)
 */
router.delete('/lost/:id', protect, asyncHandler(async (req, res) => {
  const lostItem = await LostItem.findById(req.params.id);

  if (!lostItem) {
    return res.status(404).json({
      success: false,
      message: 'Lost item not found'
    });
  }

  // Check ownership
  if (lostItem.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this item'
    });
  }

  // Delete associated image
  const imagePath = path.join(__dirname, '..', lostItem.image.replace(/^\/+/, ''));
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  // Delete associated matches
  await Match.deleteMany({ lostItemId: req.params.id });

  await LostItem.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Lost item deleted successfully'
  });
}));

/**
 * @route   DELETE /api/items/found/:id
 * @desc    Delete found item
 * @access  Private (owner only)
 */
router.delete('/found/:id', protect, asyncHandler(async (req, res) => {
  const foundItem = await FoundItem.findById(req.params.id);

  if (!foundItem) {
    return res.status(404).json({
      success: false,
      message: 'Found item not found'
    });
  }

  // Check ownership
  if (foundItem.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this item'
    });
  }

  // Delete associated image
  const imagePath = path.join(__dirname, '..', foundItem.image.replace(/^\/+/, ''));
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  // Delete associated matches
  await Match.deleteMany({ foundItemId: req.params.id });

  await FoundItem.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Found item deleted successfully'
  });
}));

/**
 * Helper function to find matches for a lost item
 */
const findMatchesForLostItem = async (lostItem) => {
  const threshold = parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.8;

  // Get all active found items
  const foundItems = await FoundItem.find({ status: 'active' });

  for (const foundItem of foundItems) {
    // Compare using stored features
    const similarity = cosineSimilarity(lostItem.imageFeatures, foundItem.imageFeatures);

    if (similarity >= threshold) {
      // Check if match already exists
      const existingMatch = await Match.findOne({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id
      });

      if (!existingMatch) {
        // Create new match
        await Match.create({
          lostItemId: lostItem._id,
          foundItemId: foundItem._id,
          similarityScore: similarity,
          status: 'pending',
          matchType: 'auto',
          notificationSent: false
        });

        // Update found item
        foundItem.matchesFound += 1;
        await foundItem.save();
      }
    }
  }
};

/**
 * Helper function to find matches for a found item
 */
const findMatchesForFoundItem = async (foundItem) => {
  const threshold = parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.8;

  // Get all active lost items
  const lostItems = await LostItem.find({ status: 'active' });

  for (const lostItem of lostItems) {
    // Compare using stored features
    const similarity = cosineSimilarity(lostItem.imageFeatures, foundItem.imageFeatures);

    if (similarity >= threshold) {
      // Check if match already exists
      const existingMatch = await Match.findOne({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id
      });

      if (!existingMatch) {
        // Create new match
        await Match.create({
          lostItemId: lostItem._id,
          foundItemId: foundItem._id,
          similarityScore: similarity,
          status: 'pending',
          matchType: 'auto',
          notificationSent: false
        });

        // Update lost item
        lostItem.notificationsSent += 1;
        await lostItem.save();
      }
    }
  }

  // Update found item status if matches found
  if (foundItem.matchesFound > 0) {
    foundItem.status = 'matched';
    await foundItem.save();
  }
};

export default router;
