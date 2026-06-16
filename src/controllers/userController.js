const dbService = require('../utils/dbService');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await dbService.findUserById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        selectedTrack: user.selectedTrack,
        skillLevel: user.skillLevel,
        interests: user.interests,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile / track settings
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await dbService.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Prepare updates
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.selectedTrack !== undefined) updates.selectedTrack = req.body.selectedTrack;
    if (req.body.skillLevel !== undefined) updates.skillLevel = req.body.skillLevel;
    if (req.body.interests !== undefined) updates.interests = req.body.interests;
    if (req.body.password) updates.password = req.body.password;

    const updatedUser = await dbService.updateUser(userId, updates);

    res.json({
      success: true,
      user: {
        id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        selectedTrack: updatedUser.selectedTrack,
        skillLevel: updatedUser.skillLevel,
        interests: updatedUser.interests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
