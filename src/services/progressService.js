import axios from 'axios';
import courseService from './courseService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/progress';

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

const progressService = {
  getProgressStats: async () => {
    try {
      const response = await axiosInstance.get('/stats');
      return response.data;
    } catch (error) {
      console.warn('Backend API getProgressStats failed. Falling back to local computation.', error.message);
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('Not authenticated');

      const allCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      
      // Filter courses matching user's selected track
      const trackCourses = user.track ? allCourses.filter(c => c.track === user.track) : [];
      
      let totalModules = 0;
      let completedModules = 0;
      let completedCoursesCount = 0;
      let activeCoursesCount = 0;

      trackCourses.forEach(c => {
        let courseCompletedModules = 0;
        c.modules.forEach(m => {
          totalModules++;
          if (m.completed) {
            completedModules++;
            courseCompletedModules++;
          }
        });

        if (courseCompletedModules > 0) {
          if (courseCompletedModules === c.modules.length) {
            completedCoursesCount++;
          } else {
            activeCoursesCount++;
          }
        }
      });

      // Calculate track progress
      const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

      return {
        progressPercent,
        completedCourses: completedCoursesCount,
        activeCourses: activeCoursesCount || (user.track ? 1 : 0), // fallback if enrolled but 0 modules done
        studyHours: Math.round(completedModules * 3.5 + 4.2), // dynamic hours based on modules
        rank: progressPercent > 80 ? 'Top 5%' : progressPercent > 40 ? 'Top 15%' : 'Top 45%',
        certificates: completedCoursesCount,
        upcomingTasks: [
          { id: 't1', title: 'Complete next module in track', dueDate: 'Tomorrow', urgency: 'High' },
          { id: 't2', title: 'AI Ethics assignment', dueDate: 'In 3 days', urgency: 'Medium' },
          { id: 't3', title: 'Practice Coding Sandbox', dueDate: 'Next week', urgency: 'Low' }
        ]
      };
    }
  },

  getActivityFeed: async () => {
    try {
      const response = await axiosInstance.get('/activity');
      return response.data;
    } catch (error) {
      console.warn('Backend API getActivityFeed failed. Returning mock feed.');
      
      const user = JSON.parse(localStorage.getItem('user'));
      const track = user?.track || 'None';

      const baseFeed = [
        { id: 'a1', text: `Enrolled in the ${track} learning track.`, time: '3 days ago' },
        { id: 'a2', text: 'Completed account registration.', time: '3 days ago' },
      ];

      // Add dynamic logs based on completed modules
      const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      const completedModules = [];
      courses.forEach(c => {
        c.modules.forEach(m => {
          if (m.completed) {
            completedModules.push({
              id: m.id,
              text: `Completed module "${m.title}" in ${c.title}.`,
              time: 'Just now'
            });
          }
        });
      });

      return [...completedModules, ...baseFeed];
    }
  },

  getLearningHoursData: async () => {
    try {
      const response = await axiosInstance.get('/charts/hours');
      return response.data;
    } catch (error) {
      console.warn('Backend API getLearningHoursData failed. Returning mock data.');
      
      // Generate some chart data
      return [
        { day: 'Mon', hours: 1.5, avg: 2.0 },
        { day: 'Tue', hours: 3.0, avg: 2.0 },
        { day: 'Wed', hours: 0.5, avg: 2.0 },
        { day: 'Thu', hours: 4.2, avg: 2.0 },
        { day: 'Fri', hours: 2.1, avg: 2.0 },
        { day: 'Sat', hours: 1.2, avg: 2.0 },
        { day: 'Sun', hours: 3.5, avg: 2.0 }
      ];
    }
  }
};

export default progressService;
