import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { LayoutDashboard, ShieldAlert, BookOpen, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0
  });
  const [recentPending, setRecentPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorStats = async () => {
      try {
        const [pendingRes, approvedRes] = await Promise.all([
          axios.get('/projects/mentor-review'),
          axios.get('/projects/approved')
        ]);

        if (pendingRes.data.success && approvedRes.data.success) {
          setStats({
            pending: pendingRes.data.count,
            approved: approvedRes.data.count
          });
          setRecentPending(pendingRes.data.projects.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load mentor stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorStats();
  }, []);

  return (
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="Mentor Dashboard" />

      <div className="max-w-4xl mx-auto px-8 py-8 relative z-10 space-y-8">
        
        {/* Welcome Banner */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80">
          <h2 className="text-xl font-black text-white">Welcome Back, {user?.name}!</h2>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            As a Mentor, you can review final project submissions, provide feedback, and sign off on verified certificates of completion to help students transition to active roles.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pending Reviews</span>
              <span className="text-3xl font-black text-amber-400 mt-2 block">{stats.pending}</span>
            </div>
            <div className="p-4 bg-amber-500/10 text-amber-450 rounded-2xl border border-amber-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Approved Projects</span>
              <span className="text-3xl font-black text-emerald-400 mt-2 block">{stats.approved}</span>
            </div>
            <div className="p-4 bg-emerald-500/10 text-emerald-455 rounded-2xl border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent Pending Submissions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Pending Reviews Queue</h3>
            <Link to="/mentor-reviews" className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1">
              View All Queue
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin mx-auto mb-2"></div>
              <p className="text-[10px] text-slate-500">Loading pending queue...</p>
            </div>
          )}

          {!loading && recentPending.length === 0 && (
            <div className="glass-card p-8 text-center rounded-2xl border border-slate-850">
              <FileText className="w-8 h-8 text-slate-650 mx-auto mb-2.5" />
              <p className="text-slate-450 text-xs font-semibold">Queue is clear!</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                There are no project submissions pending review. Nice job!
              </p>
            </div>
          )}

          {!loading && recentPending.map(sub => (
            <div key={sub._id} className="glass-card p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">{sub.title}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-[9px] font-bold text-slate-400">Student: {sub.studentId.name}</span>
                  <span className="text-[9px] font-bold text-slate-500">•</span>
                  <span className="text-[9px] font-bold text-slate-450">Course: {sub.courseId.title}</span>
                </div>
              </div>
              
              <Link 
                to="/mentor-reviews"
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider shadow-md shadow-brand-500/10 cursor-pointer"
              >
                Review Project
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MentorDashboard;
