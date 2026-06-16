import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TrackSelectionPage from './pages/TrackSelectionPage';
import CourseListingPage from './pages/CourseListingPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AILearningPathPage from './pages/AILearningPathPage';
import ProgressDashboard from './pages/ProgressDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Route Guard for logged in users
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Wrapper
const AppLayout = ({ children }) => {
  const { user } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar/navbar on Landing, Login, and Register pages
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

  if (!user || isAuthPage) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

function AppContent() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track-selection"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <TrackSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-path"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AILearningPathPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProgressDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Protected Routes */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
