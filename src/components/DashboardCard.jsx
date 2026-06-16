import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DashboardCard = ({ title, value, icon: Icon, trend, trendType = 'up', color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 dark:from-indigo-500/20 dark:to-transparent',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 dark:from-emerald-500/20 dark:to-transparent',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400 dark:from-rose-500/20 dark:to-transparent',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 dark:from-amber-500/20 dark:to-transparent',
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 dark:from-purple-500/20 dark:to-transparent',
  };

  return (
    <div className="group rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/50 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-slate-950 dark:text-white">{value}</span>
        {trend && (
          <span className={`flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-bold ${
            trendType === 'up' 
              ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/30 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-650 dark:bg-rose-950/30 dark:text-rose-400'
          }`}>
            {trendType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
