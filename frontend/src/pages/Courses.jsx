import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import axios from 'axios';
import quizzesData from '../utils/quizzesData';
import { 
  BookOpen, 
  Search, 
  X, 
  CheckSquare, 
  Square, 
  Award, 
  ChevronRight, 
  Clock, 
  FileText,
  Lock
} from 'lucide-react';

const Courses = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Selected course details state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeProgress, setActiveProgress] = useState(null);

  // Quiz Modal state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScoreResult, setQuizScoreResult] = useState(null); // { score, passed }

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

  // Auto-select course if redirected from Learning Path with state
  useEffect(() => {
    if (location.state && location.state.openCourseId && courses.length > 0) {
      const targetCourseId = location.state.openCourseId;
      handleSelectCourse(targetCourseId);
      
      if (location.state.startQuiz) {
        const course = courses.find(c => (c._id || c.id) === targetCourseId);
        if (course) {
          const questions = quizzesData[targetCourseId.toString()] || [];
          setQuizQuestions(questions);
          setQuizAnswers({});
          setQuizScoreResult(null);
          setShowQuizModal(true);
        }
      }
    }
  }, [location, courses]);

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

  // Open quiz modal and fetch questions
  const handleOpenQuiz = () => {
    if (!selectedCourse) return;
    const cId = selectedCourse._id || selectedCourse.id;
    const questions = quizzesData[cId.toString()] || [];
    setQuizQuestions(questions);
    setQuizAnswers({});
    setQuizScoreResult(null);
    setShowQuizModal(true);
  };

  // Handle selecting an answer choice for a quiz question
  const handleSelectQuizAnswer = (qIdx, optionIdx) => {
    setQuizAnswers(prev => ({
      ...prev,
      [qIdx]: optionIdx
    }));
  };

  // Submit quiz answers to calculation and save progress in backend
  const handleSubmitQuiz = async () => {
    if (!selectedCourse || quizQuestions.length === 0) return;

    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answerIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quizQuestions.length) * 100);
    const passed = score >= 70;

    try {
      const cId = selectedCourse._id || selectedCourse.id;
      const res = await axios.put('/progress/update', {
        courseId: cId,
        quizScore: score
      });

      if (res.data.success) {
        const updatedProgress = res.data.progress;
        setProgressMap(prev => ({
          ...prev,
          [cId.toString()]: updatedProgress
        }));
        setActiveProgress(updatedProgress);
        setQuizScoreResult({ score, passed });
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
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
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-12">
      <Navbar title="Explore Courses" />

      <div className="px-6 sm:px-8 py-8 relative z-10 flex flex-col lg:flex-row gap-8">
        
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

        {/* Backdrop overlay for Course Drawer on mobile/tablet */}
        {selectedCourse && (
          <div 
            onClick={handleClosePanel}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 lg:hidden cursor-pointer animate-fade-in"
          />
        )}

        {/* Course Player Drawer (Right Sidebar) */}
        {selectedCourse && (
          <div className="fixed lg:sticky right-0 top-0 lg:top-24 h-screen lg:h-[calc(100vh-140px)] w-full max-w-md lg:w-96 glass-panel border-l lg:border border-slate-800 lg:rounded-2xl p-6 flex flex-col justify-between z-30 lg:z-10 animate-fade-in shadow-2xl overflow-y-auto">
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
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Summary inside drawer */}
              {activeProgress && (
                <>
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

                  {/* Show Take Phase Quiz if all modules completed but quiz not yet passed */}
                  {selectedCourse.modules && selectedCourse.modules.length > 0 && 
                   activeProgress.completedModules.length === selectedCourse.modules.length && 
                   !activeProgress.quizPassed && (
                    <button
                      onClick={handleOpenQuiz}
                      className="w-full mb-6 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-colors cursor-pointer text-xs"
                    >
                      <Award className="w-4 h-4 text-white" />
                      Take Phase Quiz
                    </button>
                  )}
                </>
              )}

              {/* Modules List */}
              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Course Modules & Tasks
                </h4>
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {selectedCourse.modules.map((mod, idx) => {
                    const isCompleted = activeProgress?.completedModules.includes(mod.title);
                    // Lock logic: first is unlocked, subsequent require previous completed
                    const isUnlocked = idx === 0 || (activeProgress && activeProgress.completedModules.includes(selectedCourse.modules[idx - 1].title));
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => activeProgress && isUnlocked && handleToggleModule(mod.title)}
                        className={`flex gap-3 items-start p-3 rounded-xl border transition-all duration-200 ${
                          !activeProgress 
                            ? 'opacity-60 pointer-events-none border-slate-800/40 bg-slate-800/5'
                            : !isUnlocked
                              ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/40'
                              : isCompleted 
                                ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer'
                                : 'border-slate-800 bg-slate-800/20 hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer'
                        }`}
                      >
                        {/* Checkbox or Lock Icon */}
                        {activeProgress ? (
                          !isUnlocked ? (
                            <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                          ) : isCompleted ? (
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

            {/* Bottom Panel Enroll Button */}
            {!activeProgress && (
              <button
                onClick={() => handleEnroll(selectedCourse._id || selectedCourse.id)}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors text-xs mt-6 cursor-pointer"
              >
                Enroll to Unlock Modules
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quiz Modal Overlay */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowQuizModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {quizScoreResult === null ? (
              <div>
                <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-400" />
                  Phase Quiz: {selectedCourse.title}
                </h3>
                <p className="text-slate-400 text-xs mb-6 pb-4 border-b border-slate-800/80">
                  Pass this quiz with at least 70% (2/3 correct) to unlock the next phase!
                </p>

                <div className="space-y-6">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-200">
                        {qIdx + 1}. {q.question}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[qIdx] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                              className={`text-left p-3.5 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? 'border-brand-500 bg-brand-500/10 text-white font-bold'
                                  : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/80 flex justify-end gap-3">
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="py-2.5 px-5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                {quizScoreResult.passed ? (
                  <>
                    <Award className="w-16 h-16 text-emerald-400 mx-auto animate-bounce mb-4" />
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Congratulations! You Passed!</h3>
                    <p className="text-slate-300 text-sm mb-4">
                      You scored <span className="text-emerald-400 font-extrabold">{quizScoreResult.score}%</span> on the quiz.
                    </p>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed mb-6">
                      You have successfully completed this learning phase. The next phase in your curriculum roadmap has been unlocked.
                    </p>
                  </>
                ) : (
                  <>
                    <X className="w-16 h-16 text-red-500 border-4 border-red-500/20 rounded-full p-2 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Quiz Failed</h3>
                    <p className="text-slate-300 text-sm mb-4">
                      You scored <span className="text-red-400 font-extrabold">{quizScoreResult.score}%</span>.
                    </p>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed mb-6">
                      You need at least 70% (2 out of 3 correct answers) to pass and graduate to the next phase. Review the topics and try again!
                    </p>
                  </>
                )}

                <div className="flex justify-center gap-3">
                  {quizScoreResult.passed ? (
                    <button
                      onClick={() => setShowQuizModal(false)}
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
                    >
                      Close & Continue
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenQuiz}
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
