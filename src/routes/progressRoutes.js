const express = require('express');
const router = express.Router();
const { getProgressByUser, updateProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:userId', getProgressByUser);
router.put('/update', updateProgress);

module.exports = router;
