const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const LearningPath = require('../models/LearningPath');

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists for JSON DB fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers for File IO
const readJSON = (filename) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
};

const writeJSON = (filename, data) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Check if mongoose is connected
const isMongoConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1 && !global.forceLocalDB;
};

// Seeding standard courses to local JSON database if empty
const checkAndSeedLocalJSON = () => {
  const courses = readJSON('courses');
  if (courses.length === 0) {
    const defaultCourses = [
      {
        _id: "c1",
        title: "Python Fundamentals for AI",
        description: "Learn Python programming language essentials tailored specifically for data manipulation, scripting, and basic AI computations.",
        category: "AI Engineer",
        difficulty: "Beginner",
        duration: 10,
        modules: [
          { title: "Introduction to Python syntax", description: "Variables, data types.", duration: 30 },
          { title: "Control Flow & Functions", description: "Loops and custom functions.", duration: 45 },
          { title: "Data Structures in Python", description: "Lists, dicts, sets.", duration: 60 }
        ]
      },
      {
        _id: "c2",
        title: "Machine Learning Essentials",
        description: "An end-to-end guide to modern machine learning. Dive deep into supervised and unsupervised learning.",
        category: "AI Engineer",
        difficulty: "Intermediate",
        duration: 20,
        modules: [
          { title: "Introduction to ML & Supervised Learning", description: "Linear and logistic regression.", duration: 60 },
          { title: "Unsupervised Learning Algorithms", description: "K-Means and PCA.", duration: 90 },
          { title: "Model Evaluation", description: "Precision-recall, ROC-AUC.", duration: 60 }
        ]
      },
      {
        _id: "c3",
        title: "Deep Learning & Neural Networks",
        description: "Unlock the power of neural networks. Master Feedforward networks, CNNs, RNNs, and Transformers.",
        category: "AI Engineer",
        difficulty: "Advanced",
        duration: 30,
        modules: [
          { title: "Neural Network Mathematics", description: "Forward propagation and backprop.", duration: 90 },
          { title: "Convolutional Networks (CNNs)", description: "Image classification.", duration: 120 },
          { title: "Transformers and LLMs", description: "Attention mechanisms.", duration: 150 }
        ]
      },
      {
        _id: "c4",
        title: "HTML, CSS & JavaScript Fundamentals",
        description: "The core building blocks of the web. Learn HTML5 for structure, CSS3 for styling and responsive designs, and JavaScript.",
        category: "Full Stack Developer",
        difficulty: "Beginner",
        duration: 12,
        modules: [
          { title: "HTML5 Semantic Structure", description: "Layout tags, forms.", duration: 30 },
          { title: "CSS3 layouts: Flexbox & Grid", description: "Responsive grid layouts.", duration: 60 },
          { title: "Modern JavaScript (ES6+)", description: "Variables, promises.", duration: 90 }
        ]
      },
      {
        _id: "c5",
        title: "React & Frontend Architecture",
        description: "Learn the leading frontend library for building component-based SPAs.",
        category: "Full Stack Developer",
        difficulty: "Intermediate",
        duration: 25,
        modules: [
          { title: "Component Basics & Props", description: "Designing components.", duration: 45 },
          { title: "State Management", description: "useState and useEffect hooks.", duration: 90 }
        ]
      },
      {
        _id: "c6",
        title: "Introduction to Data Science with Python",
        description: "Get started with the field of data science. Learn Pandas and NumPy.",
        category: "Data Scientist",
        difficulty: "Beginner",
        duration: 10,
        modules: [
          { title: "Introduction to Jupyter & Pandas", description: "DataFrame exploration.", duration: 45 },
          { title: "Data Wrangling & Cleaning", description: "Handling missing values.", duration: 60 }
        ]
      },
      {
        _id: "c7",
        title: "Introduction to Cyber Security & Networking",
        description: "Learn the core foundations of system protection, TCP/IP stack, and firewalls.",
        category: "Cyber Security Specialist",
        difficulty: "Beginner",
        duration: 12,
        modules: [
          { title: "Understanding the OSI Model", description: "Analyzing packets.", duration: 45 },
          { title: "Subnetting & Networking Protocols", description: "IP addresses, DNS.", duration: 60 }
        ]
      }
    ];
    writeJSON('courses', defaultCourses);
  }

  const users = readJSON('users');
  if (users.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync('adminpassword', salt);
    const studentPassword = bcrypt.hashSync('studentpassword', salt);
    
    writeJSON('users', [
      {
        _id: "u_admin",
        name: "EduFlick Admin",
        email: "admin@eduflick.ai",
        password: adminPassword,
        role: "admin",
        selectedTrack: "AI Engineer",
        skillLevel: "Advanced",
        interests: [],
        createdAt: new Date().toISOString()
      },
      {
        _id: "u_student",
        name: "John Doe",
        email: "john@student.com",
        password: studentPassword,
        role: "student",
        selectedTrack: "AI Engineer",
        skillLevel: "Beginner",
        interests: ["Python", "Machine Learning"],
        createdAt: new Date().toISOString()
      }
    ]);
  }
};

