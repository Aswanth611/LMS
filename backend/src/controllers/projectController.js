const dbService = require('../utils/dbService');

// @desc    Submit a final project
// @route   POST /api/projects/submit
// @access  Private
exports.submitProject = async (req, res) => {
  try {
    const { courseId, title, description, technologies, githubLink, uploadedFiles } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!courseId || !title || !description || !technologies || !githubLink) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId, title, description, technologies, and githubLink'
      });
    }

    const project = await dbService.createProject({
      studentId: studentId.toString(),
      courseId: courseId.toString(),
      title,
      description,
      technologies,
      githubLink,
      uploadedFiles: uploadedFiles || [],
      status: 'Pending Mentor Review',
      mentorFeedback: ''
    });

    res.status(201).json({
      success: true,
      message: 'Project submitted successfully. Pending mentor review.',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get projects by student ID
// @route   GET /api/projects/student/:id
// @access  Private
exports.getStudentProjects = async (req, res) => {
  try {
    const projects = await dbService.findProjects({ studentId: req.params.id });
    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all projects pending mentor review
// @route   GET /api/projects/mentor-review
// @access  Private
exports.getProjectsForMentorReview = async (req, res) => {
  try {
    const projects = await dbService.findProjects({ status: 'Pending Mentor Review' });
    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve a project
// @route   PUT /api/projects/:id/approve
// @access  Private
exports.approveProject = async (req, res) => {
  try {
    const { mentorFeedback } = req.body;
    const project = await dbService.updateProject(req.params.id, {
      status: 'Approved',
      mentorFeedback: mentorFeedback || ''
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project approved successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject a project
// @route   PUT /api/projects/:id/reject
// @access  Private
exports.rejectProject = async (req, res) => {
  try {
    const { mentorFeedback } = req.body;
    const project = await dbService.updateProject(req.params.id, {
      status: 'Rejected',
      mentorFeedback: mentorFeedback || ''
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project rejected successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all approved projects
// @route   GET /api/projects/approved
// @access  Private
exports.getApprovedProjects = async (req, res) => {
  try {
    const projects = await dbService.findProjects({ status: 'Approved' });
    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
