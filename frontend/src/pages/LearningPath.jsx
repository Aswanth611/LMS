import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { 
  Map, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  Square, 
  CheckSquare, 
  Clock, 
  Award, 
  X,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { getQuizForCourse } from '../utils/quizzesData';

const LearningPath = () => {
  const { user } = useContext(AuthContext);
  const [roadmap, setRoadmap] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScoreResult, setQuizScoreResult] = useState(null);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState(null);

  const navigate = useNavigate();

  const fetchRoadmap = async (forceRegenerate = false) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch user progress
      let progMap = {};
      if (user) {
        const userId = user.id || user._id;
        const progressRes = await axios.get(`/progress/${userId}`);
        if (progressRes.data.success) {
          progressRes.data.progress.forEach(p => {
            if (p.courseId) {
              const cId = p.courseId._id || p.courseId.id || p.courseId;
              progMap[cId.toString()] = p;
            }
          });
        }
      }
      setProgressMap(progMap);

      // 2. Fetch/generate learning path
      const res = await axios.post('/ai/generate-learning-path', {
        fetchOnly: !forceRegenerate
      });

      if (res.data.success && res.data.learningPath) {
        setRoadmap(res.data.learningPath);
      } else {
        setError("Failed to parse learning path. Try selecting your career track again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching your learning path.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (courseId, moduleTitle, completedModules) => {
    let completedList = [...completedModules];
    if (completedList.includes(moduleTitle)) {
      // Unchecking: remove this topic and all subsequent topics of the course
      const stage = roadmap.roadmapStages.find(s => s.courses && s.courses.length > 0 && (s.courses[0]._id || s.courses[0].id || s.courses[0]).toString() === courseId);
      const linkedCourse = stage?.courses[0];
      if (linkedCourse && linkedCourse.modules) {
        const modules = linkedCourse.modules;
        const modIdx = modules.findIndex(m => m.title === moduleTitle);
        if (modIdx !== -1) {
          const titlesToKeep = modules.slice(0, modIdx).map(m => m.title);
          completedList = completedList.filter(title => titlesToKeep.includes(title));
        }
      }
    } else {
      completedList.push(moduleTitle);
    }

    try {
      const res = await axios.put('/progress/update', {
        courseId,
        completedModules: completedList
      });

      if (res.data.success) {
        await fetchRoadmap(false);
      }
    } catch (err) {
      console.error('Failed to update module state:', err);
    }
  };

  const handleOpenQuiz = (course) => {
    setSelectedCourseForQuiz(course);
    const questions = getQuizForCourse(course);
    setQuizQuestions(questions);
    setQuizAnswers({});
    setQuizScoreResult(null);
    setShowQuizModal(true);
  };

  const handleSelectQuizAnswer = (qIdx, optionIdx) => {
    setQuizAnswers(prev => ({
      ...prev,
      [qIdx]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedCourseForQuiz || quizQuestions.length === 0) return;

    const cId = selectedCourseForQuiz._id || selectedCourseForQuiz.id;
    const stageIdx = roadmap.roadmapStages.findIndex(s => s.courses && s.courses.length > 0 && (s.courses[0]._id || s.courses[0].id || s.courses[0]).toString() === cId.toString());
    const phaseId = stageIdx !== -1 ? stageIdx + 1 : 1;

    try {
      const res = await axios.post('/quiz/submit', {
        phaseId: phaseId,
        answers: quizAnswers
      });

      setQuizScoreResult({
        score: res.data.score,
        passed: res.data.success
      });

      if (res.data.success) {
        // Update states instantly
        setProgressMap(prev => ({
          ...prev,
          [cId.toString()]: {
            ...prev[cId.toString()],
            quizScore: res.data.score,
            quizPassed: true,
            status: 'Completed',
            completionPercentage: 100
          }
        }));

        setRoadmap(prev => {
          if (!prev) return prev;
          const updatedUnlocked = prev.unlockedPhases ? [...prev.unlockedPhases] : [1];
          if (!updatedUnlocked.includes(res.data.unlockedPhase)) {
            updatedUnlocked.push(res.data.unlockedPhase);
          }
          const updatedCompletedPhases = prev.completedPhases ? [...prev.completedPhases] : [];
          const existingIdx = updatedCompletedPhases.findIndex(cp => cp.phaseId === phaseId);
          const phaseInfo = { phaseId: phaseId, quizScore: res.data.score, completed: true };
          if (existingIdx !== -1) {
            updatedCompletedPhases[existingIdx] = phaseInfo;
          } else {
            updatedCompletedPhases.push(phaseInfo);
          }
          return {
            ...prev,
            currentPhase: Math.max(prev.currentPhase || 1, res.data.unlockedPhase),
            unlockedPhases: updatedUnlocked,
            completedPhases: updatedCompletedPhases
          };
        });
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  useEffect(() => {
    if (user) {
      if (!user.selectedTrack) {
        navigate('/tracks');
      } else {
        fetchRoadmap(false);
      }
    }
  }, [user, navigate]);

  // Calculate stats dynamically for dashboard view
  let activeCourseInfo = null;
  let completedCoursesList = [];
  let quizScoresList = [];

  if (roadmap && roadmap.roadmapStages) {
    roadmap.roadmapStages.forEach((stage, sIdx) => {
      const hasCourse = stage.courses && stage.courses.length > 0 && stage.courses[0];
      const linkedCourse = hasCourse ? stage.courses[0] : null;
      if (linkedCourse) {
        const cId = (linkedCourse._id || linkedCourse.id || linkedCourse).toString();
        const progress = progressMap[cId];
        const isCompleted = progress && (progress.status === 'Completed' || progress.quizPassed);

        const topicsCount = linkedCourse.modules ? linkedCourse.modules.length : 0;
        const completedCount = progress ? progress.completedModules.length : 0;

        if (isCompleted) {
          completedCoursesList.push(linkedCourse.title);
          if (progress.quizScore !== undefined && progress.quizScore >= 0) {
            quizScoresList.push({ title: linkedCourse.title, score: progress.quizScore });
          }
        }
        
        const phaseNumber = sIdx + 1;
        const isUnlocked = roadmap.unlockedPhases ? roadmap.unlockedPhases.map(Number).includes(Number(phaseNumber)) : (sIdx === 0);

        if (isUnlocked && !isCompleted && !activeCourseInfo) {
          let nextTopic = 'None';
          if (linkedCourse.modules) {
            const completedModules = progress ? progress.completedModules : [];
            const nextMod = linkedCourse.modules.find(m => !completedModules.includes(m.title));
            if (nextMod) {
              nextTopic = nextMod.title;
            }
          }

          activeCourseInfo = {
            title: linkedCourse.title,
            percentage: progress ? progress.completionPercentage : 0,
            phase: stage.phase,
            completedCount,
            totalCount: topicsCount,
            nextTopic
          };
        }
      }
    });
  }

  return (
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="Learning Progress" />

      <div className="max-w-4xl mx-auto px-8 py-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <Map className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">My Learning Progress</h3>
              <p className="text-slate-400 text-xs mt-1">
                Your personalized curriculum for <span className="text-brand-300 font-bold">{user?.selectedTrack}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchRoadmap(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Roadmap
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-4"></div>
            <p className="text-slate-400 text-xs font-semibold">Loading roadmap progress...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="glass-panel p-8 rounded-2xl border border-red-500/20 text-center max-w-lg mx-auto">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h4 className="text-white font-bold mb-2">Roadmap Generation Delay</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">{error}</p>
            <Link to="/tracks" className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white py-2.5 px-5 rounded-xl transition-colors">
              Go to Tracks Selector
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Stats Dashboard Grid */}
        {!loading && !error && roadmap && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Card 1: Active Course Progress */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block mb-2.5">
                  Active Course
                </span>
                {activeCourseInfo ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {activeCourseInfo.title}
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>Progress</span>
                        <span className="text-brand-300">{activeCourseInfo.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${activeCourseInfo.percentage}%` }}></div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-1 pt-1">
                      <div><strong className="text-slate-350">Phase:</strong> {activeCourseInfo.phase}</div>
                      <div><strong className="text-slate-350">Completed Topics:</strong> {activeCourseInfo.completedCount}/{activeCourseInfo.totalCount}</div>
                      <div><strong className="text-slate-350">Next Topic:</strong> {activeCourseInfo.nextTopic}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-450 text-xs italic py-4">
                    All phases completed! Submit your project.
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Completed Courses & Scores */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block mb-2.5">
                  Completed & Quiz Scores
                </span>
                <div className="space-y-3.5 text-[10px]">
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">COMPLETED PHASES</span>
                    {completedCoursesList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {completedCoursesList.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-bold truncate max-w-full">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-600 italic">None completed yet</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 font-bold block mb-1">QUIZ SCORES</span>
                    {quizScoresList.length > 0 ? (
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {quizScoresList.map((qs, i) => (
                          <div key={i} className="flex justify-between text-slate-350 border-b border-slate-850 pb-1">
                            <span className="truncate max-w-[130px]">{qs.title}</span>
                            <span className="font-extrabold text-brand-300">{qs.score}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-600 italic">No quiz scores recorded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: AI Learning Recommendations */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block mb-2.5">
                  AI Course Recommendations
                </span>
                <div className="space-y-2 text-[10px]">
                  <p className="text-slate-400 leading-normal">
                    AI recommends completing courses in this order:
                  </p>
                  {roadmap.recommendedCourses && roadmap.recommendedCourses.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {roadmap.recommendedCourses.slice(0, 3).map((rc, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                          <span className="w-4 h-4 rounded-full bg-slate-950/40 border border-slate-800 flex items-center justify-center font-bold text-[9px] text-brand-300">
                            {idx + 1}
                          </span>
                          <span className="truncate font-semibold">{rc.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-600 italic block pt-2">No recommendations available.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Roadmap */}
        {!loading && !error && roadmap && (
          <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-12">
            {roadmap.roadmapStages.map((stage, idx) => {
              const hasCourse = stage.courses && stage.courses.length > 0 && stage.courses[0];
              const linkedCourse = hasCourse ? stage.courses[0] : null;

              const currentCourseId = linkedCourse ? (linkedCourse._id || linkedCourse.id || linkedCourse).toString() : null;
              const currentProgress = currentCourseId ? progressMap[currentCourseId] : null;
              const isCompleted = currentProgress && (currentProgress.status === 'Completed' || currentProgress.quizPassed);

              const phaseNumber = idx + 1;
              const isUnlocked = roadmap.unlockedPhases ? roadmap.unlockedPhases.map(Number).includes(Number(phaseNumber)) : (idx === 0);

              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet indicator node */}
                  <span className={`absolute -left-[41px] top-1 flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border-2 transition-colors z-10 ${
                    !isUnlocked
                      ? 'border-slate-750'
                      : isCompleted
                        ? 'border-emerald-500'
                        : 'border-brand-500 group-hover:border-brand-400'
                  }`}>
                    {!isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-brand-400 group-hover:text-brand-300 fill-current" />
                    )}
                  </span>

                  {/* Stage Card */}
                  <div className={`glass-card p-6 rounded-2xl border transition-all duration-200 ${
                    !isUnlocked
                      ? 'opacity-50 border-slate-900 bg-slate-950/20'
                      : 'border-slate-800/80'
                  }`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        !isUnlocked ? 'text-slate-500' : 'text-brand-400'
                      }`}>
                        {stage.phase}
                      </span>
                      {hasCourse && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border bg-slate-900/60 ${
                          !isUnlocked
                            ? 'border-slate-900 text-slate-650'
                            : isCompleted
                              ? 'border-emerald-500/20 text-emerald-450 bg-emerald-950/20'
                              : 'border-slate-800 text-slate-400'
                        }`}>
                          {!isUnlocked ? 'Locked' : isCompleted ? 'Completed' : 'Active'}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-lg font-bold text-white leading-tight">
                      {stage.title}
                    </h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed font-medium">
                      {stage.description}
                    </p>

                    {/* Topics Bullets */}
                    {stage.topics && stage.topics.length > 0 && (
                      <div className="mt-5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                          Topics Covered
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {stage.topics.map((topic, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="px-2.5 py-1 rounded-lg bg-slate-950/40 border border-slate-850 text-[10px] font-bold text-slate-300"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Course modules checklist */}
                    {isUnlocked && linkedCourse && linkedCourse.modules && linkedCourse.modules.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-slate-800/60">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-3">
                          Phase Modules & Study Progress
                        </span>
                        
                        <div className="space-y-2.5">
                          {linkedCourse.modules.map((mod, modIdx) => {
                            const completedModules = currentProgress?.completedModules || [];
                            const isModuleCompleted = completedModules.includes(mod.title);
                            const isModuleUnlocked = modIdx === 0 || completedModules.includes(linkedCourse.modules[modIdx - 1].title);

                            return (
                              <div
                                key={modIdx}
                                onClick={() => isModuleUnlocked && handleToggleModule(currentCourseId, mod.title, completedModules)}
                                className={`flex gap-3 items-start p-3 rounded-xl border transition-all duration-200 ${
                                  !isModuleUnlocked
                                    ? 'opacity-50 cursor-not-allowed border-slate-900 bg-slate-950/20'
                                    : isModuleCompleted
                                      ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer'
                                      : 'border-slate-800 bg-slate-850/20 hover:border-slate-700 hover:bg-slate-850/40 cursor-pointer'
                                }`}
                              >
                                {isModuleCompleted ? (
                                  <CheckSquare className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4.5 h-4.5 text-slate-500 hover:text-brand-400 shrink-0 mt-0.5" />
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <h5 className={`text-xs font-bold ${isModuleCompleted ? 'text-slate-450 line-through' : 'text-slate-200'}`}>
                                    {mod.title}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                    {mod.description}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 font-semibold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{mod.duration} mins study time</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    {hasCourse ? (
                      <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center gap-4">
                        <span className={`text-[11px] font-semibold italic truncate ${
                          !isUnlocked ? 'text-slate-650' : 'text-slate-500'
                        }`}>
                          Target Course: {linkedCourse.title}
                        </span>
                        
                        {!isUnlocked ? (
                          <button
                            disabled
                            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 text-slate-500 border border-slate-750/50 py-2 px-4 rounded-xl cursor-not-allowed shrink-0"
                          >
                            Locked
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Take Phase Quiz button */}
                            {currentProgress && currentProgress.completedModules.length === linkedCourse.modules.length && !isCompleted && (
                              <button
                                onClick={() => handleOpenQuiz(linkedCourse)}
                                className="flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white py-2 px-4 rounded-xl transition-all duration-200 shadow-md shadow-amber-600/15 animate-pulse cursor-pointer"
                              >
                                <Award className="w-4 h-4" />
                                Take Phase Quiz
                              </button>
                            )}

                            {/* Completed Banner */}
                            {isCompleted && (
                              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-xl">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                                  Quiz Passed
                                </span>
                              </div>
                            )}

                            {/* Show details if in progress */}
                            {currentProgress && currentProgress.completedModules.length < linkedCourse.modules.length && (
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-950/40 border border-slate-800 py-1.5 px-3 rounded-xl">
                                {currentProgress.completedModules.length} of {linkedCourse.modules.length} modules completed
                              </span>
                            )}

                            {/* Show start studying message */}
                            {(!currentProgress || currentProgress.completedModules.length === 0) && (
                              <span className="text-[10px] text-brand-300 font-bold bg-brand-500/10 border border-brand-500/20 py-1.5 px-3 rounded-xl">
                                Check topics above to start phase
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 pt-4 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs italic">
                          <Sparkles className="w-4 h-4 text-slate-600" />
                          <span>Self-directed study phase. Explore external docs for these topics.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quiz Modal Overlay */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowQuizModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {quizScoreResult === null ? (
              <div>
                <h3 className="text-base font-black text-white mb-1 uppercase tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-400" />
                  Phase Quiz: {selectedCourseForQuiz?.title}
                </h3>
                <p className="text-slate-400 text-xs mb-6 pb-4 border-b border-slate-800/80">
                  Pass this quiz with at least 60% (2/3 correct) to unlock the next phase!
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
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Phase Quiz Completed</h3>
                    <p className="text-slate-300 text-sm mb-2">
                      Your Score: <span className="text-emerald-400 font-extrabold">{quizScoreResult.score}%</span>
                    </p>
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                      Status: PASSED
                    </p>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed mb-6">
                      Next Phase: {
                        roadmap.roadmapStages[
                          roadmap.roadmapStages.findIndex(s => s.courses && s.courses.length > 0 && (s.courses[0]._id || s.courses[0].id || s.courses[0]).toString() === (selectedCourseForQuiz._id || selectedCourseForQuiz.id).toString()) + 1
                        ]?.title || 'Statistical Data Analysis & Visualization'
                      }
                    </p>
                  </>
                ) : (
                  <>
                    <X className="w-16 h-16 text-red-500 border-4 border-red-500/20 rounded-full p-2 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Quiz Failed</h3>
                    <p className="text-slate-300 text-sm mb-2">
                      Your Score: <span className="text-red-400 font-extrabold">{quizScoreResult.score}%</span>
                    </p>
                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                      Status: Not Passed
                    </p>
                    <p className="text-slate-450 text-xs mb-6">
                      Required: <span className="font-bold">60%</span>
                    </p>
                  </>
                )}

                <div className="flex justify-center gap-3">
                  {quizScoreResult.passed ? (
                    <button
                      onClick={() => setShowQuizModal(false)}
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenQuiz(selectedCourseForQuiz)}
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
                    >
                      Retry Quiz
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

export default LearningPath;
