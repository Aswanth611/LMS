import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
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

// Mock Users Database in LocalStorage
const getMockUsers = () => JSON.parse(localStorage.getItem('mock_users') || '[]');
const saveMockUsers = (users) => localStorage.setItem('mock_users', JSON.stringify(users));

// Seed default admin and student if not present
if (getMockUsers().length === 0) {
  saveMockUsers([
    { id: '1', name: 'John Doe', email: 'student@lms.com', password: 'password', role: 'student', track: 'AI Engineer', level: 'Beginner' },
    { id: '2', name: 'Jane Admin', email: 'admin@lms.com', password: 'password', role: 'admin' }
  ]);
}

const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.warn('Backend API login failed. Falling back to local storage mock database.', error.message);
      
      // Local storage mock logic
      const users = getMockUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const mockResponse = {
          token: 'mock-jwt-token-xyz',
          user: { id: user.id, name: user.name, email: user.email, role: user.role, track: user.track || null, level: user.level || null }
        };
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      } else {
        throw new Error('Invalid email or password');
      }
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await axiosInstance.post('/register', { name, email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.warn('Backend API register failed. Falling back to local storage mock database.', error.message);
      
      const users = getMockUsers();
      if (users.find(u => u.email === email)) {
        throw new Error('Email is already registered');
      }

      const newUser = {
        id: String(Date.now()),
        name,
        email,
        password,
        role: 'student',
        track: null,
        level: null
      };

      users.push(newUser);
      saveMockUsers(users);

      const mockResponse = {
        token: 'mock-jwt-token-xyz',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, track: null, level: null }
      };

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      return mockResponse;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/profile', profileData);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      console.warn('Backend API profile update failed. Falling back to local storage mock database.', error.message);
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');

      const users = getMockUsers();
      const userIdx = users.findIndex(u => u.id === currentUser.id);

      if (userIdx !== -1) {
        users[userIdx] = { ...users[userIdx], ...profileData };
        saveMockUsers(users);
        
        const updatedUser = {
          id: users[userIdx].id,
          name: users[userIdx].name,
          email: users[userIdx].email,
          role: users[userIdx].role,
          track: users[userIdx].track || null,
          level: users[userIdx].level || null
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { user: updatedUser };
      }
      throw new Error('User not found');
    }
  }
};

export default authService;
