import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  Plus, 
  X,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import courseService from '../services/courseService';
import DashboardCard from '../components/DashboardCard';

const AdminDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  // Courses & stats state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [track, setTrack] = useState('AI Engineer');
  const [level, setLevel] = useState('Beginner');
  const [duration, setDuration] = useState('4 weeks');
  const [modulesText, setModulesText] = useState('Introduction, Details, Advanced Practice, Final Project');

  useEffect(() => {
    // If not authenticated or not admin, route back to login
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchCourses();
  }, [user]);

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

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    
    // Process comma-separated modules into structured array
    const moduleTitles = modulesText.split(',').map(t => t.trim()).filter(Boolean);
    const formattedModules = moduleTitles.map((t, idx) => ({
      title: t,
      duration: '2 hours',
      completed: false
    }));

    const courseData = {
      title,
      description,
      track,
      level,
      duration,
      modules: formattedModules
    };

    try {
      if (editingCourseId) {
        await courseService.updateCourse(editingCourseId, courseData);
      } else {
        await courseService.createCourse(courseData);
      }
      
      // Reset form states
      setTitle('');
      setDescription('');
      setTrack('AI Engineer');
      setLevel('Beginner');
      setDuration('4 weeks');
      setModulesText('Introduction, Details, Advanced Practice, Final Project');
      setShowAddForm(false);
      setEditingCourseId(null);

      // Reload
      fetchCourses();
    } catch (err) {
      console.error('Failed to save course', err);
    }
  };

  const handleEditClick = (course) => {
    setEditingCourseId(course.id);
    setTitle(course.title);
    setDescription(course.description);
    setTrack(course.track);
    setLevel(course.level);
    setDuration(course.duration);
    setModulesText(course.modules ? course.modules.map(m => m.title).join(', ') : '');
    setShowAddForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseService.deleteCourse(courseId);
      fetchCourses();
    } catch (err) {
      console.error('Failed to delete course', err);
    }
  };

  const totalStudents = 328;
  const averageProgress = 45;
  const recentActivities = [
    { id: '1', text: 'John Doe enrolled in "Deep Learning"', time: '10m ago' },
    { id: '2', text: 'Alice Smith completed module 2 in "Web Dev Basics"', time: '1h ago' },
    { id: '3', text: 'Bob Johnson updated profile track settings', time: '3h ago' }
  ];

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-200/50 pb-5 dark:border-slate-800/50">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl flex items-center gap-2">
              <ShieldAlert className="h-7 w-7 text-indigo-500" />
              Admin Management Console
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Manage platform courses list, configure learning pathways, and review student progress.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingCourseId(null);
              setTitle('');
              setDescription('');
              setModulesText('Introduction, Details, Advanced Practice, Final Project');
              setShowAddForm(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-650/15 hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Course</span>
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <DashboardCard
            title="Total Registered Students"
            value={totalStudents}
            icon={Users}
            trend="+15 this week"
            trendType="up"
            color="indigo"
          />
          <DashboardCard
            title="Available Courses"
            value={courses.length}
            icon={BookOpen}
            trend="Active"
            trendType="up"
            color="purple"
          />
          <DashboardCard
            title="Avg Student Progress"
            value={`${averageProgress}%`}
            icon={TrendingUp}
            trend="+2% since yesterday"
            trendType="up"
            color="emerald"
          />
        </div>

        {/* Dynamic Course Form Overlay */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingCourseId ? 'Edit Course Details' : 'Create New Course'}
              </h3>
              
              <form onSubmit={handleCreateOrUpdate} className="mt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Course Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Intro to Docker Containers"
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of syllabus objectives..."
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Track</label>
                    <select
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="AI Engineer">AI Engineer</option>
                      <option value="Full Stack Developer">Full Stack</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Cyber Security Specialist">Cyber Security</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Level</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Duration</label>
                    <input
                      type="text"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 4 weeks"
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Syllabus Modules (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={modulesText}
                    onChange={(e) => setModulesText(e.target.value)}
                    placeholder="Module A, Module B, Module C..."
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-extrabold text-white hover:bg-indigo-500"
                >
                  {editingCourseId ? 'Save Changes' : 'Create Course'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Content Layout: Left activities, Right course inventory table */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          
          {/* Recent Student Activities */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950 h-fit">
            <h3 className="font-bold text-slate-950 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-500" />
              Student Activities Feed
            </h3>
            
            <div className="mt-4 flex flex-col gap-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex flex-col gap-0.5 rounded-lg bg-slate-50/50 p-3 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-850">
                  <p className="text-xs font-semibold text-slate-750 dark:text-slate-350">{act.text}</p>
                  <span className="text-[10px] text-slate-400">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Courses Inventory Table (Colspan 2) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-950">
            <h3 className="font-bold text-slate-950 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Course Catalog Inventory
            </h3>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                    <th className="pb-3 pr-4">Course Info</th>
                    <th className="pb-3 px-4">Track</th>
                    <th className="pb-3 px-4">Level</th>
                    <th className="pb-3 px-4">Duration</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                      <td className="py-3 pr-4 font-bold text-slate-950 dark:text-white max-w-[180px] truncate">
                        {c.title}
                      </td>
                      <td className="py-3 px-4">{c.track}</td>
                      <td className="py-3 px-4">
                        <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                          c.level === 'Beginner' 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : c.level === 'Intermediate' 
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' 
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-455'
                        }`}>
                          {c.level}
                        </span>
                      </td>
                      <td className="py-3 px-4">{c.duration}</td>
                      <td className="py-3 pl-4 text-right flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="rounded p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.length === 0 && (
                <p className="text-center text-slate-400 py-12">No courses registered in library database.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
