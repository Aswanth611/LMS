const dbService = require('../utils/dbService');

// @desc    Get all progress objects for a user
// @route   GET /api/progress/:userId
// @access  Private
exports.getProgressByUser = async (req, res) => {
  try {
    const requesterId = req.user.id || req.user._id;
    // Check if requester is requesting their own data or is admin
    if (requesterId.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own progress.'
      });
    }

    const progressList = await dbService.findProgressByUser(req.params.userId);

    res.json({
      success: true,
      count: progressList.length,
      progress: progressList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update course progress (enroll, complete modules, or edit completion percentage)
// @route   PUT /api/progress/update
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { courseId, completedModules, completionPercentage } = req.body;
    const userId = req.user.id || req.user._id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required to update progress'
      });
    }

    // Verify course exists
    const course = await dbService.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Perform database operations using dbService
    const progress = await dbService.updateProgress(userId, courseId, {
      completedModules,
      completionPercentage
    });

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
