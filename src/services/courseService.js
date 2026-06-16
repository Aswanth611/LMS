import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/courses';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock Courses Data
const DEFAULT_COURSES = [
  // AI Engineer Tracks
  {
    id: 'c1',
    title: 'Introduction to Artificial Intelligence',
    description: 'Learn the core concepts of AI, state search, neural networks, and prompt engineering.',
    track: 'AI Engineer',
    level: 'Beginner',
    duration: '4 weeks',
    modules: [
      { id: 'm1_1', title: 'What is Artificial Intelligence?', duration: '3 hours', completed: false },
      { id: 'm1_2', title: 'Search Algorithms & Heuristics', duration: '4 hours', completed: false },
      { id: 'm1_3', title: 'Foundations of Neural Networks', duration: '5 hours', completed: false },
      { id: 'm1_4', title: 'Introduction to Prompt Engineering', duration: '3 hours', completed: false }
    ],
    enrolledCount: 154,
    rating: 4.8
  },
  {
    id: 'c2',
    title: 'Deep Learning & Neural Networks',
    description: 'Master backpropagation, convolutional networks, recurrent networks, and transformers.',
    track: 'AI Engineer',
    level: 'Intermediate',
    duration: '6 weeks',
    modules: [
      { id: 'm2_1', title: 'Deep Feedforward Networks', duration: '5 hours', completed: false },
      { id: 'm2_2', title: 'Convolutional Neural Networks (CNNs)', duration: '6 hours', completed: false },
      { id: 'm2_3', title: 'Recurrent Neural Networks (RNNs) & LSTMs', duration: '5 hours', completed: false },
      { id: 'm2_4', title: 'Attention Mechanism & Transformers', duration: '8 hours', completed: false }
    ],
    enrolledCount: 98,
    rating: 4.9
  },
  {
    id: 'c3',
    title: 'LLM Fine-Tuning & Custom AI Agents',
    description: 'Build, fine-tune, and deploy custom large language models and multi-agent AI ecosystems.',
    track: 'AI Engineer',
    level: 'Advanced',
    duration: '8 weeks',
    modules: [
      { id: 'm3_1', title: 'Parameter-Efficient Fine-Tuning (PEFT/LoRA)', duration: '8 hours', completed: false },
      { id: 'm3_2', title: 'Retrieval-Augmented Generation (RAG) at Scale', duration: '7 hours', completed: false },
      { id: 'm3_3', title: 'AI Agent Architectures (LangGraph & Autogen)', duration: '10 hours', completed: false },
      { id: 'm3_4', title: 'Evaluation and Safe Deployment of LLMs', duration: '6 hours', completed: false }
    ],
    enrolledCount: 45,
    rating: 4.7
  },

  // Full Stack Developer Tracks
  {
    id: 'c4',
    title: 'Web Development Basics (HTML, CSS, JS)',
    description: 'Start your coding journey with core front-end languages and modern layout strategies.',
    track: 'Full Stack Developer',
    level: 'Beginner',
    duration: '4 weeks',
    modules: [
      { id: 'm4_1', title: 'HTML5 Semantic Layouts', duration: '3 hours', completed: false },
      { id: 'm4_2', title: 'CSS3, Flexbox, and CSS Grid layout', duration: '4 hours', completed: false },
      { id: 'm4_3', title: 'JavaScript Syntax & DOM Manipulation', duration: '6 hours', completed: false },
      { id: 'm4_4', title: 'Responsive Design & Media Queries', duration: '4 hours', completed: false }
    ],
    enrolledCount: 320,
    rating: 4.6
  },
  {
    id: 'c5',
    title: 'React & Node.js Frontend-to-Backend',
    description: 'Connect a React.js client application to an Express.js Node server using Axios APIs and database management.',
    track: 'Full Stack Developer',
    level: 'Intermediate',
    duration: '6 weeks',
    modules: [
      { id: 'm5_1', title: 'React State, Hooks, and Component Patterns', duration: '6 hours', completed: false },
      { id: 'm5_2', title: 'Express Server & RESTful API Routing', duration: '5 hours', completed: false },
      { id: 'm5_3', title: 'Connecting MongoDB using Mongoose', duration: '6 hours', completed: false },
      { id: 'm5_4', title: 'JWT Authentication & Authorization Flows', duration: '6 hours', completed: false }
    ],
    enrolledCount: 210,
    rating: 4.7
  },
  {
    id: 'c6',
    title: 'Cloud-Native Full Stack Deployments & Kubernetes',
    description: 'Deploy MERN stack apps to AWS, containerize with Docker, and orchestrate with Kubernetes.',
    track: 'Full Stack Developer',
    level: 'Advanced',
    duration: '8 weeks',
    modules: [
      { id: 'm6_1', title: 'Dockerizing Client and Server Apps', duration: '5 hours', completed: false },
      { id: 'm6_2', title: 'Kubernetes Pods, Services, and Deployments', duration: '8 hours', completed: false },
      { id: 'm6_3', title: 'CI/CD Pipelines with GitHub Actions', duration: '6 hours', completed: false },
      { id: 'm6_4', title: 'AWS EC2, ECS, and Serverless deployments', duration: '8 hours', completed: false }
    ],
    enrolledCount: 78,
    rating: 4.8
  },

  // Data Scientist Tracks
  {
    id: 'c7',
    title: 'Python for Data Analysis & SQL Foundations',
    description: 'Learn SQL databases and Python libraries like NumPy and Pandas for manipulating datasets.',
    track: 'Data Scientist',
    level: 'Beginner',
    duration: '4 weeks',
    modules: [
      { id: 'm7_1', title: 'Introduction to Python & Jupyter Notebooks', duration: '3 hours', completed: false },
      { id: 'm7_2', title: 'NumPy Arrays & Mathematical Operators', duration: '4 hours', completed: false },
      { id: 'm7_3', title: 'Pandas DataFrames: Cleaning & Aggregation', duration: '6 hours', completed: false },
      { id: 'm7_4', title: 'SQL Joins, Group By, and Database Queries', duration: '5 hours', completed: false }
    ],
    enrolledCount: 245,
    rating: 4.7
  },
  {
    id: 'c8',
    title: 'Machine Learning Classification & Regression',
    description: 'Build predictive models using Scikit-Learn. Learn linear regression, decision trees, and random forests.',
    track: 'Data Scientist',
    level: 'Intermediate',
    duration: '6 weeks',
    modules: [
      { id: 'm8_1', title: 'Linear & Logistic Regression Models', duration: '5 hours', completed: false },
      { id: 'm8_2', title: 'Decision Trees, Random Forests, & Boosting', duration: '6 hours', completed: false },
      { id: 'm8_3', title: 'Clustering: K-Means & Hierarchical Models', duration: '5 hours', completed: false },
      { id: 'm8_4', title: 'Model Evaluation, Bias, Variance, & Overfitting', duration: '5 hours', completed: false }
    ],
    enrolledCount: 130,
    rating: 4.8
  },

  // Cyber Security Tracks
  {
    id: 'c9',
    title: 'Introduction to Network Security & Linux',
    description: 'Understand TCP/IP protocols, networking hardware, and basic Linux administration commands.',
    track: 'Cyber Security Specialist',
    level: 'Beginner',
    duration: '4 weeks',
    modules: [
      { id: 'm9_1', title: 'Linux Command Line Foundations', duration: '4 hours', completed: false },
      { id: 'm9_2', title: 'OSI Model & Networking Protocols (TCP/UDP)', duration: '4 hours', completed: false },
      { id: 'm9_3', title: 'Firewalls, NAT, and Router Configurations', duration: '3 hours', completed: false },
      { id: 'm9_4', title: 'Intro to Cryptography (Symmetric vs Asymmetric)', duration: '4 hours', completed: false }
    ],
    enrolledCount: 180,
    rating: 4.7
  },
  {
    id: 'c10',
    title: 'Ethical Hacking & Penetration Testing',
    description: 'Learn vulnerability analysis, port scanning with Nmap, and exploitation using Metasploit.',
    track: 'Cyber Security Specialist',
    level: 'Intermediate',
    duration: '6 weeks',
    modules: [
      { id: 'm10_1', title: 'Information Gathering & Reconnaissance', duration: '5 hours', completed: false },
      { id: 'm10_2', title: 'Vulnerability Assessment with Nmap & Nessus', duration: '6 hours', completed: false },
      { id: 'm10_3', title: 'Exploitation Techniques using Metasploit', duration: '7 hours', completed: false },
      { id: 'm10_4', title: 'Web Application Hacking (OWASP Top 10)', duration: '7 hours', completed: false }
    ],
    enrolledCount: 110,
    rating: 4.9
  }
];

