const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in minutes
    default: 30
  }
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a course description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category/track'],
    enum: ['AI Engineer', 'Full Stack Developer', 'Data Scientist', 'Cyber Security Specialist', 'General']
  },
  difficulty: {
    type: String,
    required: [true, 'Please add a difficulty level'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Please add duration in hours']
  },
  modules: {
    type: [ModuleSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema);
