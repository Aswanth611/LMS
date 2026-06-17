import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import axios from 'axios';
import { 
  BookOpen, 
  Search, 
  X, 
  CheckSquare, 
  Square, 
  Award, 
  ChevronRight, 
  Clock, 
  FileText 
} from 'lucide-react';

const Courses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Selected course details state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeProgress, setActiveProgress] = useState(null);

  // Fetch all courses and user's progress list
  const fetchData = async () => {
    setLoading(true);
    try {
      const coursesRes = await axios.get('/courses');
      let progressRes = null;
      if (user) {
        const userId = user.id || user._id;
        progressRes = await axios.get(`/progress/${userId}`);
      }

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.courses);
      }

      if (progressRes && progressRes.data.success) {
        // Map progress list to an object keyed by courseId
        const progMap = {};
        progressRes.data.progress.forEach(p => {
          if (p.courseId) {
            const courseId = p.courseId._id || p.courseId.id || p.courseId;
            progMap[courseId.toString()] = p;
          }
        });
        setProgressMap(progMap);

        // Sync active course details details if open
        if (selectedCourse) {
          const cId = selectedCourse._id || selectedCourse.id;
          setActiveProgress(progMap[cId.toString()] || null);
        }
      }
    } catch (err) {
      console.error('Failed to load courses data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    try {
      const res = await axios.put('/progress/update', {
        courseId,
        completedModules: [] // start empty
      });
      if (res.data.success) {
        await fetchData(); // refresh stats
      }
    } catch (err) {
      console.error('Enrollment error:', err);
    }
  };

  // Open course player panel
  const handleSelectCourse = (courseId) => {
    const course = courses.find(c => (c._id || c.id) === courseId);
    setSelectedCourse(course);
    setActiveProgress(progressMap[courseId] || null);
  };

  // Close course player panel
  const handleClosePanel = () => {
    setSelectedCourse(null);
    setActiveProgress(null);
  };

  // Checkbox module completion toggle
  const handleToggleModule = async (moduleTitle) => {
    if (!activeProgress || !selectedCourse) return;

    let completedList = [...activeProgress.completedModules];
    if (completedList.includes(moduleTitle)) {
      completedList = completedList.filter(title => title !== moduleTitle);
    } else {
      completedList.push(moduleTitle);
    }

    try {
      const cId = selectedCourse._id || selectedCourse.id;
      const res = await axios.put('/progress/update', {
        courseId: cId,
        completedModules: completedList
      });

      if (res.data.success) {
        // Update local state maps instantly for smooth UI
        const updatedProgress = res.data.progress;
        setProgressMap(prev => ({
          ...prev,
          [cId.toString()]: updatedProgress
        }));
        setActiveProgress(updatedProgress);
      }
    } catch (err) {
      console.error('Failed to update module state:', err);
    }
  };

  // Filter lists
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                          course.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filterCategory === 'All' || course.category === filterCategory;
    
    return matchesSearch && matchesFilter;
  });

  const categories = ['All', 'AI Engineer', 'Full Stack Developer', 'Data Scientist', 'Cyber Security Specialist'];

  return (
    <div className="pl-64 min-h-screen bg-slate-900 grid-bg pb-12">
      <Navbar title="Explore Courses" />

      <div className="px-8 py-8 relative z-10 flex gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* Categories Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                    filterCategory === cat
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog..."
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder-slate-600 transition-all duration-200"
              />
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-4"></div>
              <p className="text-slate-400 text-xs font-semibold">Loading course catalog...</p>
            </div>
          )}

          {/* Catalog Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                if (!course) return null;
                const cId = course._id || course.id;
                return (
                  <CourseCard
                    key={cId}
                    course={course}
                    progress={cId ? progressMap[cId.toString()] : null}
                    onEnroll={handleEnroll}
                    onSelect={handleSelectCourse}
                  />
                );
              })}
              {filteredCourses.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs">
                  No courses found matching your query.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Course Player Drawer (Right Sidebar) */}
        {selectedCourse && (
          <div className="w-96 shrink-0 glass-panel border border-slate-800 rounded-2xl p-6 h-[calc(100vh-140px)] flex flex-col justify-between sticky top-24 animate-fade-in shadow-2xl">
            {/* Header */}
            <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-brand-400 block mb-1">
                    {selectedCourse.category}
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {selectedCourse.title}
                  </h3>
                </div>
                <button
                  onClick={handleClosePanel}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Summary inside drawer */}
              {activeProgress && (
                <div className="mb-6 p-4 rounded-xl bg-slate-950/40 border border-slate-850 flex items-center gap-3">
                  {activeProgress.status === 'Completed' ? (
                    <Award className="w-10 h-10 text-emerald-400 animate-bounce" />
                  ) : (
                    <div className="relative w-10 h-10 flex items-center justify-center font-bold text-xs text-brand-400 rounded-full border-2 border-brand-500/20">
                      {activeProgress.completionPercentage}%
                    </div>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-white">Course Progress Details</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {activeProgress.status === 'Completed' 
                        ? 'Congratulations! You graduated.' 
                        : `${activeProgress.completedModules.length} of ${selectedCourse.modules.length} modules completed`}
                    </p>
                  </div>
                </div>
              )}

              {/* Modules List */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Course Modules & Tasks
                </h4>
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
                  {selectedCourse.modules.map((mod, idx) => {
                    const isCompleted = activeProgress?.completedModules.includes(mod.title);
                    return (
                      <div
                        key={idx}
                        onClick={() => activeProgress && handleToggleModule(mod.title)}
                        className={`flex gap-3 items-start p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          !activeProgress 
                            ? 'opacity-60 pointer-events-none border-slate-800/40 bg-slate-800/5'
                            : isCompleted 
                              ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                              : 'border-slate-800 bg-slate-800/20 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Checkbox Icon */}
                        {activeProgress ? (
                          isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500 hover:text-brand-400 shrink-0 mt-0.5" />
                          )
                        ) : (
                          <Square className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 min-w-0">
                          <h5 className={`text-xs font-semibold ${isCompleted ? 'text-slate-300 line-through' : 'text-white'}`}>
                            {mod.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                            {mod.description}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            <span>{mod.duration} mins</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {selectedCourse.modules.length === 0 && (
                    <p className="text-[11px] text-slate-500 italic text-center py-6">This course does not have structured modules.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Panel Prompt */}
            {!activeProgress && (
              <button
                onClick={() => handleEnroll(selectedCourse._id || selectedCourse.id)}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors text-xs mt-6"
              >
                Enroll to Unlock Modules
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
