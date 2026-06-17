const express = require('express');
const router = express.Router();
const { 
  submitProject, 
  getStudentProjects, 
  getProjectsForMentorReview, 
  approveProject, 
  rejectProject,
  getApprovedProjects
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/submit', submitProject);
router.get('/student/:id', getStudentProjects);
router.get('/mentor-review', authorize('mentor', 'admin'), getProjectsForMentorReview);
router.get('/approved', authorize('mentor', 'admin'), getApprovedProjects);
router.put('/:id/approve', authorize('mentor', 'admin'), approveProject);
router.put('/:id/reject', authorize('mentor', 'admin'), rejectProject);

module.exports = router;
