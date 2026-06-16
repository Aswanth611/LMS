import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => {
  return (
    <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
      {/* Icon Wrapper */}
      <div className={`p-3.5 rounded-xl ${colorClass || 'bg-brand-500/10 text-brand-400'} border border-white/5 shadow-inner`}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Numerical values */}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <h3 className="text-2xl font-black text-white mt-1 leading-none tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1.5 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
