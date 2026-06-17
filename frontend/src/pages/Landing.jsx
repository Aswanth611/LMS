import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-900 grid-bg relative flex flex-col justify-between overflow-hidden">
      {/* Decorative blurred background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full radial-gradient-indigo animate-pulse-slow z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full radial-gradient-purple animate-pulse-slow z-0" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <header className="relative z-10 px-8 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center font-bold text-white text-lg shadow-lg">
            EF
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white">EduFlick AI</span>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white py-2 px-5 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
        {/* Sparkle Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold mb-8 animate-float">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Next-Generation Adaptive LMS</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl">
          Automate Your Learning Journey with{' '}
          <span 
            style={{ 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              backgroundClip: 'text',
              color: 'transparent',
              backgroundImage: 'linear-gradient(to right, #818cf8, #a78bfa, #f472b6)',
              display: 'inline-block'
            }}
          >
            AI-Powered Personalization
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-slate-400 text-base sm:text-lg mt-6 max-w-2xl leading-relaxed">
          Select your career track, set your skill level, and let our recommendation engine build your custom roadmap. Learn step-by-step with real-time course insights and AI chat support.
        </p>

        {/* Call-to-actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold py-4 px-8 rounded-2xl shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            to="/login"
            className="w-full sm:w-auto text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 font-extrabold py-4 px-8 rounded-2xl transition-all duration-200 text-base"
          >
            Sign in as Guest
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
            <div className="p-3 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-xl w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mt-4">AI Roadmaps</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Dynamically maps out study phases linking directly to actual database courses matching your career track and skill level.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
            <div className="p-3 bg-accent-purple/10 text-accent-purple border border-accent-purple/20 rounded-xl w-fit">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mt-4">Personalized Matching</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Select tracks like AI Engineer, Full Stack, Data Science, or Security and get recommended courses next in line for you.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
            <div className="p-3 bg-accent-teal/10 text-accent-teal border border-accent-teal/20 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mt-4">Interactive Assistant</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Chat widget connected to a custom LLM prompt offering instant study advice, track reviews, and recommendations.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} EduFlick AI. All rights reserved. Designed for LMS Journey Automation.</p>
      </footer>
    </div>
  );
};

export default Landing;