// Initialize JSON database files
checkAndSeedLocalJSON();

module.exports = {
  isMongoConnected,

  // ==========================================
  // USER OPERATIONS
  // ==========================================
  async findUserByEmail(email) {
    if (isMongoConnected()) {
      return await User.findOne({ email }).select('+password');
    }
    const users = readJSON('users');
    return users.find(u => u.email === email) || null;
  },

  async findUserById(id) {
    if (isMongoConnected()) {
      return await User.findById(id).select('-password');
    }
    const users = readJSON('users');
    const user = users.find(u => u._id === id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async createUser(data) {
    if (isMongoConnected()) {
      return await User.create(data);
    }
    const users = readJSON('users');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    const newUser = {
      _id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'student',
      selectedTrack: data.selectedTrack || '',
      skillLevel: data.skillLevel || '',
      interests: data.interests || [],
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeJSON('users', users);
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async updateUser(id, updates) {
    if (isMongoConnected()) {
      return await User.findByIdAndUpdate(id, updates, { new: true });
    }
    const users = readJSON('users');
    const index = users.findIndex(u => u._id === id);
    if (index === -1) return null;

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    users[index] = { ...users[index], ...updates };
    writeJSON('users', users);
    
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  },

  // ==========================================
  // COURSE OPERATIONS
  // ==========================================
  async findCourses(filter = {}) {
    if (isMongoConnected()) {
      return await Course.find(filter);
    }
    let courses = readJSON('courses');
    if (filter.category) {
      courses = courses.filter(c => c.category === filter.category);
    }
    if (filter.difficulty) {
      courses = courses.filter(c => c.difficulty === filter.difficulty);
    }
    return courses;
  },

  async findCourseById(id) {
    if (isMongoConnected()) {
      return await Course.findById(id);
    }
    const courses = readJSON('courses');
    return courses.find(c => c._id === id) || null;
  },

  async createCourse(data) {
    if (isMongoConnected()) {
      return await Course.create(data);
    }
    const courses = readJSON('courses');
    
    // Check duplicate title
    if (courses.some(c => c.title.toLowerCase() === data.title.toLowerCase())) {
      throw new Error('A course with this title already exists');
    }

    const newCourse = {
      _id: 'c_' + Math.random().toString(36).substr(2, 9),
      title: data.title,
      description: data.description,
      category: data.category,
      difficulty: data.difficulty,
      duration: Number(data.duration),
      modules: (data.modules || []).map(m => ({
        _id: 'm_' + Math.random().toString(36).substr(2, 9),
        title: m.title,
        description: m.description || '',
        duration: Number(m.duration || 30)
      })),
      createdAt: new Date().toISOString()
    };

    courses.push(newCourse);
    writeJSON('courses', courses);
    return newCourse;
  },

  async updateCourse(id, updates) {
    if (isMongoConnected()) {
      return await Course.findByIdAndUpdate(id, updates, { new: true });
    }
    const courses = readJSON('courses');
    const index = courses.findIndex(c => c._id === id);
    if (index === -1) return null;

    courses[index] = { ...courses[index], ...updates };
    writeJSON('courses', courses);
    return courses[index];
  },

  async deleteCourse(id) {
    if (isMongoConnected()) {
      return await Course.findByIdAndDelete(id);
    }
    const courses = readJSON('courses');
    const filtered = courses.filter(c => c._id !== id);
    writeJSON('courses', filtered);
    return true;
  },

  // ==========================================
  // PROGRESS OPERATIONS
  // ==========================================
  async findProgressByUser(userId) {
    if (isMongoConnected()) {
      return await Progress.find({ userId }).populate('courseId');
    }
    const progressList = readJSON('progress');
    const userProgress = progressList.filter(p => p.userId === userId);
    
    // Populate Course manually
    const courses = readJSON('courses');
    return userProgress.map(p => {
      const course = courses.find(c => c._id === p.courseId);
      return {
        ...p,
        courseId: course || { _id: p.courseId, title: "Unknown Course", modules: [] }
      };
    });
  },

  async updateProgress(userId, courseId, data) {
    if (isMongoConnected()) {
      // Find or create
      let progress = await Progress.findOne({ userId, courseId });
      const course = await Course.findById(courseId);
      if (!progress) {
        progress = new Progress({ userId, courseId });
      }

      if (data.completedModules !== undefined) {
        progress.completedModules = data.completedModules;
        const total = course.modules.length;
        progress.completionPercentage = total > 0 ? Math.min(100, Math.round((data.completedModules.length / total) * 100)) : 100;
      } else if (data.completionPercentage !== undefined) {
        progress.completionPercentage = data.completionPercentage;
      }

      progress.status = progress.completionPercentage === 0 ? 'Not Started' : (progress.completionPercentage >= 100 ? 'Completed' : 'In Progress');
      progress.lastAccessed = new Date();
      await progress.save();
      return await Progress.findById(progress._id).populate('courseId');
    }

    // JSON fallback
    const progressList = readJSON('progress');
    let progress = progressList.find(p => p.userId === userId && p.courseId === courseId);
    
    const courses = readJSON('courses');
    const course = courses.find(c => c._id === courseId);
    if (!course) throw new Error('Course not found');

    if (!progress) {
      progress = {
        _id: 'p_' + Math.random().toString(36).substr(2, 9),
        userId,
        courseId,
        completedModules: [],
        completionPercentage: 0,
        status: 'Not Started',
        lastAccessed: new Date().toISOString()
      };
      progressList.push(progress);
    }

    if (data.completedModules !== undefined) {
      progress.completedModules = data.completedModules;
      const total = course.modules.length;
      progress.completionPercentage = total > 0 ? Math.min(100, Math.round((data.completedModules.length / total) * 100)) : 100;
    } else if (data.completionPercentage !== undefined) {
      progress.completionPercentage = data.completionPercentage;
    }

    progress.status = progress.completionPercentage === 0 ? 'Not Started' : (progress.completionPercentage >= 100 ? 'Completed' : 'In Progress');
    progress.lastAccessed = new Date().toISOString();
    
    writeJSON('progress', progressList);
    
    return {
      ...progress,
      courseId: course
    };
  },

  // ==========================================
  // LEARNING PATH OPERATIONS
  // ==========================================
  async findLearningPathByUser(userId) {
    if (isMongoConnected()) {
      return await LearningPath.findOne({ userId })
        .populate('recommendedCourses')
        .populate('roadmapStages.courses');
    }
    const paths = readJSON('learningpaths');
    const pathObj = paths.find(p => p.userId === userId);
    if (!pathObj) return null;

    // Populate recommendedCourses and stages.courses
    const courses = readJSON('courses');
    const populatedRecs = (pathObj.recommendedCourses || []).map(id => courses.find(c => c._id === id)).filter(Boolean);
    const populatedStages = (pathObj.roadmapStages || []).map(stage => ({
      ...stage,
      courses: (stage.courses || []).map(id => courses.find(c => c._id === id)).filter(Boolean)
    }));

    return {
      ...pathObj,
      recommendedCourses: populatedRecs,
      roadmapStages: populatedStages
    };
  },

  async updateLearningPath(userId, recommendedCourses, roadmapStages) {
    if (isMongoConnected()) {
      let pathObj = await LearningPath.findOne({ userId });
      if (!pathObj) {
        pathObj = new LearningPath({ userId });
      }
      pathObj.recommendedCourses = recommendedCourses;
      pathObj.roadmapStages = roadmapStages;
      await pathObj.save();
      return await LearningPath.findById(pathObj._id)
        .populate('recommendedCourses')
        .populate('roadmapStages.courses');
    }

    const paths = readJSON('learningpaths');
    let pathObj = paths.find(p => p.userId === userId);
    if (!pathObj) {
      pathObj = {
        _id: 'lp_' + Math.random().toString(36).substr(2, 9),
        userId,
        createdAt: new Date().toISOString()
      };
      paths.push(pathObj);
    }
    pathObj.recommendedCourses = recommendedCourses;
    pathObj.roadmapStages = roadmapStages;
    writeJSON('learningpaths', paths);

    // Populate details before return
    const courses = readJSON('courses');
    return {
      ...pathObj,
      recommendedCourses: (recommendedCourses || []).map(id => courses.find(c => c._id === id)).filter(Boolean),
      roadmapStages: (roadmapStages || []).map(stage => ({
        ...stage,
        courses: (stage.courses || []).map(id => courses.find(c => c._id === id)).filter(Boolean)
      }))
    };
  }
};
