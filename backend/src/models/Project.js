const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a project title']
  },
  description: {
    type: String,
    required: [true, 'Please add a project description']
  },
  technologies: {
    type: String,
    required: [true, 'Please specify technologies used']
  },
  githubLink: {
    type: String,
    required: [true, 'Please add a GitHub or project link']
  },
  uploadedFiles: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Pending Mentor Review', 'Approved', 'Rejected'],
    default: 'Pending Mentor Review'
  },
  mentorFeedback: {
    type: String,
    default: ''
  },
  submittedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);
