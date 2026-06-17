import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tracks from './pages/Tracks';
import Courses from './pages/Courses';
import LearningPath from './pages/LearningPath';
import ProgressDashboard from './pages/ProgressDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading, sidebarOpen, setSidebarOpen } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 min-h-screen transition-all duration-300 lg:pl-64">
        {children}
      </div>
      <Chatbot />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Student Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/tracks" element={<PrivateRoute><Tracks /></PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
          <Route path="/learning-path" element={<PrivateRoute><LearningPath /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute><ProgressDashboard /></PrivateRoute>} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

          {/* Redirect any other path to Landing */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
