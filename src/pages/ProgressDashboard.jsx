import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Award, CheckCircle, BookOpen, Clock, Activity } from 'lucide-react';
import progressService from '../services/progressService';
import courseService from '../services/courseService';
import { LearningHoursChart, CourseProgressChart } from '../components/Charts';

const ProgressDashboard = () => {
  const { user, stats, refreshStats } = useApp();
  
  const [learningHours, setLearningHours] = useState([]);
  const [courseProgressData, setCourseProgressData] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [activeCourses, setActiveCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      try {
        await refreshStats();
        // Load learning hours
        const hours = await progressService.getLearningHoursData();
        setLearningHours(hours);

        // Load all courses to construct progression datasets
        const allCourses = await courseService.getCourses();
        
        // Calculate progress stats for each course
        const mappedCourses = allCourses.map(c => {
          const completedModules = c.modules ? c.modules.filter(m => m.completed).length : 0;
          const totalModules = c.modules ? c.modules.length : 0;
          const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
          
          return {
            ...c,
            progress
          };
        });

        // Filter by user track
        const trackCourses = user?.track ? mappedCourses.filter(c => c.track === user.track) : mappedCourses;

        // Separate active and completed
        const completedList = trackCourses.filter(c => c.progress === 100);
        const activeList = trackCourses.filter(c => c.progress > 0 && c.progress < 100);

        setCompletedCourses(completedList);
        setActiveCourses(activeList);

        // Prepare Recharts bar chart structure
        const chartData = trackCourses.map(c => ({
          name: c.title.length > 20 ? c.title.substring(0, 17) + '...' : c.title,
          progress: c.progress
        }));
        setCourseProgressData(chartData);

      } catch (err) {
        console.error('Failed to load progress details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="border-b border-slate-200/50 pb-5 dark:border-slate-800/50">
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-500" />
            Learning Analytics
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Monitor study hours, analyze subject competencies, and showcase earned certificates.
          </p>
        </div>

        {/* Charts Layout (Grid 2 cols) */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          
          {/* Weekly hours Area Chart */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800 mb-6">
              <Activity className="h-4.5 w-4.5 text-indigo-555" />
              <h3 className="font-bold text-slate-900 dark:text-white">Study Activity</h3>
            </div>
            <LearningHoursChart data={learningHours} />
          </div>

          {/* Courses Progress Bar Chart */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800 mb-6">
              <BookOpen className="h-4.5 w-4.5 text-indigo-555" />
              <h3 className="font-bold text-slate-900 dark:text-white">Track Course Completion %</h3>
            </div>
            <CourseProgressChart data={courseProgressData} />
          </div>

        </div>

        {/* Courses Lists Grid (Active vs Completed) */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          
          {/* Active Courses */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950">
            <h3 className="font-bold text-slate-950 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              In-Progress Courses ({activeCourses.length})
            </h3>
            
            <div className="mt-4 flex flex-col gap-3">
              {activeCourses.map(c => (
                <div key={c.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-850 bg-slate-50/20">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-950 dark:text-white">{c.title}</span>
                    <span className="text-xs font-semibold text-indigo-650 dark:text-indigo-400">{c.progress}% done</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {activeCourses.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No active courses in progress.</p>
              )}
            </div>
          </div>

          {/* Completed Courses / Certificates */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950">
            <h3 className="font-bold text-slate-950 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              Completed Courses & Credentials ({completedCourses.length})
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              {completedCourses.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-xl bg-emerald-50/20 border border-emerald-100/40 p-4 dark:bg-emerald-950/10 dark:border-emerald-900/20">
                  <div>
                    <span className="text-xs font-bold text-slate-950 dark:text-white block">{c.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Verified Certificate Earned</span>
                  </div>
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              ))}
              {completedCourses.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No courses completed yet. Finish all modules in a course to earn certificates.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProgressDashboard;
