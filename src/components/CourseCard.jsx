import React from 'react';
import { BookOpen, Star, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const { id, title, description, track, level, duration, modules, enrolledCount, rating } = course;

  // Calculate completed modules
  const completedCount = modules ? modules.filter((m) => m.completed).length : 0;
  const totalCount = modules ? modules.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/50 dark:bg-slate-950">
      <div>
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            {track}
          </span>
          <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            level === 'Beginner' 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
              : level === 'Intermediate' 
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' 
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
          }`}>
            {level}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {description}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 border-b border-slate-100 pb-4 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-slate-450" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-slate-450" />
            <span>{totalCount} Modules</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>{rating}</span>
          </div>
        </div>
      </div>

      {/* Progress & Action */}
      <div className="mt-4">
        {totalCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Course Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <Link
          to={`/courses/${id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-sm font-bold text-slate-700 transition-all group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-900 dark:text-slate-350 dark:group-hover:bg-indigo-600 dark:group-hover:text-white"
        >
          <span>{progressPercent > 0 ? 'Resume Course' : 'Start Learning'}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
