import React from 'react';
import { Sparkles, BrainCircuit, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIRecommendationCard = ({ recommendation }) => {
  const { title, reason, difficulty, matchPercentage, link } = recommendation;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-150/40 bg-gradient-to-tr from-white via-white to-indigo-50/20 p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-indigo-900/35 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/10">
      {/* Background Sparkle Graphic */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-xl"></div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-650 dark:bg-indigo-400/20 dark:text-indigo-400">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            AI Suggestion
          </span>
        </div>
        
        {/* Match Percentage Badge */}
        <span className="rounded-lg bg-indigo-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
          {matchPercentage}% Match
        </span>
      </div>

      <h4 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white leading-tight">
        {title}
      </h4>
      <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
        {reason}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
          Difficulty: {difficulty}
        </span>
        <Link
          to={`/courses/${link}`}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <span>Explore course</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default AIRecommendationCard;
