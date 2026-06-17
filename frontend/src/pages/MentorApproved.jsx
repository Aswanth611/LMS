import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { BookOpen, Globe, Cpu, User, CheckCircle2 } from 'lucide-react';

const MentorApproved = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedProjects = async () => {
      try {
        const res = await axios.get('/projects/approved');
        if (res.data.success) {
          setProjects(res.data.projects);
        }
      } catch (err) {
        console.error('Failed to load approved projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedProjects();
  }, []);

  return (
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="Approved Projects Portfolio" />

      <div className="max-w-4xl mx-auto px-8 py-8 relative z-10 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-black text-white uppercase tracking-wider">All Approved Student Projects</h2>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-slate-400 font-semibold">Loading portfolio...</p>
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="glass-card p-12 text-center rounded-3xl border border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-slate-650 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-400">No Approved Projects</h3>
            <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
              Once you approve student submissions from the reviews page, they will be listed here.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {!loading && projects.map((p) => (
            <div key={p._id} className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4">
              
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-slate-850">
                <div>
                  <h3 className="text-sm font-bold text-white">{p.title}</h3>
                  <span className="text-[10px] text-emerald-450 font-semibold mt-1 block">Course: {p.courseId.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold bg-slate-950/40 border border-slate-850 px-3 py-1.5 rounded-xl shrink-0">
                  <User className="w-3.5 h-3.5" />
                  <span>Student: {p.studentId.name}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-300 leading-relaxed">{p.description}</p>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-brand-400 shrink-0" /><strong>Technologies:</strong> {p.technologies}</div>
                <a href={p.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-400 hover:underline"><Globe className="w-4 h-4 shrink-0" /><strong>GitHub Link:</strong> {p.githubLink}</a>
              </div>

              {/* Feedback left */}
              {p.mentorFeedback && (
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-[10px] leading-relaxed">
                  <span className="font-extrabold text-slate-300 block mb-0.5">Approved Mentor Feedback:</span>
                  <p className="text-slate-400 italic">"{p.mentorFeedback}"</p>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorApproved;
