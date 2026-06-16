import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  Users, 
  Percent, 
  ShieldAlert, 
  X, 
  Clock, 
  Menu 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State for new course
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI Engineer');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [duration, setDuration] = useState('');
  const [modules, setModules] = useState([{ title: '', description: '', duration: 30 }]);
  const [formError, setFormError] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/courses');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        navigate('/dashboard'); // protect admin route
      } else {
        fetchCourses();
      }
    }
  }, [user]);

  // Handle module creation in builder
  const handleAddModuleField = () => {
    setModules([...modules, { title: '', description: '', duration: 30 }]);
  };

  const handleRemoveModuleField = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = field === 'duration' ? Number(value) : value;
    setModules(updated);
  };

  // Create course
  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !duration) {
      setFormError('Please fill out all required course fields');
      return;
    }

    // Filter out empty modules
    const validatedModules = modules.filter(m => m.title.trim() !== '');

    try {
      const res = await axios.post('/courses', {
        title,
        description,
        category,
        difficulty,
        duration: Number(duration),
        modules: validatedModules
      });

      if (res.data.success) {
        // Reset state
        setTitle('');
        setDescription('');
        setDuration('');
        setModules([{ title: '', description: '', duration: 30 }]);
        setShowAddForm(false);
        fetchCourses(); // refresh list
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create course');
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course from the database?")) return;
    try {
      const res = await axios.delete(`/courses/${courseId}`);
      if (res.data.success) {
        fetchCourses();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Simulated metrics for premium layout
  const totalStudents = 148; // Simulated aggregate count
  const averageCompletionRate = 67; // Simulated system completion rate

  return (
    <div className="pl-64 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="Admin Portal" />

      <div className="px-8 py-8 relative z-10 space-y-8 max-w-6xl mx-auto">
        
        {/* System Diagnostics Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Registered Students"
            value={totalStudents}
            icon={Users}
            colorClass="bg-brand-500/10 text-brand-400"
            subtitle="Simulated database aggregate"
          />
          <StatCard
            title="Courses in System"
            value={courses.length}
            icon={BookOpen}
            colorClass="bg-accent-purple/10 text-accent-purple"
            subtitle="Published active syllabus"
          />
          <StatCard
            title="Average Course Completion"
            value={`${averageCompletionRate}%`}
            icon={Percent}
            colorClass="bg-accent-teal/10 text-accent-teal"
            subtitle="Overall student success rate"
          />
        </div>

        {/* Section Header Controls */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Course Catalog Editor</h3>
            <p className="text-slate-400 text-xs mt-0.5">Manage and append courses in the system library.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white py-2.5 px-5 rounded-xl shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>

        {/* Course Creation Modal Popup */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl space-y-6 relative animate-scale-in">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-accent-purple" />
                  Add New Course
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <p className="text-xs text-red-400 font-bold bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                  ⚠️ {formError}
                </p>
              )}

              <form onSubmit={handleSubmitCourse} className="space-y-4 text-xs">
                
                {/* Split grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Course Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. PyTorch Deep Learning Models"
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Duration (Hours)
                    </label>
                    <input
                      type="number"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Track Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="AI Engineer">AI Engineer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Cyber Security Specialist">Cyber Security Specialist</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed syllabus overview..."
                    rows="3"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none"
                  ></textarea>
                </div>

                {/* Modules list builder */}
                <div className="border-t border-slate-800/80 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Course Modules Builder
                    </span>
                    <button
                      type="button"
                      onClick={handleAddModuleField}
                      className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Module
                    </button>
                  </div>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {modules.map((mod, index) => (
                      <div key={index} className="flex gap-2.5 items-start bg-slate-950/40 p-3 rounded-xl border border-slate-850 relative">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={mod.title}
                            onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                            placeholder="Module Title"
                            className="bg-slate-900 border border-slate-800 focus:border-brand-500 rounded-lg px-2.5 py-1.5 text-white"
                          />
                          <input
                            type="text"
                            value={mod.description}
                            onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                            placeholder="Brief Description"
                            className="bg-slate-900 border border-slate-800 focus:border-brand-500 rounded-lg px-2.5 py-1.5 text-white"
                          />
                          <input
                            type="number"
                            value={mod.duration}
                            onChange={(e) => handleModuleChange(index, 'duration', e.target.value)}
                            placeholder="Mins (e.g. 30)"
                            className="bg-slate-900 border border-slate-800 focus:border-brand-500 rounded-lg px-2.5 py-1.5 text-white"
                          />
                        </div>

                        {modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveModuleField(index)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-red-400 hover:text-red-300 self-center"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-colors text-xs"
                >
                  Publish Course to LMS
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Existing Courses Editor Grid */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-3"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 uppercase tracking-wider font-extrabold">
                    <th className="pb-3.5 pl-2">Course Title</th>
                    <th className="pb-3.5">Category</th>
                    <th className="pb-3.5">Difficulty</th>
                    <th className="pb-3.5">Modules Count</th>
                    <th className="pb-3.5">Duration</th>
                    <th className="pb-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr 
                      key={course._id || course.id} 
                      className="border-b border-slate-850 hover:bg-slate-800/25 transition-colors font-medium"
                    >
                      <td className="py-4 pl-2 font-bold text-white max-w-[200px] truncate">
                        {course.title}
                      </td>
                      <td className="py-4 text-brand-300">{course.category}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 font-bold">
                          {course.difficulty}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400">{course.modules.length} modules</td>
                      <td className="py-4 text-slate-400">{course.duration} Hours</td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleDeleteCourse(course._id || course.id)}
                          className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {courses.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-slate-500 py-10 italic">
                        No courses loaded. Add course to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
