import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Award, 
  BookOpen, 
  Activity, 
  Lightbulb, 
  ThumbsUp, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

const ProgressDashboard = () => {
  const { user } = useContext(AuthContext);
  const [progressData, setProgressData] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setLoadingAI(true);
    try {
      // 1. Fetch user progress
      const userId = user.id || user._id;
      const res = await axios.get(`/progress/${userId}`);
      if (res.data.success) {
        setProgressData(res.data.progress);
      }

      // 2. Fetch AI feedback analysis
      const aiRes = await axios.post('/ai/analyze-progress');
      if (aiRes.data.success) {
        setAnalysis(aiRes.data.analysis);
      }
    } catch (err) {
      console.error('Failed to load progress analytics:', err);
    } finally {
      setLoading(false);
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Statistics calculation
  const totalEnrolled = progressData.length;
  const totalCompleted = progressData.filter(p => p.status === 'Completed').length;
  const inProgress = progressData.filter(p => p.status === 'In Progress').length;
  
  const avgCompletion = totalEnrolled > 0
    ? Math.round(progressData.reduce((acc, p) => acc + p.completionPercentage, 0) / totalEnrolled)
    : 0;

  // Calculate total study time (sum of durations of completed modules across all enrolled courses)
  let totalStudyMinutes = 0;
  progressData.forEach(p => {
    const course = p.courseId;
    if (course && course.modules && p.completedModules) {
      course.modules.forEach(m => {
        if (p.completedModules.includes(m.title)) {
          totalStudyMinutes += m.duration || 0;
        }
      });
    }
  });

  const formatStudyTime = (mins) => {
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs} hrs`;
  };

  // Calculate average quiz score
  const quizAttemptedProgress = progressData.filter(p => p.quizScore !== undefined && p.quizScore !== -1);
  const avgQuizScore = quizAttemptedProgress.length > 0
    ? Math.round(quizAttemptedProgress.reduce((acc, p) => acc + p.quizScore, 0) / quizAttemptedProgress.length)
    : 0;

  // Activity Feed Helper
  const getActivityFeed = (data) => {
    const feed = [];
    data.forEach(p => {
      const courseTitle = p.courseId?.title || 'Unknown Course';
      
      if (p.completedModules && p.completedModules.length > 0) {
        p.completedModules.forEach(mod => {
          feed.push({
            title: `Completed Module: ${mod}`,
            description: `Part of ${courseTitle}`,
            timestamp: new Date(p.lastAccessed).getTime(),
            bulletColor: 'border-brand-500 text-brand-400'
          });
        });
      }

      if (p.quizScore !== undefined && p.quizScore !== -1) {
        feed.push({
          title: p.quizPassed ? `Passed Phase Quiz` : `Failed Phase Quiz`,
          description: `${courseTitle} - Scored ${p.quizScore}%`,
          timestamp: new Date(p.lastAccessed).getTime() + 1,
          bulletColor: p.quizPassed ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400'
        });
      }
    });

    return feed.sort((a, b) => b.timestamp - a.timestamp);
  };

  const chartData = progressData.map(p => {
    const title = p.courseId ? p.courseId.title : 'Unknown Course';
    return {
      name: title.length > 25 ? title.slice(0, 22) + '...' : title,
      percentage: p.completionPercentage,
      fullName: title
    };
  });

  // Recharts color matching
  const COLORS = ['#6366f1', '#8b5cf6', '#14b8a6', '#ec4899', '#f97316'];

  return (
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-12">
      <Navbar title="Learning Insights & Analytics" />

      <div className="px-8 py-8 relative z-10">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Enrolled Courses"
            value={totalEnrolled}
            icon={BookOpen}
            colorClass="bg-brand-500/10 text-brand-400"
            subtitle="Active enrollments"
          />
          <StatCard
            title="Courses Completed"
            value={totalCompleted}
            icon={Award}
            colorClass="bg-accent-teal/10 text-accent-teal"
            subtitle="Certificates earned"
          />
          <StatCard
            title="In Progress"
            value={inProgress}
            icon={Activity}
            colorClass="bg-accent-purple/10 text-accent-purple"
            subtitle="Current active studies"
          />
          <StatCard
            title="Average Completion"
            value={`${avgCompletion}%`}
            icon={TrendingUp}
            colorClass="bg-accent-pink/10 text-accent-pink"
            subtitle="Overall track coverage"
          />
          <StatCard
            title="Total Study Time"
            value={formatStudyTime(totalStudyMinutes)}
            icon={Clock}
            colorClass="bg-emerald-500/10 text-emerald-400"
            subtitle="Modules completion time"
          />
          <StatCard
            title="Average Quiz Score"
            value={avgQuizScore > 0 ? `${avgQuizScore}%` : 'N/A'}
            icon={Award}
            colorClass="bg-brand-500/10 text-brand-400"
            subtitle="Phase test scores"
          />
        </div>

        {/* Chart and AI Report layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progress Chart Card */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Course Progress Chart
              </h4>
              <p className="text-slate-400 text-xs mb-6">Percentage completion by course.</p>
            </div>

            {totalEnrolled > 0 ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      domain={[0, 100]} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                      formatter={(value) => [`${value}%`, 'Completion']}
                    />
                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs italic">
                Enroll in courses to populate completion charts.
              </div>
            )}
          </div>

          {/* AI Success Coach Report Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-accent-purple fill-current" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Success Coach Report
                </h4>
              </div>
              <p className="text-slate-400 text-xs mb-6 border-b border-slate-800/60 pb-3">
                Automated diagnostics regarding your learning habits.
              </p>
            </div>

            {loadingAI ? (
              <div className="flex flex-col items-center justify-center py-12 flex-1">
                <div className="w-8 h-8 rounded-full border-4 border-accent-purple/20 border-t-accent-purple animate-spin mb-3"></div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Compiling AI Feedback...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6 flex-1 text-xs">
                {/* Strengths */}
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1.5 uppercase tracking-wide">
                    <ThumbsUp className="w-4 h-4 shrink-0" />
                    <span>Strengths</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                    {analysis.strengths}
                  </p>
                </div>

                {/* Weaknesses */}
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Focus Areas</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                    {analysis.weaknesses}
                  </p>
                </div>

                {/* Next steps list */}
                {analysis.nextSteps && analysis.nextSteps.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                      Coach Recommended Action Items
                    </span>
                    <ul className="space-y-2">
                      {analysis.nextSteps.map((step, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple shrink-0 mt-1.5"></span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-xs italic text-center py-10 flex-1 flex items-center justify-center">
                AI Coach analysis offline or unavailable.
              </div>
            )}
        </div>
      </div>

        {/* Quizzes and Performance Log Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Table: Quiz History */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-[400px]">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Phase Quiz History
              </h4>
              <p className="text-slate-500 text-xs mb-4">Your scores and passing statuses for each phase evaluation.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              {quizAttemptedProgress.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold text-slate-400">
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizAttemptedProgress.map((p, idx) => (
                      <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-200">{p.courseId?.title || 'Unknown Course'}</td>
                        <td className="py-3 px-4 text-center font-bold text-white">{p.quizScore}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            p.quizPassed 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {p.quizPassed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 italic text-center text-xs">
                  No quizzes attempted yet. Finish all modules of a course phase to unlock quizzes.
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline Log */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-[400px]">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Chronological Activity Feed
              </h4>
              <p className="text-slate-500 text-xs mb-6">Recent checkpoints achieved in your learning path.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin relative border-l border-slate-800 ml-3 pl-6 space-y-6">
              {/* Generate timeline items dynamically based on completed modules and quiz attempts */}
              {getActivityFeed(progressData).length > 0 ? (
                getActivityFeed(progressData).map((act, idx) => (
                  <div key={idx} className="relative">
                    {/* Bullet pointer */}
                    <span className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border border-slate-900 bg-slate-900 ring-2 ${
                      act.title.includes('Passed') ? 'ring-emerald-500' : act.title.includes('Failed') ? 'ring-red-500' : 'ring-brand-500'
                    }`} />
                    <div>
                      <h5 className="font-bold text-slate-200 text-xs">{act.title}</h5>
                      <p className="text-[10px] text-slate-500 mt-1">{act.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 italic text-center text-xs">
                  No recent activity logged. Complete modules to fill your timeline.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProgressDashboard;
