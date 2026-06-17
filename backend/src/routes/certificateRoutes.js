const express = require('express');
const router = express.Router();
const { 
  generateCertificate, 
  getStudentCertificates, 
  downloadCertificate 
} = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

// Public route for downloading (so it can be opened easily in browser window/tab)
router.get('/download/:id', downloadCertificate);

// Protected routes
router.post('/generate', protect, generateCertificate);
router.get('/student/:id', protect, getStudentCertificates);

module.exports = router;
