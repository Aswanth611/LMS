import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Sparkles, BookOpen } from 'lucide-react';
import courseService from '../services/courseService';
import CourseCard from '../components/CourseCard';

const CourseListingPage = () => {
  const { user } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(user?.track || 'All');
  const [selectedLevel, setSelectedLevel] = useState(user?.level || 'All');

  const tracks = ['All', 'AI Engineer', 'Full Stack Developer', 'Data Scientist', 'Cyber Security Specialist'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter courses based on selections
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = selectedTrack === 'All' || c.track === selectedTrack;
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;

    return matchesSearch && matchesTrack && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Title */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-200/50 pb-5 dark:border-slate-800/50">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-indigo-500" />
              Course Catalog
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Browse available study units or focus on courses specifically aligned to your career track.
            </p>
          </div>
          
          {user?.track && (
            <button
              onClick={() => {
                setSelectedTrack(user.track);
                setSelectedLevel(user.level);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-150/40 bg-indigo-50/50 px-4 py-2.5 text-xs font-extrabold text-indigo-750 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-400"
            >
              <Sparkles className="h-4 w-4" />
              <span>Show My Required Courses</span>
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-slate-200/50 dark:bg-slate-950 dark:border-slate-800/50">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses by title or keyword..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-semibold outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500"
            />
          </div>

          {/* Selector Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filters:</span>
            </div>
            
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
            >
              {tracks.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Tracks' : t}</option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
            >
              {levels.map((l) => (
                <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 dark:border-slate-800">
                <BookOpen className="mx-auto h-12 w-12 opacity-50 mb-4" />
                <p className="text-sm font-semibold">No courses match your active filter preferences.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTrack('All');
                    setSelectedLevel('All');
                  }}
                  className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CourseListingPage;
