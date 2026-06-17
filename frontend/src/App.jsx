import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import LearningPath from './pages/LearningPath';
import Courses from './pages/Courses';
import ProjectSubmission from './pages/ProjectSubmission';
import AboutProject from './pages/AboutProject';
import MentorLogin from './pages/MentorLogin';
import MentorDashboard from './pages/MentorDashboard';
import MentorReviews from './pages/MentorReviews';
import MentorApproved from './pages/MentorApproved';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
      </div>
    );
  }

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

// Role-based Dashboard Redirect
const DashboardRedirect = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'mentor') return <Navigate to="/mentor-dashboard" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <Navigate to="/learning-path" />;
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
          <Route path="/mentor-login" element={<MentorLogin />} />

          {/* Role Dashboard Redirector */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardRedirect /></PrivateRoute>} />

          {/* Protected Student Routes */}
          <Route path="/learning-path" element={<PrivateRoute><LearningPath /></PrivateRoute>} />
          <Route path="/catalog" element={<PrivateRoute><Courses /></PrivateRoute>} />
          <Route path="/project-submission" element={<PrivateRoute><ProjectSubmission /></PrivateRoute>} />
          <Route path="/about" element={<PrivateRoute><AboutProject /></PrivateRoute>} />

          {/* Protected Mentor Routes */}
          <Route path="/mentor-dashboard" element={<PrivateRoute><MentorDashboard /></PrivateRoute>} />
          <Route path="/mentor-reviews" element={<PrivateRoute><MentorReviews /></PrivateRoute>} />
          <Route path="/mentor-approved" element={<PrivateRoute><MentorApproved /></PrivateRoute>} />

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
