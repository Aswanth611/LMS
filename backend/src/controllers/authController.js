const dbService = require('../utils/dbService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper: Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey_lms_engine_eduflick', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const userExists = await dbService.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const userRole = ['student', 'mentor', 'admin'].includes(role) ? role : 'student';

    // Create user
    const user = await dbService.createUser({
      name,
      email,
      password,
      role: userRole
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user.id || user._id),
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          selectedTrack: user.selectedTrack,
          skillLevel: user.skillLevel
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data provided'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both an email and password'
      });
    }

    // Check for user
    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id || user.id),
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        selectedTrack: user.selectedTrack,
        skillLevel: user.skillLevel,
        interests: user.interests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Authenticate mentor & get token
// @route   POST /api/auth/mentor-login
// @access  Public
exports.mentorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both an email and password'
      });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This login is only for mentors.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id || user.id),
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
