import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { ShieldAlert, Globe, Cpu, FileText, Check, X, FileCheck2, User } from 'lucide-react';

const MentorReviews = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchPendingProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/projects/mentor-review');
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Failed to load pending projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const handleFeedbackChange = (id, val) => {
    setFeedbacks(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleApprove = async (id) => {
    setSubmittingId(id);
    const feedback = feedbacks[id] || 'Excellent work! Project approved.';
    try {
      const res = await axios.put(`/projects/${id}/approve`, { mentorFeedback: feedback });
      if (res.data.success) {
        setProjects(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve project.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (id) => {
    setSubmittingId(id);
    const feedback = feedbacks[id] || 'Project needs revisions. Please review specifications.';
    try {
      const res = await axios.put(`/projects/${id}/reject`, { mentorFeedback: feedback });
      if (res.data.success) {
        setProjects(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject project.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="Project Review Queue" />

      <div className="max-w-4xl mx-auto px-8 py-8 relative z-10 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-450 animate-pulse" />
          <h2 className="text-base font-black text-white uppercase tracking-wider">Submitted Projects Pending Review</h2>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-slate-400 font-semibold">Loading submissions...</p>
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="glass-card p-12 text-center rounded-3xl border border-slate-800">
            <FileCheck2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-black text-white">Review Queue is Empty</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
              Fantastic! All student project submissions have been reviewed and processed.
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
                  <span className="text-[10px] text-brand-400 font-semibold mt-1 block">Course: {p.courseId.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold bg-slate-950/40 border border-slate-850 px-3 py-1.5 rounded-xl shrink-0">
                  <User className="w-3.5 h-3.5" />
                  <span>Student: {p.studentId.name} ({p.studentId.email})</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-300 leading-relaxed">{p.description}</p>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-brand-400 shrink-0" /><strong>Technologies:</strong> {p.technologies}</div>
                <a href={p.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-400 hover:underline"><Globe className="w-4 h-4 shrink-0" /><strong>GitHub Link:</strong> {p.githubLink}</a>
              </div>

              {/* Uploaded Files */}
              {p.uploadedFiles && p.uploadedFiles.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Submitted Files</span>
                  <div className="flex flex-wrap gap-2">
                    {p.uploadedFiles.map((file, fIdx) => (
                      <span key={fIdx} className="flex items-center gap-1 bg-slate-950/40 border border-slate-850 px-2.5 py-1.5 rounded-xl text-[9px] text-slate-400 font-semibold">
                        <FileText className="w-3.5 h-3.5 text-brand-300" />
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Board (Feedback and Buttons) */}
              <div className="pt-4 border-t border-slate-850 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1.5">
                    Mentor Feedback & Corrections
                  </label>
                  <textarea
                    rows={2}
                    value={feedbacks[p._id] || ''}
                    onChange={(e) => handleFeedbackChange(p._id, e.target.value)}
                    placeholder="Provide recommendations or congratulatory feedback..."
                    className="w-full bg-slate-950/60 border border-slate-850 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder-slate-650 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleReject(p._id)}
                    disabled={submittingId === p._id}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider shadow-lg shadow-red-600/10 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject Project
                  </button>
                  <button
                    onClick={() => handleApprove(p._id)}
                    disabled={submittingId === p._id}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-600/10 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Project
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorReviews;
