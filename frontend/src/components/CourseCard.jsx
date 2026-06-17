import React from 'react';
import { BookOpen, Clock, Play, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, progress, onEnroll, onSelect }) => {
  const navigate = useNavigate();
  const isEnrolled = !!progress;
  const percentage = progress ? progress.completionPercentage : 0;
  const status = progress ? progress.status : null;
  const isCompleted = progress && (progress.status === 'Completed' || progress.quizPassed);

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Beginner': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Intermediate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Advanced': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between h-[360px] relative overflow-hidden group">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 blur-2xl group-hover:bg-brand-500/10 transition-all duration-300"></div>

      <div>
        {/* Category & Difficulty Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-400">
            {course.category}
          </span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors duration-200 line-clamp-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-slate-400 text-xs mt-2.5 leading-relaxed line-clamp-3">
          {course.description}
        </p>
      </div>

      <div>
        {/* Enrolled Progress Bar */}
        {isEnrolled && (
          <div className="mb-5">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5">
              <span>COURSE PROGRESS</span>
              <span className={isCompleted ? 'text-emerald-400' : 'text-brand-400'}>
                {percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-brand-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Duration and Call-To-Action Foot */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="font-semibold">{course.duration} Hours</span>
          </div>

          {isCompleted ? (
            <button
              onClick={() => navigate('/project-submission')}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              View Certificate
            </button>
          ) : isEnrolled ? (
            <button
              onClick={() => onSelect(course._id || course.id)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Continue Learning
            </button>
          ) : (
            <button
              onClick={() => onEnroll(course._id || course.id)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-200 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Start Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
