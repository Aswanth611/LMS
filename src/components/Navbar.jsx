import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Bell, User, LogOut, Menu, Sparkles, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuToggle }) => {
  const { user, theme, toggleTheme, logout } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifications = [
    { id: '1', text: 'AI generated a new path stage for you!', time: '1 hour ago', read: false },
    { id: '2', text: 'You completed your first module! Keep it up.', time: '2 hours ago', read: true },
    { id: '3', text: 'Welcome to the LMS Automation platform!', time: '1 day ago', read: true }
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800/50 dark:bg-slate-900/80">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand and mobile menu toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-indigo-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent dark:from-white dark:to-indigo-400">
                AegisLMS
              </span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>

            {user && (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileMenu(false);
                    }}
                    className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-950">
                      <div className="px-3 py-2 font-semibold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
                        <span>Notifications</span>
                        <span className="text-xs text-indigo-500 cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="mt-1 max-h-60 overflow-y-auto">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${
                              !n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                            }`}
                          >
                            <p className="text-slate-750 dark:text-slate-350">{n.text}</p>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/60 p-1 pr-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 font-semibold text-white">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="hidden text-sm font-semibold text-slate-800 dark:text-slate-200 md:block">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-950">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        {user.role === 'student' && user.track && (
                          <span className="mt-1 inline-block rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {user.track} ({user.level})
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-col gap-0.5">
                        {user.role === 'student' && (
                          <Link
                            to="/track-selection"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                          >
                            <Sparkles className="h-4 w-4" />
                            Change Track
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
