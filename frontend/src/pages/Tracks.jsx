import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { 
  Compass, 
  Cpu, 
  Globe, 
  LineChart, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  X,
  Loader2
} from 'lucide-react';

const tracksList = [
  {
    name: 'AI Engineer',
    icon: Cpu,
    color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    hoverBorder: 'hover:border-brand-500/50',
    selectedBg: 'bg-brand-500/10 border-brand-500',
    desc: 'Master python coding, training machine learning classifiers, engineering neural networks, and deploying large language models.'
  },
  {
    name: 'Full Stack Developer',
    icon: Globe,
    color: 'text-accent-teal bg-accent-teal/10 border-accent-teal/20',
    hoverBorder: 'hover:border-accent-teal/50',
    selectedBg: 'bg-accent-teal/10 border-accent-teal',
    desc: 'Build web applications using frontend layers like React, backend APIs with Express, secure databases, and deploy servers.'
  },
  {
    name: 'Data Scientist',
    icon: LineChart,
    color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
    hoverBorder: 'hover:border-accent-purple/50',
    selectedBg: 'bg-accent-purple/10 border-accent-purple',
    desc: 'Wrangle spreadsheets, structure database queries, inspect statistical coefficients, and create visualizations for reporting.'
  },
  {
    name: 'Cyber Security Specialist',
    icon: ShieldCheck,
    color: 'text-accent-pink bg-accent-pink/10 border-accent-pink/20',
    hoverBorder: 'hover:border-accent-pink/50',
    selectedBg: 'bg-accent-pink/10 border-accent-pink',
    desc: 'Deconstruct malware networks, practice ethical server hacking, configure security systems, and secure systems.'
  }
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const Tracks = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedTrack, setSelectedTrack] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync state with existing user profile if present
  useEffect(() => {
    if (user?.selectedTrack) {
      setSelectedTrack(user.selectedTrack);
      setSkillLevel(user.skillLevel || 'Beginner');
      setInterests(user.interests || []);
    }
  }, [user]);

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (tag) => {
    setInterests(interests.filter(item => item !== tag));
  };

  const handleSubmit = async () => {
    if (!selectedTrack) return;
    setLoading(true);

    try {
      // 1. Update user profile track selections
      const profileSuccess = await updateProfile({
        selectedTrack,
        skillLevel,
        interests
      });

      if (profileSuccess) {
        // 2. Trigger learning path generation
        console.log('Generating AI path for track:', selectedTrack);
        await axios.post('/ai/generate-learning-path');
        
        // 3. Redirect to the learning path page
        navigate('/learning-path');
      }
    } catch (err) {
      console.error('Failed to configure learning pathway:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-12">
      <Navbar title="Career Track Selection" />
      
      <div className="max-w-4xl mx-auto px-8 py-8 relative z-10">
        {/* Header Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20 animate-pulse">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Define Your Learning Pathway</h3>
            <p className="text-slate-400 text-xs mt-1">Our AI Engine will align course stages to match your exact goals.</p>
          </div>
        </div>

        {/* 1. Track Choice Cards */}
        <div className="mb-8">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">
            Select Your Target Career Goal
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracksList.map((track) => {
              const Icon = track.icon;
              const isSelected = selectedTrack === track.name;
              return (
                <div
                  key={track.name}
                  onClick={() => setSelectedTrack(track.name)}
                  className={`glass-card p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${track.hoverBorder} ${
                    isSelected ? track.selectedBg : 'border-slate-800/80 bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${track.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-white text-sm">{track.name}</h4>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mt-3">
                    {track.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Skill Level Selector */}
        <div className="mb-8">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">
            Define Your Current Competence
          </label>
          <div className="grid grid-cols-3 gap-4 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 max-w-lg">
            {levels.map((level) => {
              const isSelected = skillLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isSelected 
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Interest tags input */}
        <div className="mb-10">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Add Core Interests (Optional tags for fine-tuning)
          </label>
          
          {/* Tag Input form */}
          <form onSubmit={handleAddInterest} className="flex gap-2 max-w-md mb-4">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="e.g. PyTorch, React, Cryptography"
              className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder-slate-600"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Tags list */}
          <div className="flex flex-wrap gap-2">
            {interests.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 font-semibold shadow-sm animate-fade-in"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(tag)}
                  className="p-0.5 rounded-full hover:bg-slate-700 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {interests.length === 0 && (
              <p className="text-[11px] text-slate-500 italic">No interests added yet. Add tags for deep AI custom recommendations.</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedTrack || loading}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-accent-purple hover:from-brand-500 hover:to-brand-400 text-white font-extrabold py-3.5 px-8 rounded-2xl shadow-xl shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:hover:from-brand-600 disabled:hover:to-accent-purple transition-all duration-200 text-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Custom Pathway...
            </>
          ) : (
            <>
              Generate Learning Path
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Tracks;
