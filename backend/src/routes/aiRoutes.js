const express = require('express');
const router = express.Router();
const {
  generateLearningPath,
  recommendCourses,
  analyzeProgress,
  askAssistant,
  voiceMentor
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate-learning-path', generateLearningPath);
router.post('/recommend-course', recommendCourses);
router.post('/analyze-progress', analyzeProgress);
router.post('/chat', askAssistant);
router.post('/voice-mentor', voiceMentor);


module.exports = router;
