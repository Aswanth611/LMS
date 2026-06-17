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
  TrendingUp
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
    <div className="pl-64 min-h-screen bg-slate-900 grid-bg pb-12">
      <Navbar title="Learning Insights & Analytics" />

      <div className="px-8 py-8 relative z-10">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Enrolled Courses"
            value={totalEnrolled}
            icon={BookOpen}
            colorClass="bg-brand-500/10 text-brand-400"
            subtitle="Current active enrollments"
          />
          <StatCard
            title="Courses Completed"
            value={totalCompleted}
            icon={Award}
            colorClass="bg-accent-teal/10 text-accent-teal"
            subtitle="Graduation certificates earned"
          />
          <StatCard
            title="In Progress"
            value={inProgress}
            icon={Activity}
            colorClass="bg-accent-purple/10 text-accent-purple"
            subtitle="Active pathways in study"
          />
          <StatCard
            title="Average Completion"
            value={`${avgCompletion}%`}
            icon={TrendingUp}
            colorClass="bg-accent-pink/10 text-accent-pink"
            subtitle="Overall track coverage stats"
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

      </div>
    </div>
  );
};

export default ProgressDashboard;
