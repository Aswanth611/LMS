import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Compass, 
  ShieldAlert,
  Mic
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, sidebarOpen, setSidebarOpen } = useContext(AuthContext);

  let links = [];
  if (user?.role === 'mentor') {
    links = [
      { name: 'Dashboard', path: '/mentor-dashboard', icon: LayoutDashboard },
      { name: 'Project Reviews', path: '/mentor-reviews', icon: ShieldAlert },
      { name: 'Approved Projects', path: '/mentor-approved', icon: BookOpen }
    ];
  } else if (user?.role === 'admin') {
    links = [
      { name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert }
    ];
  } else {
    // default to student
    links = [
      { name: 'Learning Progress', path: '/learning-path', icon: Map },
      { name: 'Course Catalog', path: '/catalog', icon: BookOpen },
      { name: 'AI Voice Mentor', path: '/voice-mentor', icon: Mic },
      { name: 'Project Submission', path: '/project-submission', icon: Compass },
      { name: 'About Project', path: '/about', icon: BarChart3 }
    ];
  }


  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 lg:hidden cursor-pointer"
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-64 glass-panel border-r border-slate-800 flex flex-col z-30 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-500 to-accent-purple flex items-center justify-center font-bold text-white shadow-lg">
            EF
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              EduFlick AI
            </h1>
            <span className="text-[10px] uppercase font-bold text-brand-400 tracking-widest">
              LMS Engine
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500/80 text-white shadow-md shadow-brand-500/15 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Foot */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-brand-400 text-lg uppercase shadow-inner">
              {user?.name?.slice(0, 2) || 'ST'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-slate-200 truncate">{user?.name}</h4>
              <p className="text-[11px] text-slate-500 truncate capitalize">{user?.role} Account</p>
            </div>
          </div>

          <button
            onClick={() => {
              setSidebarOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
