const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const recommendationService = require('./services/recommendationService');
const analysisService = require('./services/analysisService');
const chatService = require('./services/chatService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AI LMS Automation Engine - AI Service',
    timestamp: new Date(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('AI LMS Automation Engine - AI Service is running!');
});

// 1. Generate Learning Path
app.post('/generate-learning-path', async (req, res, next) => {
  try {
    const { track, skillLevel, interests, availableCourses } = req.body;
    if (!track) {
      return res.status(400).json({ success: false, message: 'Track is required' });
    }
    
    console.log(`AI Engine: Generating learning path for track "${track}", level "${skillLevel || 'Beginner'}"`);
    const path = await recommendationService.generateLearningPath(
      track,
      skillLevel || 'Beginner',
      interests || [],
      availableCourses || []
    );
    res.json(path);
  } catch (error) {
    next(error);
  }
});

// 2. Recommend Courses
app.post('/recommend-courses', async (req, res, next) => {
  try {
    const { track, skillLevel, completedCourses, interests, availableCourses } = req.body;
    if (!track) {
      return res.status(400).json({ success: false, message: 'Track is required' });
    }

    console.log(`AI Engine: Recommending next courses for track "${track}"`);
    const recommendation = await recommendationService.recommendCourses(
      track,
      skillLevel || 'Beginner',
      completedCourses || [],
      interests || [],
      availableCourses || []
    );
    res.json(recommendation);
  } catch (error) {
    next(error);
  }
});

// 3. Analyze Progress
app.post('/analyze-progress', async (req, res, next) => {
  try {
    const { studentName, track, skillLevel, progress } = req.body;
    if (!studentName || !track) {
      return res.status(400).json({ success: false, message: 'studentName and track are required' });
    }

    console.log(`AI Engine: Analyzing progress for student "${studentName}" on track "${track}"`);
    const analysis = await analysisService.analyzeProgress(
      studentName,
      track,
      skillLevel || 'Beginner',
      progress || []
    );
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// 4. Chat Assistant
app.post('/chat', async (req, res, next) => {
  try {
    const { message, studentName, track, skillLevel, interests, progressSummary, chatHistory } = req.body;
    if (!message || !studentName || !track) {
      return res.status(400).json({ success: false, message: 'message, studentName, and track are required' });
    }

    console.log(`AI Engine: Processing chat message from "${studentName}"`);
    const chatResult = await chatService.askAssistant(
      message,
      studentName,
      track,
      skillLevel || 'Beginner',
      interests || [],
      progressSummary || '',
      chatHistory || []
    );
    res.json(chatResult);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('AI Engine Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'AI Engine Internal Server Error'
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`AI Engine running on port ${PORT}`);
});
