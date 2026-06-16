import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Compass, 
  BarChart3, 
  ShieldAlert, 
  Sparkles, 
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useApp();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Track', path: '/track-selection', icon: Sparkles },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'AI Learning Path', path: '/ai-path', icon: Compass },
    { name: 'Progress Analytics', path: '/analytics', icon: BarChart3 }
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert },
    { name: 'All Courses', path: '/courses', icon: BookOpen }
  ];

  const activeLinks = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 border-r border-slate-200/50 bg-white/95 backdrop-blur-md transition-all duration-300 dark:border-slate-800/50 dark:bg-slate-900/95 md:sticky md:block ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-1.5">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </div>

          {/* User profile summary block inside sidebar */}
          {!isAdmin && user.track && (
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/55 dark:border-indigo-900/30">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400">
                  <Award className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Selected Track</span>
              </div>
              <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{user.track}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Level</span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  {user.level}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
