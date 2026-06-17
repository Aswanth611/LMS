const express = require('express');
const router = express.Router();
const { register, login, mentorLogin } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/mentor-login', mentorLogin);

module.exports = router;
