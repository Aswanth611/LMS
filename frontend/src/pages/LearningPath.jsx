import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Map, MapPin, CheckCircle2, Circle, ArrowRight, Sparkles, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

const LearningPath = () => {
  const { user } = useContext(AuthContext);
  const [roadmap, setRoadmap] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const fetchRoadmap = async (forceRegenerate = false) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch user progress
      let progMap = {};
      if (user) {
        const userId = user.id || user._id;
        const progressRes = await axios.get(`/progress/${userId}`);
        if (progressRes.data.success) {
          progressRes.data.progress.forEach(p => {
            if (p.courseId) {
              const cId = p.courseId._id || p.courseId.id || p.courseId;
              progMap[cId.toString()] = p;
            }
          });
        }
      }
      setProgressMap(progMap);

      // 2. Fetch/generate learning path
      const res = await axios.post('/ai/generate-learning-path', {
        fetchOnly: !forceRegenerate
      });

      if (res.data.success && res.data.learningPath) {
        setRoadmap(res.data.learningPath);
      } else {
        setError("Failed to parse learning path. Try selecting your career track again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching your learning path.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickComplete = async (courseId, modules) => {
    try {
      const moduleTitles = modules ? modules.map(m => m.title) : [];
      const res = await axios.put('/progress/update', {
        courseId,
        completedModules: moduleTitles
      });
      if (res.data.success) {
        await fetchRoadmap(false);
      }
    } catch (err) {
      console.error('Failed to quick complete course:', err);
    }
  };

  useEffect(() => {
    if (user) {
      if (!user.selectedTrack) {
        navigate('/tracks');
      } else {
        fetchRoadmap(false);
      }
    }
  }, [user, navigate]);

  return (
    <div className="pl-64 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="My Learning Roadmap" />

      <div className="max-w-4xl mx-auto px-8 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <Map className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">AI Learning Roadmap</h3>
              <p className="text-slate-400 text-xs mt-1">
                Your personalized curriculum for <span className="text-brand-300 font-bold">{user?.selectedTrack}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchRoadmap(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Roadmap
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-4"></div>
            <p className="text-slate-400 text-xs font-semibold">Assembling your custom stages...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="glass-panel p-8 rounded-2xl border border-red-500/20 text-center max-w-lg mx-auto">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h4 className="text-white font-bold mb-2">Roadmap Generation Delay</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">{error}</p>
            <Link to="/tracks" className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white py-2.5 px-5 rounded-xl transition-colors">
              Go to Tracks Selector
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Timeline Roadmap */}
        {!loading && !error && roadmap && (
          <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-12">
            {roadmap.roadmapStages.map((stage, idx) => {
              const hasCourse = stage.courses && stage.courses.length > 0 && stage.courses[0];
              const linkedCourse = hasCourse ? stage.courses[0] : null;

              // Calculate completion and unlock status
              const currentCourseId = linkedCourse ? (linkedCourse._id || linkedCourse.id) : null;
              const currentProgress = currentCourseId ? progressMap[currentCourseId.toString()] : null;
              const isCompleted = currentProgress && currentProgress.status === 'Completed';

              let isUnlocked = true;
              if (idx > 0) {
                const prevStage = roadmap.roadmapStages[idx - 1];
                const prevCourse = prevStage.courses && prevStage.courses.length > 0 ? prevStage.courses[0] : null;
                if (prevCourse) {
                  const prevCourseId = prevCourse._id || prevCourse.id;
                  const prevProgress = progressMap[prevCourseId.toString()];
                  isUnlocked = prevProgress && prevProgress.status === 'Completed';
                }
              }

              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet indicator node */}
                  <span className={`absolute -left-[41px] top-1 flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border-2 transition-colors z-10 ${
                    !isUnlocked
                      ? 'border-slate-700'
                      : isCompleted
                        ? 'border-emerald-500'
                        : 'border-brand-500 group-hover:border-brand-400'
                  }`}>
                    {!isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-brand-400 group-hover:text-brand-300 fill-current" />
                    )}
                  </span>

                  {/* Stage Card */}
                  <div className={`glass-card p-6 rounded-2xl border transition-all duration-200 ${
                    !isUnlocked
                      ? 'opacity-50 border-slate-900 bg-slate-950/20'
                      : 'border-slate-800/80'
                  }`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        !isUnlocked ? 'text-slate-500' : 'text-brand-400'
                      }`}>
                        {stage.phase}
                      </span>
                      {hasCourse && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border bg-slate-900/60 ${
                          !isUnlocked
                            ? 'border-slate-900 text-slate-600'
                            : isCompleted
                              ? 'border-emerald-500/20 text-emerald-400 bg-emerald-950/20'
                              : 'border-slate-800 text-slate-400'
                        }`}>
                          {!isUnlocked ? 'Locked' : isCompleted ? 'Completed' : 'Active'}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-lg font-bold text-white leading-tight">
                      {stage.title}
                    </h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {stage.description}
                    </p>

                    {/* Topics Bullets */}
                    {stage.topics && stage.topics.length > 0 && (
                      <div className="mt-5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                          Topics Covered
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {stage.topics.map((topic, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="px-2.5 py-1 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[10px] font-bold text-slate-300"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    {hasCourse ? (
                      <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center gap-4">
                        <span className={`text-[11px] font-semibold italic truncate ${
                          !isUnlocked ? 'text-slate-600' : 'text-slate-500'
                        }`}>
                          Target Course: {linkedCourse.title}
                        </span>
                        
                        {!isUnlocked ? (
                          <button
                            disabled
                            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 text-slate-500 border border-slate-700/50 py-2 px-4 rounded-xl cursor-not-allowed shrink-0"
                          >
                            Locked
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        ) : isCompleted ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 px-4 rounded-xl shrink-0">
                            Completed
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleQuickComplete(currentCourseId, linkedCourse.modules)}
                              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600/10 text-emerald-300 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 py-2 px-4 rounded-xl transition-all duration-200"
                            >
                              Quick Complete
                            </button>
                            <Link
                              to="/courses"
                              state={{ openCourseId: currentCourseId }}
                              className="flex items-center gap-1.5 text-xs font-bold bg-brand-600/10 text-brand-300 hover:bg-brand-600/20 border border-brand-500/20 hover:border-brand-500/40 py-2 px-4 rounded-xl transition-all duration-200"
                            >
                              Enroll / Resume
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 pt-4 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs italic">
                          <Sparkles className="w-4 h-4 text-slate-600" />
                          <span>Self-directed study phase. Explore external docs for these topics.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPath;
