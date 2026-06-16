import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Cpu, 
  Code2, 
  Database, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

const TrackSelectionPage = () => {
  const { user, selectTrackAndLevel } = useApp();
  const navigate = useNavigate();

  const [selectedTrack, setSelectedTrack] = useState(user?.track || '');
  const [selectedLevel, setSelectedLevel] = useState(user?.level || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tracks = [
    {
      id: 'AI Engineer',
      title: 'AI Engineer',
      description: 'Master deep learning, large language model orchestration, PEFT fine-tuning, and multi-agent systems.',
      icon: Cpu,
      color: 'indigo'
    },
    {
      id: 'Full Stack Developer',
      title: 'Full Stack Developer',
      description: 'Build robust web applications from semantic React frontends to database-driven Express backends.',
      icon: Code2,
      color: 'emerald'
    },
    {
      id: 'Data Scientist',
      title: 'Data Scientist',
      description: 'Analyze complex datasets, train classification algorithms, and build predictive machine learning models.',
      icon: Database,
      color: 'purple'
    },
    {
      id: 'Cyber Security Specialist',
      title: 'Cyber Security Specialist',
      description: 'Secure networks, run penetration scans, exploit vulnerabilities, and dissect systems threats.',
      icon: ShieldAlert,
      color: 'rose'
    }
  ];

  const levels = [
    { id: 'Beginner', title: 'Beginner', description: 'Zero coding background required. Focuses on base languages and syntax.' },
    { id: 'Intermediate', title: 'Intermediate', description: 'Some coding familiarity. Introduces frameworks, APIs, and databases.' },
    { id: 'Advanced', title: 'Advanced', description: 'Experienced developer. Mastery of cloud, microservices, and optimizations.' }
  ];

  const colorMap = {
    indigo: 'border-indigo-150/40 text-indigo-650 hover:bg-indigo-50/10 dark:border-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-950/20',
    emerald: 'border-emerald-150/40 text-emerald-650 hover:bg-emerald-50/10 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-950/20',
    purple: 'border-purple-150/40 text-purple-650 hover:bg-purple-50/10 dark:border-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-950/20',
    rose: 'border-rose-150/40 text-rose-650 hover:bg-rose-50/10 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-950/20'
  };

  const handleSave = async () => {
    if (!selectedTrack || !selectedLevel) {
      setError('Please select both a career track and a skill level.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await selectTrackAndLevel(selectedTrack, selectedLevel);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update track. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-4xl">
        
        {/* Title Header */}
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-950 dark:text-white">Customize Your Roadmap</h1>
          <p className="mt-1.5 text-sm font-semibold text-slate-400">
            Tell us about your learning objectives and level to construct your path.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-rose-50/50 p-4 border border-rose-100/50 text-xs font-semibold text-rose-650 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-455 text-center">
            {error}
          </div>
        )}

        {/* Section 1: Track Selection */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-xs text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400">1</span>
            Select Your Career Track
          </h2>
          
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {tracks.map((track) => {
              const Icon = track.icon;
              const isSelected = selectedTrack === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/10 dark:border-indigo-400 dark:bg-indigo-950/10 shadow-md shadow-indigo-500/5'
                      : 'border-slate-200/50 bg-white hover:border-slate-350 dark:border-slate-800/50 dark:bg-slate-950 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                      isSelected 
                        ? 'bg-indigo-600 text-white dark:bg-indigo-400 dark:text-slate-950' 
                        : colorMap[track.color]
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-slate-950 dark:text-white">{track.title}</span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    {track.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Level Selection */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-xs text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400">2</span>
            Choose Your Experience Level
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {levels.map((level) => {
              const isSelected = selectedLevel === level.id;
              return (
                <div
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/10 dark:border-indigo-400 dark:bg-indigo-950/10 shadow-md shadow-indigo-500/5'
                      : 'border-slate-200/50 bg-white hover:border-slate-350 dark:border-slate-800/50 dark:bg-slate-950 dark:hover:border-slate-700'
                  }`}
                >
                  <span className={`text-sm font-extrabold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-950 dark:text-white'}`}>
                    {level.title}
                  </span>
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    {level.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-md shadow-indigo-650/15 hover:bg-indigo-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Generate AI Roadmap</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TrackSelectionPage;
