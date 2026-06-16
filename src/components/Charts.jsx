import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Custom Tooltip component for sleek rendering
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="mt-1 text-sm font-extrabold" style={{ color: item.color }}>
            {item.name}: {item.value} hrs
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const LearningHoursChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No analytical data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="hoursGrad" cx="0" cy="0" r="1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="avgGrad" cx="0" cy="0" r="1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c084fc" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
          <XAxis 
            dataKey="day" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="hours" 
            name="Your Study Hours" 
            stroke="#4f46e5" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#hoursGrad)" 
          />
          <Area 
            type="monotone" 
            dataKey="avg" 
            name="Platform Average" 
            stroke="#c084fc" 
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={1} 
            fill="url(#avgGrad)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CourseProgressChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No comparative data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="mt-1 text-sm font-extrabold text-indigo-650 dark:text-indigo-400">
                      Progress: {payload[0].value}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="progress" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#8b5cf6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
import { Cell } from 'recharts';
