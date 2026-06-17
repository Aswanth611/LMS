const express = require('express');
const router = express.Router();
const { submitQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/submit', submitQuiz);

module.exports = router;
