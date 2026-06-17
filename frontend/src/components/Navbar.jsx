import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Trophy, BookOpen, Menu } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user, setSidebarOpen } = useContext(AuthContext);

  return (
    <header className="h-20 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 sticky top-0 z-10">
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">{title}</h2>
          <p className="hidden md:block text-[10px] text-slate-500 mt-0.5">Welcome back to your personalized study portal.</p>
        </div>
      </div>

      {/* User Track Badges */}
      <div className="flex items-center gap-6">
        {user?.selectedTrack && (
          <div className="hidden md:flex items-center gap-3">
            {/* Track Info */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-brand-300">
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              <span>{user.selectedTrack}</span>
            </div>

            {/* Level Info */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-accent-purple">
              <Trophy className="w-3.5 h-3.5 text-accent-purple" />
              <span>{user.skillLevel}</span>
            </div>
          </div>
        )}

        {/* Notifications and Profile */}
        <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
          <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-pink rounded-full ring-2 ring-slate-900 animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-pink rounded-full ring-2 ring-slate-900"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9.5 h-9.5 rounded-full bg-gradient-to-tr from-brand-500 to-accent-purple p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-white text-sm uppercase">
                {user?.name?.slice(0, 2) || 'ST'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
