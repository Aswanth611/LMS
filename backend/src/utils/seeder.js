const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const LearningPath = require('../models/LearningPath');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const courses = require('./coursesData');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms';
    console.log('Connecting to database:', mongoUri);
    await mongoose.connect(mongoUri);

    // 1. Seed Courses
    console.log('Clearing existing courses...');
    await Course.deleteMany({});
    console.log('Seeding new courses...');
    const insertedCourses = await Course.insertMany(courses);
    console.log(`Seeded ${insertedCourses.length} courses successfully.`);

    // 2. Clear out older paths & progress during rebuild
    console.log('Clearing old user progress and learning paths...');
    await Progress.deleteMany({});
    await LearningPath.deleteMany({});

    // 3. Clear and seed Users
    console.log('Clearing users...');
    await User.deleteMany({});

    // Create Admin
    await User.create({
      name: "EduFlick Admin",
      email: "admin@eduflick.ai",
      password: "adminpassword",
      role: "admin",
      selectedTrack: "AI Engineer",
      skillLevel: "Advanced"
    });
    console.log('Seeded Admin: admin@eduflick.ai / adminpassword');

    // Create Student
    await User.create({
      name: "John Doe",
      email: "john@student.com",
      password: "studentpassword",
      role: "student",
      selectedTrack: "AI Engineer",
      skillLevel: "Beginner",
      interests: ["Python", "Machine Learning", "Neural Networks"]
    });
    console.log('Seeded Student: john@student.com / studentpassword');

    console.log('Database Seeding Complete!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
