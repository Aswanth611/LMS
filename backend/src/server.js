const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = async () => {
  try {
    const mongoose = require('mongoose');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('\n============================================================');
    console.warn(`WARNING: MongoDB is not running locally (${error.message}).`);
    console.warn('The engine will automatically use the local JSON file database!');
    console.warn('============================================================\n');
  }
};

// Load env vars
dotenv.config();

// Create express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to Database (Handle gracefully if Mongo is offline)
connectDB();

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isMongoConnected = require('./utils/dbService').isMongoConnected();
  res.json({
    status: 'online',
    timestamp: new Date(),
    databaseMode: isMongoConnected ? 'MongoDB' : 'Local JSON files fallback',
    aiEngineUrl: process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000'
  });
});

// Basic root route
app.get('/', (req, res) => {
  res.send('AI LMS Automation Engine Backend is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
