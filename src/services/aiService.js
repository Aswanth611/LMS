import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/ai';

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

const getRoadmapByTrackAndLevel = (track, level) => {
  const normalizedLevel = level || 'Beginner';
  const stages = {
    'AI Engineer': {
      'Beginner': [
        { id: 's1', title: 'Phase 1: Foundations of AI', description: 'Master AI core philosophies, search methods, and agent definitions.', courses: ['c1'], status: 'active' },
        { id: 's2', title: 'Phase 2: Python Coding & Math', description: 'Deep dive into linear algebra, calculus, and pandas statistics.', courses: ['c7'], status: 'locked' },
        { id: 's3', title: 'Phase 3: Machine Learning Core', description: 'Intro to predictive regression, decision trees, and model scoring.', courses: ['c8'], status: 'locked' }
      ],
      'Intermediate': [
        { id: 's1', title: 'Phase 1: Deep Learning Basics', description: 'Master neural networks, backpropagation, and CNNs.', courses: ['c2'], status: 'active' },
        { id: 's2', title: 'Phase 2: Sequence Models & NLP', description: 'Explore RNNs, Attention layers, and Transformers.', courses: ['c2'], status: 'locked' },
        { id: 's3', title: 'Phase 3: Reinforcement Learning', description: 'Implement Q-learning and Policy Gradient optimization.', courses: [], status: 'locked' }
      ],
      'Advanced': [
        { id: 's1', title: 'Phase 1: LLM Orchestration', description: 'Fine-tuning models using PEFT, LoRA, and training loops.', courses: ['c3'], status: 'active' },
        { id: 's2', title: 'Phase 2: Vector Databases & RAG', description: 'Implement dense retrievers, vector embeddings, and LangChain agents.', courses: ['c3'], status: 'locked' },
        { id: 's3', title: 'Phase 3: AI Agent Swarms', description: 'Build collaborative agent frameworks with autogen/crewAI.', courses: ['c3'], status: 'locked' }
      ]
    },
    'Full Stack Developer': {
      'Beginner': [
        { id: 's1', title: 'Phase 1: Frontend Basics', description: 'Study HTML5 semantic tags, vanilla CSS layouts, and basic JavaScript loops.', courses: ['c4'], status: 'active' },
        { id: 's2', title: 'Phase 2: Modern Styling', description: 'Introduction to Tailwind CSS, responsive media queries, and component architecture.', courses: ['c4'], status: 'locked' },
        { id: 's3', title: 'Phase 3: Basic Git & Command Line', description: 'Learn folder structure, terminal commands, and pushing code to GitHub.', courses: [], status: 'locked' }
      ],
      'Intermediate': [
        { id: 's1', title: 'Phase 1: Component Development', description: 'Deep dive into React.js virtual DOM, states, hooks, and routing.', courses: ['c5'], status: 'active' },
        { id: 's2', title: 'Phase 2: Server API Building', description: 'Create Node/Express servers, REST API paths, and token auth schemas.', courses: ['c5'], status: 'locked' },
        { id: 's3', title: 'Phase 3: Database Management', description: 'Hook up MongoDB schemas, relational models, and query handlers.', courses: ['c5'], status: 'locked' }
      ],
      'Advanced': [
        { id: 's1', title: 'Phase 1: Cloud Orchestration', description: 'Containerize application builds using Docker files.', courses: ['c6'], status: 'active' },
        { id: 's2', title: 'Phase 2: Microservices & K8s', description: 'Manage clusters with Kubernetes deployments and pods.', courses: ['c6'], status: 'locked' },
        { id: 's3', title: 'Phase 3: CI/CD Pipelines', description: 'Build automation scripts and runners using GitHub Actions.', courses: ['c6'], status: 'locked' }
      ]
    },
    'Data Scientist': {
      'Beginner': [
        { id: 's1', title: 'Phase 1: Python Essentials', description: 'Familiarize with Jupyter notebooks, basic numpy, and SQL joins.', courses: ['c7'], status: 'active' },
        { id: 's2', title: 'Phase 2: Descriptive Statistics', description: 'Calculate mean, median, distributions, and probability models.', courses: [], status: 'locked' }
      ],
      'Intermediate': [
        { id: 's1', title: 'Phase 1: Regressive Modelling', description: 'Train logistic regressions and decision trees with scikit-learn.', courses: ['c8'], status: 'active' },
        { id: 's2', title: 'Phase 2: Clustering Algorithms', description: 'Learn K-means, DBSCAN, and dimensionality reduction techniques.', courses: ['c8'], status: 'locked' }
      ],
      'Advanced': [
        { id: 's1', title: 'Phase 1: Time Series & Forecasting', description: 'Create ARIMA, Prophet, and LSTM forecasting scripts.', courses: [], status: 'active' },
        { id: 's2', title: 'Phase 2: Deep Learning for Data', description: 'Build neural predictions and clean tabular datasets.', courses: [], status: 'locked' }
      ]
    },
    'Cyber Security Specialist': {
      'Beginner': [
        { id: 's1', title: 'Phase 1: Shell Commands & Networks', description: 'Familiarize with Linux directories, bash piping, and TCP models.', courses: ['c9'], status: 'active' },
        { id: 's2', title: 'Phase 2: Security Fundamentals', description: 'Introduction to basic cryptography concepts and key setups.', courses: ['c9'], status: 'locked' }
      ],
      'Intermediate': [
        { id: 's1', title: 'Phase 1: Exploit Scanning', description: 'Run vulnerability analysis using Nmap and Nessus tools.', courses: ['m10_2'], status: 'active' },
        { id: 's2', title: 'Phase 2: System Attack Execution', description: 'Study payload execution, shell captures, and Metasploit setups.', courses: ['m10_3'], status: 'locked' }
      ],
      'Advanced': [
        { id: 's1', title: 'Phase 1: Malware Reverse Engineering', description: 'Learn static/dynamic malware disassembly using Ghidra.', courses: [], status: 'active' },
        { id: 's2', title: 'Phase 2: Threat Hunting & SIEM', description: 'Analyze logs in Splunk, trace network package injections.', courses: [], status: 'locked' }
      ]
    }
  };

  const trackStages = stages[track] || stages['AI Engineer'];
  return trackStages[normalizedLevel] || trackStages['Beginner'];
};

