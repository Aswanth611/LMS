const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

module.exports = router;
