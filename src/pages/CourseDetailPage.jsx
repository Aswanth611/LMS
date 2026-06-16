import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Circle,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import courseService from '../services/courseService';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { refreshStats } = useApp();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingModuleId, setUpdatingModuleId] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await courseService.getCourseById(id);
        setCourse(data);
      } catch (err) {
        setError('Course not found or failed to load detail logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleModuleToggle = async (moduleId, currentCompleted) => {
    setUpdatingModuleId(moduleId);
    try {
      const updatedCourse = await courseService.updateModuleProgress(course.id, moduleId, !currentCompleted);
      setCourse(updatedCourse);
      
      // Trigger context refresh to sync progress percent on dashboard sidebar
      await refreshStats();
    } catch (err) {
      console.error('Failed to update module state', err);
    } finally {
      setUpdatingModuleId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">{error || 'Course not found'}</p>
        <Link to="/courses" className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Calculate completed stats
  const completedCount = course.modules ? course.modules.filter(m => m.completed).length : 0;
  const totalCount = course.modules ? course.modules.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-4xl">
        
        {/* Back Link */}
        <Link to="/courses" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>

        {/* Hero Course Header */}
        <div className="mt-6 rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800/50 dark:bg-slate-950">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              {course.track}
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {course.level}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            {course.title}
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {course.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="h-4.5 w-4.5" />
              <span>{course.duration} Duration</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4.5 w-4.5" />
              <span>{totalCount} Lecture Modules</span>
            </div>
          </div>
        </div>

        {/* Modules Accordion / List & Progress Bar */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          
          {/* Modules List (Colspan 2) */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-4">Course Syllabus Modules</h2>
            
            <div className="flex flex-col gap-3">
              {course.modules?.map((m) => (
                <div
                  key={m.id}
                  onClick={() => updatingModuleId !== m.id && handleModuleToggle(m.id, m.completed)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
                    m.completed
                      ? 'border-indigo-100 bg-indigo-50/5 dark:border-indigo-950/20'
                      : 'border-slate-200/50 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700'
                  } ${updatingModuleId === m.id ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center gap-3.5">
                    {m.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-indigo-650 shrink-0 dark:text-indigo-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-350 shrink-0 dark:text-slate-600" />
                    )}
                    <div>
                      <p className={`text-xs font-bold ${m.completed ? 'text-indigo-650 dark:text-indigo-400 line-through' : 'text-slate-950 dark:text-white'}`}>
                        {m.title}
                      </p>
                      <span className="mt-1 inline-block text-[10px] text-slate-400">{m.duration}</span>
                    </div>
                  </div>
                  
                  <PlayCircle className="h-5 w-5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Progress Overview Sidebar Card */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-990 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
                Syllabus Progress
              </h3>
              
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5 dark:text-slate-400">
                  <span>Modules Completed</span>
                  <span>{completedCount} / {totalCount}</span>
                </div>
                
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                
                <p className="mt-4 text-center text-3xl font-extrabold text-slate-950 dark:text-white">
                  {progressPercent}%
                </p>
                <p className="mt-1 text-center text-[10px] font-semibold text-slate-400">
                  Overall Completion Status
                </p>
              </div>

              {progressPercent === 100 && (
                <div className="mt-5 rounded-xl bg-emerald-50/50 border border-emerald-100/40 p-4 text-center dark:bg-emerald-950/20 dark:border-emerald-900/30">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                    Congratulations!
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    You have finished all course modules in this block.
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CourseDetailPage;
