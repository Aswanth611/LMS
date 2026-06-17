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

const courses = [
  // AI Engineer Track
  {
    title: "Python Fundamentals for AI",
    description: "Learn Python programming language essentials tailored specifically for data manipulation, scripting, and basic AI computations. Covers core syntax, lists, dictionaries, functions, and standard libraries.",
    category: "AI Engineer",
    difficulty: "Beginner",
    duration: 10,
    modules: [
      { title: "Introduction to Python syntax", description: "Variables, data types, and basic arithmetic operators.", duration: 30 },
      { title: "Control Flow & Functions", description: "If statements, loops, and custom function definitions.", duration: 45 },
      { title: "Data Structures in Python", description: "Working with lists, dictionaries, sets, and tuples.", duration: 60 },
      { title: "NumPy Basics", description: "Multi-dimensional arrays and matrix operations.", duration: 90 }
    ]
  },
  {
    title: "Machine Learning Essentials",
    description: "An end-to-end guide to modern machine learning. Dive deep into supervised and unsupervised learning, regression, classification, clustering, evaluation metrics, and the Scikit-Learn library.",
    category: "AI Engineer",
    difficulty: "Intermediate",
    duration: 20,
    modules: [
      { title: "Introduction to ML & Supervised Learning", description: "Linear and logistic regression, decision trees.", duration: 60 },
      { title: "Unsupervised Learning Algorithms", description: "K-Means clustering and PCA dimensionality reduction.", duration: 90 },
      { title: "Model Evaluation & Selection", description: "Cross-validation, precision-recall, and ROC-AUC.", duration: 60 },
      { title: "Hands-on Scikit-Learn Projects", description: "Building predictive systems with structured data.", duration: 120 }
    ]
  },
  {
    title: "Deep Learning & Neural Networks",
    description: "Unlock the power of neural networks. Master Feedforward networks, Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs), and Transformers using PyTorch and TensorFlow.",
    category: "AI Engineer",
    difficulty: "Advanced",
    duration: 30,
    modules: [
      { title: "Understanding Neural Network Mathematics", description: "Forward propagation, backpropagation, and loss functions.", duration: 90 },
      { title: "Convolutional Networks (CNNs)", description: "Image classification and computer vision concepts.", duration: 120 },
      { title: "Recurrent Networks & NLP", description: "LSTMs and sequence modeling basics.", duration: 90 },
      { title: "Transformers and LLMs", description: "The attention mechanism and pre-trained models.", duration: 150 }
    ]
  },
  {
    title: "AI Projects & System Deployment",
    description: "Learn how to build real-world AI applications and package them as APIs. Cover Flask/FastAPI deployments, Docker containerization, and monitoring models in production.",
    category: "AI Engineer",
    difficulty: "Advanced",
    duration: 15,
    modules: [
      { title: "Designing AI APIs", description: "Building inference pipelines with FastAPI.", duration: 60 },
      { title: "Containerizing Models", description: "Writing Dockerfiles for deep learning servers.", duration: 90 },
      { title: "Cloud Deployment Basics", description: "Deploying model containers to cloud providers.", duration: 90 }
    ]
  },

  // Full Stack Developer Track
  {
    title: "HTML, CSS & JavaScript Fundamentals",
    description: "The core building blocks of the web. Learn HTML5 for structure, CSS3 for styling and responsive designs, and JavaScript for client-side interactivity.",
    category: "Full Stack Developer",
    difficulty: "Beginner",
    duration: 12,
    modules: [
      { title: "HTML5 Semantic Structure", description: "Layout tags, tables, forms, and attributes.", duration: 30 },
      { title: "CSS3 layouts: Flexbox & Grid", description: "Creating fluid, responsive grids and designs.", duration: 60 },
      { title: "Modern JavaScript (ES6+)", description: "Variables, arrow functions, promises, and array methods.", duration: 90 },
      { title: "DOM Manipulation & Events", description: "Handling click events and dynamically editing page contents.", duration: 60 }
    ]
  },
  {
    title: "React & Frontend Architecture",
    description: "Learn the leading frontend library for building component-based SPAs. Master props, hooks (useState, useEffect, useContext), routing, and clean component structures.",
    category: "Full Stack Developer",
    difficulty: "Intermediate",
    duration: 25,
    modules: [
      { title: "Component Basics & Props", description: "Designing reusable interface pieces.", duration: 45 },
      { title: "State Management", description: "Handling state locally and via React Context API.", duration: 90 },
      { title: "React Router Navigation", description: "Configuring multi-page React applications.", duration: 60 },
      { title: "Fetching APIs with Axios", description: "Linking React interfaces to server data.", duration: 60 }
    ]
  },
  {
    title: "Node.js & Express API Development",
    description: "Master server-side development. Learn how to write secure RESTful APIs with Node.js, Express, and MongoDB. Covers authentication, CORS, file uploads, and middleware creation.",
    category: "Full Stack Developer",
    difficulty: "Intermediate",
    duration: 20,
    modules: [
      { title: "Node.js Basics & Core Modules", description: "Event loop, file system, and HTTP module.", duration: 45 },
      { title: "Express Server & Routing", description: "Defining controllers, middleware, and routers.", duration: 60 },
      { title: "Mongoose ODM Integration", description: "Connecting databases and executing queries.", duration: 90 },
      { title: "JWT & Bcrypt Security", description: "Hashing credentials and validating JSON Web Tokens.", duration: 90 }
    ]
  },
  {
    title: "Scalable Full Stack System Design",
    description: "Take your development skills to the next level. Learn about databases sharding, caching layers (Redis), queue systems, load balancers, and architectural patterns like Microservices.",
    category: "Full Stack Developer",
    difficulty: "Advanced",
    duration: 18,
    modules: [
      { title: "System Bottlenecks & Caching", description: "Implementing Redis caching in Express apps.", duration: 60 },
      { title: "Message Queues & Background Workers", description: "Processing high-cost tasks with Bull or RabbitMQ.", duration: 90 },
      { title: "Microservices vs Monoliths", description: "Structuring APIs as distributed systems.", duration: 90 }
    ]
  },

  // Data Scientist Track
  {
    title: "Introduction to Data Science with Python",
    description: "Get started with the field of data science. Learn how to inspect, clean, and manipulate datasets using Pandas and NumPy libraries in Jupyter Notebooks.",
    category: "Data Scientist",
    difficulty: "Beginner",
    duration: 10,
    modules: [
      { title: "Introduction to Jupyter & Pandas", description: "Loading CSV files and exploring DataFrames.", duration: 45 },
      { title: "Data Wrangling & Cleaning", description: "Handling missing values, duplicate entries, and sorting.", duration: 60 },
      { title: "Grouping & Aggregations", description: "Using groupby and summary stats to extract insights.", duration: 60 }
    ]
  },
  {
    title: "Statistical Data Analysis & Visualization",
    description: "Discover patterns through numbers and graphics. Learn descriptive stats, hypothesis testing, probability, and custom plotting using Matplotlib and Seaborn.",
    category: "Data Scientist",
    difficulty: "Intermediate",
    duration: 15,
    modules: [
      { title: "Probability & Distributions", description: "Normal, Binomial, and Poisson distributions.", duration: 60 },
      { title: "Hypothesis Testing", description: "T-tests, Chi-square tests, and p-value interpretations.", duration: 60 },
      { title: "Creating Beautiful Visuals", description: "Customizing line charts, bar plots, and heatmaps.", duration: 90 }
    ]
  },

  // Cyber Security Specialist Track
  {
    title: "Introduction to Cyber Security & Networking",
    description: "Learn the core foundations of system protection. Master the TCP/IP stack, routing protocols, firewalls, and modern encryption standards.",
    category: "Cyber Security Specialist",
    difficulty: "Beginner",
    duration: 12,
    modules: [
      { title: "Understanding the OSI Model", description: "Analyzing packets layer by layer.", duration: 45 },
      { title: "Subnetting & Networking Protocols", description: "IP addresses, DNS, DHCP, and SSH.", duration: 60 },
      { title: "Firewalls & Access Controls", description: "Configuring rules to block unauthorized connections.", duration: 45 }
    ]
  },
  {
    title: "Ethical Hacking & Penetration Testing",
    description: "Learn how hackers think. Run penetration testing workflows: reconnaissance, scanning, vulnerability assessment, exploitation, and reporting using Kali Linux tools.",
    category: "Cyber Security Specialist",
    difficulty: "Intermediate",
    duration: 24,
    modules: [
      { title: "Reconnaissance & Scanning", description: "Using Nmap, Whois, and Shodan to gather intelligence.", duration: 60 },
      { title: "Web Application Vulnerabilities", description: "Exploiting SQL Injection and Cross-Site Scripting (XSS).", duration: 90 },
      { title: "Metasploit Basics", description: "Launching exploits against legacy target boxes.", duration: 90 }
    ]
  }
];

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
