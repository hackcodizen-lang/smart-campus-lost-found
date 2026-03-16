/**
 * Smart Campus Lost & Found - Backend Server
 * Main entry point for the Express.js API
 * Uses MongoDB Memory Server for development
 */

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Import routes
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import matchRoutes from './routes/matches.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';
import Student from './models/Student.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow requests from frontend
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.length) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Smart Campus Lost & Found API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.log('Starting MongoDB Memory Server...');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB Memory Server');
    }

    const seedDefaults = async () => {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartcampus.edu';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

      let admin = await User.findOne({ email: adminEmail });
      if (!admin) {
        admin = await User.create({
          name: 'Campus Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          isActive: true
        });
      } else if (admin.role !== 'admin') {
        admin.role = 'admin';
        admin.isActive = true;
        await admin.save();
      }

      const defaultStudents = [
        { studentId: '23UIT001', department: 'IT' },
        { studentId: '23UIT002', department: 'IT' }
      ];

      for (const student of defaultStudents) {
        const exists = await Student.findOne({ studentId: student.studentId });
        if (!exists) {
          await Student.create({ ...student, active: true });
        }
      }

      console.log('âœ… Seeded default admin and student dataset');
      console.log(`ðŸ” Admin login: ${adminEmail} / ${adminPassword}`);
    };

    await seedDefaults();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🎉 Server running on http://localhost:${PORT}`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
      console.log(`📝 Frontend should be running at http://localhost:5173\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

