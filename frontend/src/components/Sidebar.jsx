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
  ShieldAlert 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, sidebarOpen, setSidebarOpen } = useContext(AuthContext);

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tracks Selector', path: '/tracks', icon: Compass },
    { name: 'My Learning Path', path: '/learning-path', icon: Map },
    { name: 'Explore Courses', path: '/courses', icon: BookOpen },
    { name: 'Analytics & Stats', path: '/progress', icon: BarChart3 },
  ];

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

          {/* Admin Link if role is admin */}
          {user?.role === 'admin' && (
            <div className="pt-4 border-t border-slate-800/50 mt-4">
              <span className="px-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Management
              </span>
              <NavLink
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mt-1 ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-purple to-pink-500 text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <ShieldAlert className="w-5 h-5" />
                Admin Portal
              </NavLink>
            </div>
          )}
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
