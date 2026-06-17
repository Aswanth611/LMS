import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import CourseCard from '../components/CourseCard';
import axios from 'axios';
import { 
  Trophy, 
  BookOpen, 
  Map, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [progressData, setProgressData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationReason, setRecommendationReason] = useState('');
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Fetch student status details
  const fetchDashboardData = async () => {
    if (!user) return;
    
    // Fetch user progress
    setLoadingProgress(true);
    try {
      const userId = user.id || user._id;
      const res = await axios.get(`/progress/${userId}`);
      if (res.data.success) {
        setProgressData(res.data.progress);
      }
    } catch (err) {
      console.error('Failed to load dashboard progress data:', err);
    } finally {
      setLoadingProgress(false);
    }

    // Fetch AI recommendations
    setLoadingRecs(true);
    try {
      const res = await axios.post('/ai/recommend-course');
      if (res.data.success) {
        setRecommendations(res.data.recommendations || []);
        setRecommendationReason(res.data.reasoning || '');
      }
    } catch (err) {
      console.error('Failed to fetch AI course recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (!user.selectedTrack) {
        navigate('/tracks');
      } else {
        fetchDashboardData();
      }
    }
  }, [user]);

  // Handle course enrollment from recommended cards
  const handleEnroll = async (courseId) => {
    try {
      const res = await axios.put('/progress/update', {
        courseId,
        completedModules: []
      });
      if (res.data.success) {
        await fetchDashboardData(); // reload dashboard stats
      }
    } catch (err) {
      console.error('Enrollment error:', err);
    }
  };

  const handleSelectCourse = () => {
    navigate('/courses');
  };

  // Compute stats details
  const activeCourses = progressData.filter(p => p.status === 'In Progress');
  const completedCourses = progressData.filter(p => p.status === 'Completed');
  const overallCompletion = progressData.length > 0
    ? Math.round(progressData.reduce((acc, p) => acc + p.completionPercentage, 0) / progressData.length)
    : 0;

  // Build upcoming task lists (modules that are NOT completed in active courses)
  const upcomingTasks = [];
  activeCourses.forEach(prog => {
    const course = prog.courseId;
    if (!course || !course.modules) return;
    const completedTitles = prog.completedModules || [];
    const uncompletedModules = course.modules.filter(m => !completedTitles.includes(m.title));
    
    uncompletedModules.forEach(mod => {
      upcomingTasks.push({
        courseTitle: course.title,
        moduleTitle: mod.title,
        duration: mod.duration,
        courseId: course._id || course.id
      });
    });
  });

  return (
    <div className="pl-64 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="Student Dashboard" />

      <div className="max-w-6xl mx-auto px-8 py-8 relative z-10 space-y-8">
        
        {/* Welcome Block Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          {/* Decorative glowing gradient radial */}
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-brand-500/10 rounded-full blur-3xl"></div>

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-brand-400">
              Welcome Back
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              Hey, {user?.name}! 👋
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-xl">
              You are currently working on the <span className="text-brand-300 font-bold">{user?.selectedTrack}</span> track at a <span className="text-accent-purple font-bold">{user?.skillLevel}</span> level. Ready to crush your targets today?
            </p>
          </div>

          <Link
            to="/learning-path"
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs shrink-0"
          >
            <Map className="w-4 h-4" />
            View My Roadmap
          </Link>
        </div>

        {/* Dashboard numerical stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Track Completion"
            value={`${overallCompletion}%`}
            icon={Trophy}
            colorClass="bg-brand-500/10 text-brand-400"
            subtitle={`Average across ${progressData.length} courses`}
          />
          <StatCard
            title="Active Courses"
            value={activeCourses.length}
            icon={BookOpen}
            colorClass="bg-accent-purple/10 text-accent-purple"
            subtitle="Courses currently in study"
          />
          <StatCard
            title="Graduation Badges"
            value={completedCourses.length}
            icon={CheckCircle}
            colorClass="bg-accent-teal/10 text-accent-teal"
            subtitle="Completed course pathways"
          />
        </div>

        {/* Main split grid: Upcoming Tasks vs Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column Left: Upcoming study tasks */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-[450px]">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Upcoming study tasks
              </h4>
              <p className="text-slate-500 text-xs mb-5">Next modules in your active courses.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {upcomingTasks.map((task, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate('/courses')}
                  className="p-3 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-850 hover:border-slate-800 rounded-xl cursor-pointer transition-all duration-200 flex flex-col gap-1.5"
                >
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide truncate">
                    {task.courseTitle}
                  </span>
                  <h5 className="text-xs font-bold text-white leading-tight">
                    {task.moduleTitle}
                  </h5>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{task.duration} mins study task</span>
                  </div>
                </div>
              ))}

              {upcomingTasks.length === 0 && !loadingProgress && (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 text-xs italic">
                  <CheckCircle className="w-8 h-8 text-slate-700 mb-2" />
                  <span>No active study tasks. Start a course to register next steps!</span>
                </div>
              )}
            </div>
          </div>

          {/* Column Right: AI Course Recommendations */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-[450px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4.5 h-4.5 text-accent-purple fill-current" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Tailored Course Recommendations
                </h4>
              </div>
              
              {recommendationReason && (
                <p className="text-xs text-brand-300 italic mb-5 leading-normal bg-brand-500/5 p-3 rounded-xl border border-brand-500/10">
                  ⚡ {recommendationReason}
                </p>
              )}
            </div>

            {loadingRecs ? (
              <div className="flex flex-col items-center justify-center py-20 flex-1">
                <div className="w-8 h-8 rounded-full border-4 border-accent-purple/20 border-t-accent-purple animate-spin mb-3"></div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Consulting AI Engine...</p>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
                {recommendations.slice(0, 2).map((course) => {
                  const cId = course._id || course.id;
                  return (
                    <CourseCard
                      key={cId}
                      course={course}
                      progress={progressData.find(p => (p.courseId._id || p.courseId.id || p.courseId).toString() === cId.toString())}
                      onEnroll={handleEnroll}
                      onSelect={handleSelectCourse}
                    />
                  );
                })}

                {recommendations.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center text-slate-500 text-xs italic py-20 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-700 mb-2" />
                    <span>All courses matching your profile are already complete! Good job.</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
