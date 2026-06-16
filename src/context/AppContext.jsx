import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import progressService from '../services/progressService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [stats, setStats] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Sync theme to document body
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch stats when user changes
  useEffect(() => {
    if (user && user.role === 'student') {
      fetchProgressStats();
    } else {
      setStats(null);
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fetchProgressStats = async () => {
    try {
      const progressData = await progressService.getProgressStats();
      setStats(progressData);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setStats(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await authService.updateProfile(profileData);
      setUser(data.user);
      fetchProgressStats(); // Refetch stats in case track/level changed
      return data;
    } catch (err) {
      throw err;
    }
  };

  const selectTrackAndLevel = async (track, level) => {
    return updateProfile({ track, level });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        theme,
        stats,
        toggleTheme,
        login,
        register,
        logout,
        updateProfile,
        selectTrackAndLevel,
        refreshStats: fetchProgressStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
