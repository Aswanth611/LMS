import React from 'react';
import Navbar from '../components/Navbar';
import { Sparkles, Terminal, Award, GitBranch, Cpu, Code2, Users, Goal, TrendingUp } from 'lucide-react';

const AboutProject = () => {
  const team = [
    {
      name: "Roshan.B.Panicker",
      role: "Frontend Development & UI",
      contribution: "Designed and implemented the premium responsive dashboard, interactive roadmap layouts, and smooth sidebar transitions.",
      avatar: "RP"
    },
    {
      name: "Aswanth.S",
      role: "Backend Development & System Integration",
      contribution: "Developed robust REST APIs, secure token auth services, data routers, and the dual database (MongoDB/JSON fallback) handlers.",
      avatar: "AS"
    },
    {
      name: "Sourav T.P.",
      role: "AI Engine, Database Design & Documentation",
      contribution: "Designed and validated database models, implemented personalized AI curriculum recommendation workflows, and managed architecture docs.",
      avatar: "ST"
    }
  ];

  const features = [
    {
      title: "AI Personalization",
      desc: "Dynamically compiles learning roadmaps based on career tracks, skill levels, and individual topics of interest.",
      icon: Cpu
    },
    {
      title: "Dual Database Fallback",
      desc: "Robust local JSON-based file storage automatically overrides connection drops when local MongoDB server is not running.",
      icon: GitBranch
    },
    {
      title: "Mentor Evaluation Loop",
      desc: "Integrates student project uploads, mentor grading queues, approval feedback fields, and certificate triggers.",
      icon: Code2
    }
  ];

  return (
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="About LMS Project" />

      <div className="max-w-4xl mx-auto px-8 py-8 relative z-10 space-y-12">
        {/* Project Overview */}
        <section className="glass-card p-8 rounded-3xl border border-slate-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-white">LMS Project Overview</h3>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            The AI-Powered LMS Automation Engine is a state-of-the-art educational workflow manager. It streamlines sequential study progression, schedules automated phase quiz milestones, facilitates project review pipelines, and delivers downloadable verified PDF certificates. Designed as a modern SPA with premium glassmorphic details, it provides an intuitive, high-performance portal for students, mentors, and administrators.
          </p>
        </section>

        {/* AI Features */}
        <section className="space-y-4">
          <h4 className="text-xs uppercase font-bold tracking-widest text-slate-500">Core AI Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="glass-card p-5 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
                  <div>
                    <div className="p-2 bg-slate-950/40 text-brand-300 rounded-lg w-fit border border-slate-800/80 mb-3.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-bold text-white mb-1.5">{f.title}</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="glass-card p-8 rounded-3xl border border-slate-800/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-white">Technology Stack</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-center">
              <span className="text-xs font-extrabold text-brand-300 block">Frontend</span>
              <span className="text-[10px] text-slate-400 mt-1 block">React / Tailwind / Lucide</span>
            </div>
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-center">
              <span className="text-xs font-extrabold text-brand-300 block">Backend</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Node.js / Express</span>
            </div>
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-center">
              <span className="text-xs font-extrabold text-brand-300 block">Database</span>
              <span className="text-[10px] text-slate-400 mt-1 block">MongoDB / JSON File DB</span>
            </div>
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-center">
              <span className="text-xs font-extrabold text-brand-300 block">PDF Engine</span>
              <span className="text-[10px] text-slate-400 mt-1 block">PDFKit Stream</span>
            </div>
          </div>
        </section>

        {/* Team Information */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-white">Development Team</h3>
          </div>
          <div className="space-y-4">
            {team.map((m, idx) => (
              <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800/60 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-brand-300 shrink-0 text-sm">
                  {m.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{m.name}</h4>
                  <span className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider block mt-0.5">{m.role}</span>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{m.contribution}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Project Objectives & Enhancements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-2 mb-3">
              <Goal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Project Objectives</h4>
            </div>
            <ul className="space-y-2 text-[10px] text-slate-400 leading-relaxed list-disc list-inside">
              <li>Facilitate strict milestone-based student course completions.</li>
              <li>Bridge student-to-mentor interaction with a centralized review pipeline.</li>
              <li>Deliver verified, downloadable achievement credentials programmatically.</li>
            </ul>
          </div>
          
          <div className="glass-card p-6 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Future Enhancements</h4>
            </div>
            <ul className="space-y-2 text-[10px] text-slate-400 leading-relaxed list-disc list-inside">
              <li>Add real-time notifications for mentor comments and project review results.</li>
              <li>Support peer-to-peer student project collaborations and showcases.</li>
              <li>Implement Web3-verified secure credential checks.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutProject;
