import React from 'react';
import { Award, ShieldAlert, Sparkles, Trophy } from 'lucide-react';

const ProgressCard = ({ progress = 0, trackName = '', level = '', completed = 0, active = 0 }) => {
  // SVG Circle calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Track Progress</h3>
          </div>
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            {level}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-extrabold text-slate-950 dark:text-white leading-tight">{trackName}</h4>
            <p className="mt-1.5 text-xs font-semibold text-slate-400">
              Completed {completed} course(s). {active} current.
            </p>
          </div>

          {/* SVG Progress Circle */}
          <div className="relative flex h-20 w-20 items-center justify-center shrink-0">
            <svg className="h-full w-full rotate-[-90deg]">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-1000 ease-out"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Award className="h-4 w-4 text-emerald-500" />
          <span>{completed} Certificate(s)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>Next target: Stage 2</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
