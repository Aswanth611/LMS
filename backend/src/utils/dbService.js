const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const LearningPath = require('../models/LearningPath');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');

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
  let updated = false;

  const adminExists = users.some(u => u.email === 'admin@eduflick.ai');
  const studentExists = users.some(u => u.email === 'john@student.com');
  const mentorExists = users.some(u => u.email === 'mentor@eduflick.ai');

  const salt = bcrypt.genSaltSync(10);

  if (!adminExists) {
    users.push({
      _id: "u_admin",
      name: "EduFlick Admin",
      email: "admin@eduflick.ai",
      password: bcrypt.hashSync('adminpassword', salt),
      role: "admin",
      selectedTrack: "AI Engineer",
      skillLevel: "Advanced",
      interests: [],
      createdAt: new Date().toISOString()
    });
    updated = true;
  }

  if (!studentExists) {
    users.push({
      _id: "u_student",
      name: "John Doe",
      email: "john@student.com",
      password: bcrypt.hashSync('studentpassword', salt),
      role: "student",
      selectedTrack: "AI Engineer",
      skillLevel: "Beginner",
      interests: ["Python", "Machine Learning"],
      createdAt: new Date().toISOString()
    });
    updated = true;
  }

  if (!mentorExists) {
    users.push({
      _id: "u_mentor",
      name: "Mentor User",
      email: "mentor@eduflick.ai",
      password: bcrypt.hashSync('mentorpassword', salt),
      role: "mentor",
      selectedTrack: "AI Engineer",
      skillLevel: "",
      interests: [],
      createdAt: new Date().toISOString()
    });
    updated = true;
  }

  if (updated) {
    writeJSON('users', users);
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

      if (data.quizScore !== undefined) {
        progress.quizScore = Number(data.quizScore);
        progress.quizPassed = Number(data.quizScore) >= 60;
      }

      if (progress.completionPercentage >= 100 && progress.quizPassed) {
        progress.status = 'Completed';
      } else if (progress.completionPercentage > 0) {
        progress.status = 'In Progress';
      } else {
        progress.status = 'Not Started';
      }

      if (progress.quizPassed) {
        try {
          const LearningPath = require('../models/LearningPath');
          const learningPath = await LearningPath.findOne({ userId });
          if (learningPath) {
            const stageIdx = learningPath.roadmapStages.findIndex(s => 
              s.courses && s.courses.length > 0 && s.courses[0].toString() === courseId.toString()
            );
            if (stageIdx !== -1) {
              const phaseId = stageIdx + 1;
              const nextPhase = phaseId + 1;
              
              let unlockedPhases = (learningPath.unlockedPhases || [1]).map(Number);
              if (!unlockedPhases.includes(Number(nextPhase))) {
                unlockedPhases.push(Number(nextPhase));
              }

              let completedPhases = learningPath.completedPhases || [];
              const existingIdx = completedPhases.findIndex(cp => cp.phaseId === phaseId);
              const phaseInfo = { phaseId: phaseId, quizScore: progress.quizScore, completed: true };
              if (existingIdx !== -1) {
                completedPhases[existingIdx] = phaseInfo;
              } else {
                completedPhases.push(phaseInfo);
              }

              learningPath.currentPhase = Math.max(learningPath.currentPhase || 1, nextPhase);
              learningPath.completedPhases = completedPhases;
              learningPath.unlockedPhases = unlockedPhases;
              learningPath.markModified('completedPhases');
              learningPath.markModified('unlockedPhases');
              await learningPath.save();
            }
          }
        } catch (err) {
          console.error('Failed to auto-unlock next phase in MongoDB mode:', err);
        }
      }

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
        quizScore: -1,
        quizPassed: false,
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

    if (data.quizScore !== undefined) {
      progress.quizScore = Number(data.quizScore);
      progress.quizPassed = Number(data.quizScore) >= 60;
    }

    if (progress.completionPercentage >= 100 && progress.quizPassed) {
      progress.status = 'Completed';
    } else if (progress.completionPercentage > 0) {
      progress.status = 'In Progress';
    } else {
      progress.status = 'Not Started';
    }

    if (progress.quizPassed) {
      try {
        const learningPath = await module.exports.findLearningPathByUser(userId.toString());
        if (learningPath) {
          const stageIdx = learningPath.roadmapStages.findIndex(s => 
            s.courses && s.courses.length > 0 && (s.courses[0]._id || s.courses[0].id || s.courses[0]).toString() === courseId.toString()
          );
          if (stageIdx !== -1) {
            const phaseId = stageIdx + 1;
            const nextPhase = phaseId + 1;

            let unlockedPhases = (learningPath.unlockedPhases || [1]).map(Number);
            if (!unlockedPhases.includes(Number(nextPhase))) {
              unlockedPhases.push(Number(nextPhase));
            }

            let completedPhases = learningPath.completedPhases || [];
            const existingIdx = completedPhases.findIndex(cp => cp.phaseId === phaseId);
            const phaseInfo = { phaseId: phaseId, quizScore: progress.quizScore, completed: true };
            if (existingIdx !== -1) {
              completedPhases[existingIdx] = phaseInfo;
            } else {
              completedPhases.push(phaseInfo);
            }

            await module.exports.updateLearningPathProgression(
              userId.toString(),
              Math.max(learningPath.currentPhase || 1, nextPhase),
              completedPhases,
              unlockedPhases
            );
          }
        }
      } catch (err) {
        console.error('Failed to auto-unlock next phase in JSON fallback mode:', err);
      }
    }

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

    if (pathObj.currentPhase === undefined) pathObj.currentPhase = 1;
    if (pathObj.completedPhases === undefined) pathObj.completedPhases = [];
    if (pathObj.unlockedPhases === undefined) pathObj.unlockedPhases = [1];

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
        currentPhase: 1,
        completedPhases: [],
        unlockedPhases: [1],
        createdAt: new Date().toISOString()
      };
      paths.push(pathObj);
    }
    if (pathObj.currentPhase === undefined) pathObj.currentPhase = 1;
    if (pathObj.completedPhases === undefined) pathObj.completedPhases = [];
    if (pathObj.unlockedPhases === undefined) pathObj.unlockedPhases = [1];

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
  },

  // ==========================================
  // PROJECT OPERATIONS
  // ==========================================
  async createProject(data) {
    if (isMongoConnected()) {
      return await Project.create(data);
    }
    const projects = readJSON('projects');
    const newProject = {
      _id: 'proj_' + Math.random().toString(36).substr(2, 9),
      ...data,
      status: data.status || 'Pending Mentor Review',
      mentorFeedback: data.mentorFeedback || '',
      submittedDate: new Date().toISOString()
    };
    projects.push(newProject);
    writeJSON('projects', projects);
    return newProject;
  },

  async findProjects(filter = {}) {
    if (isMongoConnected()) {
      return await Project.find(filter).populate('studentId').populate('courseId');
    }
    let projects = readJSON('projects');
    if (filter.studentId) projects = projects.filter(p => p.studentId === filter.studentId.toString());
    if (filter.courseId) projects = projects.filter(p => p.courseId === filter.courseId.toString());
    if (filter.status) projects = projects.filter(p => p.status === filter.status);

    const users = readJSON('users');
    const courses = readJSON('courses');
    return projects.map(p => {
      const student = users.find(u => u._id === p.studentId);
      const course = courses.find(c => c._id === p.courseId);
      return {
        ...p,
        studentId: student || { _id: p.studentId, name: "Unknown" },
        courseId: course || { _id: p.courseId, title: "Unknown" }
      };
    });
  },

  async findProjectById(id) {
    if (isMongoConnected()) {
      return await Project.findById(id).populate('studentId').populate('courseId');
    }
    const projects = readJSON('projects');
    const project = projects.find(p => p._id === id);
    if (!project) return null;
    const users = readJSON('users');
    const courses = readJSON('courses');
    const student = users.find(u => u._id === project.studentId);
    const course = courses.find(c => c._id === project.courseId);
    return {
      ...project,
      studentId: student || { _id: project.studentId, name: "Unknown" },
      courseId: course || { _id: project.courseId, title: "Unknown" }
    };
  },

  async updateProject(id, updates) {
    if (isMongoConnected()) {
      return await Project.findByIdAndUpdate(id, updates, { new: true }).populate('studentId').populate('courseId');
    }
    const projects = readJSON('projects');
    const idx = projects.findIndex(p => p._id === id);
    if (idx === -1) return null;
    projects[idx] = { ...projects[idx], ...updates };
    writeJSON('projects', projects);
    return this.findProjectById(id);
  },

  // ==========================================
  // CERTIFICATE OPERATIONS
  // ==========================================
  async createCertificate(data) {
    if (isMongoConnected()) {
      return await Certificate.create(data);
    }
    const certificates = readJSON('certificates');
    const newCert = {
      _id: 'cert_' + Math.random().toString(36).substr(2, 9),
      ...data,
      issueDate: new Date().toISOString()
    };
    certificates.push(newCert);
    writeJSON('certificates', certificates);
    return newCert;
  },

  async findCertificates(filter = {}) {
    if (isMongoConnected()) {
      return await Certificate.find(filter).populate('studentId').populate('courseId');
    }
    let certs = readJSON('certificates');
    if (filter.studentId) certs = certs.filter(c => c.studentId === filter.studentId.toString());
    if (filter.courseId) certs = certs.filter(c => c.courseId === filter.courseId.toString());
    if (filter.certificateId) certs = certs.filter(c => c.certificateId === filter.certificateId);

    const users = readJSON('users');
    const courses = readJSON('courses');
    return certs.map(c => {
      const student = users.find(u => u._id === c.studentId);
      const course = courses.find(co => co._id === c.courseId);
      return {
        ...c,
        studentId: student || { _id: c.studentId, name: "Unknown" },
        courseId: course || { _id: c.courseId, title: "Unknown" }
      };
    });
  },

  async findCertificateById(id) {
    if (isMongoConnected()) {
      return await Certificate.findById(id).populate('studentId').populate('courseId');
    }
    const certs = readJSON('certificates');
    const cert = certs.find(c => c._id === id);
    if (!cert) return null;
    const users = readJSON('users');
    const courses = readJSON('courses');
    const student = users.find(u => u._id === cert.studentId);
    const course = courses.find(co => co._id === cert.courseId);
    return {
      ...cert,
      studentId: student || { _id: cert.studentId, name: "Unknown" },
      courseId: course || { _id: cert.courseId, title: "Unknown" }
    };
  },

  async updateLearningPathProgression(userId, currentPhase, completedPhases, unlockedPhases) {
    if (isMongoConnected()) {
      let pathObj = await LearningPath.findOne({ userId });
      if (pathObj) {
        pathObj.currentPhase = currentPhase;
        pathObj.completedPhases = completedPhases;
        pathObj.unlockedPhases = unlockedPhases;
        pathObj.markModified('completedPhases');
        pathObj.markModified('unlockedPhases');
        await pathObj.save();
      }
      return pathObj;
    }
    const paths = readJSON('learningpaths');
    let pathObj = paths.find(p => p.userId === userId.toString());
    if (pathObj) {
      pathObj.currentPhase = currentPhase;
      pathObj.completedPhases = completedPhases;
      pathObj.unlockedPhases = unlockedPhases;
      writeJSON('learningpaths', paths);
    }
    return pathObj;
  }
};
