import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Hourglass, 
  Award, 
  Trophy, 
  Compass, 
  CheckCircle,
  AlertCircle,
  Calendar,
  BookOpen
} from 'lucide-react';
import courseService from '../services/courseService';
import aiService from '../services/aiService';
import progressService from '../services/progressService';
import DashboardCard from '../components/DashboardCard';
import ProgressCard from '../components/ProgressCard';
import AIRecommendationCard from '../components/AIRecommendationCard';
import CourseCard from '../components/CourseCard';
import { LearningHoursChart } from '../components/Charts';

const StudentDashboard = () => {
  const { user, stats, refreshStats } = useApp();
  const navigate = useNavigate();

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [learningHours, setLearningHours] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If not authenticated, route to login
    if (!user) {
      navigate('/login');
      return;
    }
    // If no track selected, route to track selection page
    if (user.role === 'student' && !user.track) {
      navigate('/track-selection');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        await refreshStats();
        // Load courses matching student track
        const courses = await courseService.getCourses(user.track, user.level);
        setRecommendedCourses(courses.slice(0, 2));

        // Load weekly hours data
        const hoursData = await progressService.getLearningHoursData();
        setLearningHours(hoursData);

        // Load AI recommendations list
        const recommendations = await aiService.getAIRecommendations();
        setAiRecs(recommendations);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Welcome time greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-7xl">
        
        {/* Welcome Section */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
              {getGreeting()}, {user.name.split(' ')[0]}!
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Welcome back to your personalized learning console. Let's make progress today!
            </p>
          </div>
          
          <Link
            to="/ai-path"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-650/15 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98]"
          >
            <Compass className="h-4 w-4" />
            <span>View AI Roadmap</span>
          </Link>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Study Hours This Week"
            value={`${stats?.studyHours || 0} hrs`}
            icon={Hourglass}
            trend="+12%"
            trendType="up"
            color="indigo"
          />
          <DashboardCard
            title="Completed Courses"
            value={stats?.completedCourses || 0}
            icon={CheckCircle}
            trend="+1 this month"
            trendType="up"
            color="emerald"
          />
          <DashboardCard
            title="Certificates Earned"
            value={stats?.certificates || 0}
            icon={Award}
            trend="Active"
            trendType="up"
            color="purple"
          />
          <DashboardCard
            title="Performance Standing"
            value={stats?.rank || 'Top 50%'}
            icon={Trophy}
            trend="Stable"
            trendType="up"
            color="amber"
          />
        </div>

        {/* Main layout grids */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          
          {/* Left / Middle: Analytics & Courses */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Learning Hours Chart Card */}
            <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">Learning Activity</h3>
                <span className="text-xs font-semibold text-slate-400">Weekly Hours Split</span>
              </div>
              <div className="mt-6">
                <LearningHoursChart data={learningHours} />
              </div>
            </div>

            {/* In-Progress Track Courses */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Track Courses</h3>
                <Link to="/courses" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                  View all courses
                </Link>
              </div>
              
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {recommendedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
                {recommendedCourses.length === 0 && (
                  <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 dark:border-slate-800">
                    No active courses. Navigate to the courses catalog to enroll.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right: Progress Circular & AI Recommendations & Tasks */}
          <div className="flex flex-col gap-6">
            
            {/* Dynamic Progress Ring Widget */}
            <ProgressCard
              progress={stats?.progressPercent || 0}
              trackName={user.track}
              level={user.level}
              completed={stats?.completedCourses || 0}
              active={stats?.activeCourses || 0}
            />

            {/* Upcoming Learning Tasks */}
            <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
                Upcoming Learning Tasks
              </h3>
              <div className="mt-4 flex flex-col gap-3">
                {stats?.upcomingTasks?.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-start gap-3 rounded-xl bg-slate-50/50 p-3 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-850"
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-500/10 text-indigo-650 dark:bg-indigo-400/20 dark:text-indigo-400 mt-0.5">
                      <Calendar className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-950 dark:text-white">{task.title}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400">{task.dueDate}</span>
                        <span className={`px-1.5 py-0.2 rounded uppercase tracking-wider ${
                          task.urgency === 'High' 
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-455' 
                            : task.urgency === 'Medium'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-550 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {task.urgency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommedations list */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">AI Path Advisor</h3>
              <div className="flex flex-col gap-4">
                {aiRecs.map((rec) => (
                  <AIRecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