const getMockCourses = () => {
  const stored = localStorage.getItem('mock_courses');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('mock_courses', JSON.stringify(DEFAULT_COURSES));
  return DEFAULT_COURSES;
};

const saveMockCourses = (courses) => {
  localStorage.setItem('mock_courses', JSON.stringify(courses));
};

const courseService = {
  getCourses: async (track, level) => {
    try {
      const response = await axiosInstance.get('/', { params: { track, level } });
      return response.data;
    } catch (error) {
      console.warn('Backend API getCourses failed. Falling back to local storage mock.', error.message);
      let list = getMockCourses();
      if (track) list = list.filter(c => c.track === track);
      if (level) list = list.filter(c => c.level === level);
      return list;
    }
  },

  getCourseById: async (id) => {
    try {
      const response = await axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Backend API getCourseById failed. Falling back to local storage mock.', error.message);
      const list = getMockCourses();
      const course = list.find(c => c.id === id);
      if (!course) throw new Error('Course not found');
      return course;
    }
  },

  updateModuleProgress: async (courseId, moduleId, completed) => {
    try {
      const response = await axiosInstance.put(`/${courseId}/modules/${moduleId}`, { completed });
      return response.data;
    } catch (error) {
      console.warn('Backend API updateModuleProgress failed. Falling back to local storage mock.', error.message);
      const list = getMockCourses();
      const courseIdx = list.findIndex(c => c.id === courseId);
      
      if (courseIdx !== -1) {
        const moduleIdx = list[courseIdx].modules.findIndex(m => m.id === moduleId);
        if (moduleIdx !== -1) {
          list[courseIdx].modules[moduleIdx].completed = completed;
          saveMockCourses(list);
          return list[courseIdx];
        }
      }
      throw new Error('Course or module not found');
    }
  },

  // Admin Methods
  createCourse: async (courseData) => {
    try {
      const response = await axiosInstance.post('/', courseData);
      return response.data;
    } catch (error) {
      console.warn('Backend API createCourse failed. Falling back to local storage mock.', error.message);
      const list = getMockCourses();
      const newCourse = {
        id: String(Date.now()),
        ...courseData,
        modules: courseData.modules ? courseData.modules.map((m, idx) => ({
          id: `m_${Date.now()}_${idx}`,
          title: m.title || 'Untitled Module',
          duration: m.duration || '2 hours',
          completed: false
        })) : [],
        enrolledCount: 0,
        rating: 5.0
      };
      list.push(newCourse);
      saveMockCourses(list);
      return newCourse;
    }
  },

  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axiosInstance.put(`/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.warn('Backend API updateCourse failed. Falling back to local storage mock.', error.message);
      const list = getMockCourses();
      const idx = list.findIndex(c => c.id === courseId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...courseData };
        saveMockCourses(list);
        return list[idx];
      }
      throw new Error('Course not found');
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/${courseId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend API deleteCourse failed. Falling back to local storage mock.', error.message);
      let list = getMockCourses();
      list = list.filter(c => c.id !== courseId);
      saveMockCourses(list);
      return { success: true, message: 'Course deleted successfully' };
    }
  }
};

export default courseService;
