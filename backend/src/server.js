const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = async () => {
  try {
    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000 // 2 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.forceLocalDB = false;
  } catch (error) {
    global.forceLocalDB = true;
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
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Temporary endpoint for generating PWA icons
const fs = require('fs');
const path = require('path');
app.post('/api/save-icon', (req, res) => {
  const { filename, base64 } = req.body;
  if (!filename || !base64) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  try {
    const data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    const destPath = path.join(__dirname, '../../frontend/public', filename);
    fs.writeFileSync(destPath, buffer);
    console.log(`Successfully saved icon to ${destPath}`);
    res.json({ success: true, message: `Saved ${filename}` });
  } catch (error) {
    console.error('Failed to save icon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
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

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
