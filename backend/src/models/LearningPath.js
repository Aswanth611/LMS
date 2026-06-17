const mongoose = require('mongoose');

const RoadmapStageSchema = new mongoose.Schema({
  phase: {
    type: String, // e.g. "Phase 1: Fundamentals"
    required: true
  },
  title: {
    type: String, // e.g. "Python Programming"
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  topics: {
    type: [String],
    default: []
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
});

const LearningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  recommendedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  roadmapStages: {
    type: [RoadmapStageSchema],
    default: []
  },
  currentPhase: {
    type: Number,
    default: 1
  },
  completedPhases: [{
    phaseId: Number,
    quizScore: Number,
    completed: Boolean
  }],
  unlockedPhases: {
    type: [Number],
    default: [1]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LearningPath', LearningPathSchema);
