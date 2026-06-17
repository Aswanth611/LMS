import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const getBaseURL = () => {
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:5000/api";
  }
  return "https://ai-lms-backend-74qm.onrender.com/api";
};

const API_URL = getBaseURL();

// Set up default axios base url
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set auth token header globally
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Check for stored token and load profile
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await axios.get('/users/profile');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            setAuthToken(null);
          }
        } catch (err) {
          console.error('Failed to load user profile on startup:', err);
          // If token is invalid or expired
          if (err.response && err.response.status === 401) {
            setAuthToken(null);
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register User
  const register = async (name, email, password, role = 'student') => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        setAuthToken(res.data.token);
        setUser(res.data.user);
        setLoading(false);
        return true;
      }
    } catch (err) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        setError('Could not connect to the backend server. Please make sure the backend is running!');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
      setLoading(false);
      return false;
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.success) {
        setAuthToken(res.data.token);
        setUser(res.data.user);
        setLoading(false);
        return true;
      }
    } catch (err) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        setError('Could not connect to the backend server. Please make sure the backend is running!');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
      setLoading(false);
      return false;
    }
  };

  // Logout User
  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  // Update Profile/Track selections
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await axios.put('/users/profile', profileData);
      if (res.data.success) {
        setUser(res.data.user);
        return true;
      }
    } catch (err) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        setError('Could not connect to the backend server. Please make sure the backend is running!');
      } else {
        setError(err.response?.data?.message || 'Failed to update profile');
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        setError,
        sidebarOpen,
        setSidebarOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