const aiService = {
  getLearningPath: async (track, level) => {
    try {
      const response = await axiosInstance.get('/roadmap', { params: { track, level } });
      return response.data;
    } catch (error) {
      console.warn('Backend API getLearningPath failed. Falling back to local mock roadmap.', error.message);
      
      const user = JSON.parse(localStorage.getItem('user'));
      const activeTrack = track || user?.track || 'AI Engineer';
      const activeLevel = level || user?.level || 'Beginner';

      const roadmapStages = getRoadmapByTrackAndLevel(activeTrack, activeLevel);
      
      return {
        track: activeTrack,
        level: activeLevel,
        stages: roadmapStages,
        nextSuggestedActivity: {
          title: activeTrack === 'AI Engineer' ? 'State Search Heuristics' : activeTrack === 'Full Stack Developer' ? 'Flexbox Layouts Practice' : 'Clean data outliers',
          courseId: activeTrack === 'AI Engineer' ? 'c1' : activeTrack === 'Full Stack Developer' ? 'c4' : 'c7',
          reason: 'This aligns with your skill level and builds on the foundational concept you reviewed recently.'
        }
      };
    }
  },

  getAIRecommendations: async (track, level) => {
    try {
      const response = await axiosInstance.get('/recommendations', { params: { track, level } });
      return response.data;
    } catch (error) {
      console.warn('Backend API getAIRecommendations failed. Returning mock recommendations.');
      
      const user = JSON.parse(localStorage.getItem('user'));
      const activeTrack = track || user?.track || 'AI Engineer';
      const activeLevel = level || user?.level || 'Beginner';

      // Generate recommendation cards
      if (activeTrack === 'AI Engineer') {
        return [
          {
            id: 'r1',
            title: 'Neural Networks Decoded',
            reason: 'You have shown strong progress in search algorithms. Deep Learning is the next logical step.',
            difficulty: 'Intermediate',
            matchPercentage: 98,
            link: 'c2'
          },
          {
            id: 'r2',
            title: 'Prompt Engineering Guidelines',
            reason: 'A quick overview will help you optimize your prompts before moving to advanced model tuning.',
            difficulty: 'Beginner',
            matchPercentage: 92,
            link: 'c1'
          }
        ];
      } else if (activeTrack === 'Full Stack Developer') {
        return [
          {
            id: 'r1',
            title: 'React Router & Global Contexts',
            reason: 'Essential for building navigable SPAs. Follows your basic React training.',
            difficulty: 'Intermediate',
            matchPercentage: 95,
            link: 'c5'
          },
          {
            id: 'r2',
            title: 'Dockerizing Node & React apps',
            reason: 'Learn to wrap your client and server configurations into reliable portable packages.',
            difficulty: 'Advanced',
            matchPercentage: 88,
            link: 'c6'
          }
        ];
      } else if (activeTrack === 'Data Scientist') {
        return [
          {
            id: 'r1',
            title: 'Statistical Regression Models',
            reason: 'Required for fitting line equations and binary categorizations to data metrics.',
            difficulty: 'Intermediate',
            matchPercentage: 96,
            link: 'c8'
          }
        ];
      } else {
        return [
          {
            id: 'r1',
            title: 'Ethical Hacking Tools (Nmap)',
            reason: 'Allows scanning IP networks and discovering listening services.',
            difficulty: 'Intermediate',
            matchPercentage: 94,
            link: 'c10'
          }
        ];
      }
    }
  }
};

export default aiService;
