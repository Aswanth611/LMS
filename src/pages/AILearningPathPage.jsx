import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Sparkles, AlertCircle, PlayCircle, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import aiService from '../services/aiService';
import { Link } from 'react-router-dom';

const AILearningPathPage = () => {
  const { user } = useApp();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const pathData = await aiService.getLearningPath();
        setRoadmap(pathData);
      } catch (err) {
        console.error('Failed to load roadmap', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">Roadmap generation failed. Please configure your track.</p>
        <Link to="/track-selection" className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
          Configure track
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="border-b border-slate-200/50 pb-5 dark:border-slate-800/50">
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl flex items-center gap-2">
            <Compass className="h-7 w-7 text-indigo-500" />
            AI Learning Roadmap
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            A dynamic study sequence compiled specifically for you based on track settings.
          </p>
        </div>

        {/* AI Next Activity Highlight Box */}
        {roadmap.nextSuggestedActivity && (
          <div className="mt-8 rounded-2xl border border-indigo-150/40 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent p-6 dark:border-indigo-900/35 dark:from-indigo-950/20 dark:to-transparent">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                AI Suggested Next Activity
              </span>
            </div>
            
            <h3 className="mt-3 text-lg font-extrabold text-slate-950 dark:text-white leading-tight">
              {roadmap.nextSuggestedActivity.title}
            </h3>
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              {roadmap.nextSuggestedActivity.reason}
            </p>
            
            <div className="mt-4">
              <Link
                to={`/courses/${roadmap.nextSuggestedActivity.courseId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-indigo-500"
              >
                <span>Resume Activity</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Learning Stages Timeline */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-6">Your Stages Sequence</h2>
          
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-8 flex flex-col gap-8">
            {roadmap.stages?.map((stage, idx) => {
              const isActive = stage.status === 'active';
              const isLocked = stage.status === 'locked';
              const isCompleted = stage.status === 'completed';

              return (
                <div key={stage.id} className="relative group">
                  {/* Timeline Indicator Dot */}
                  <span className={`absolute -left-[41px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    isActive 
                      ? 'border-indigo-600 bg-white text-indigo-600 dark:border-indigo-400 dark:bg-slate-950 dark:text-indigo-400' 
                      : isCompleted
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-950'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 fill-emerald-600 text-white" />
                    ) : isLocked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                  </span>

                  {/* Stage Card */}
                  <div className={`rounded-2xl border p-5 transition-all duration-300 ${
                    isActive
                      ? 'border-indigo-150/40 bg-white shadow-md dark:border-indigo-900/30 dark:bg-slate-950'
                      : 'border-slate-200/50 bg-white/60 dark:border-slate-850 dark:bg-slate-950/40 opacity-75'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isActive 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : isCompleted 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-slate-400'
                      }`}>
                        {stage.title}
                      </span>
                      
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' 
                          : isCompleted
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-450 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                        {stage.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {stage.description}
                    </p>

                    {/* Courses connected to this Stage */}
                    {stage.courses && stage.courses.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Connected Course:</span>
                        {stage.courses.map((courseId) => (
                          <Link
                            key={courseId}
                            to={`/courses/${courseId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-650 hover:underline dark:text-indigo-400"
                          >
                            <span>Explore Course Module</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AILearningPathPage;
