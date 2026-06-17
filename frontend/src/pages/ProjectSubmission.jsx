import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { FolderGit, Upload, Globe, Cpu, FileText, CheckCircle2, XCircle, Clock, FileDown, ShieldCheck, AlertCircle } from 'lucide-react';

const ProjectSubmission = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [githubLink, setGithubLink] = useState('');

  const studentId = user?.id || user?._id;

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch student's progress to find completed courses
      const progressRes = await axios.get(`/progress/${studentId}`);
      if (progressRes.data.success) {
        // Only allow submitting projects for courses with 100% completion & quiz passed
        const completed = progressRes.data.progress
          .filter(p => p.completionPercentage >= 100 && p.quizPassed && p.courseId)
          .map(p => p.courseId);
        setCourses(completed);
      }

      // 2. Fetch student's submissions
      const submissionsRes = await axios.get(`/projects/student/${studentId}`);
      if (submissionsRes.data.success) {
        setSubmissions(submissionsRes.data.projects);
      }

      // 3. Fetch certificates
      const certsRes = await axios.get(`/certificates/student/${studentId}`);
      if (certsRes.data.success) {
        setCertificates(certsRes.data.certificates);
      }
    } catch (err) {
      console.error('Failed to load project submission data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !title || !description || !technologies || !githubLink) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const res = await axios.post('/projects/submit', {
        courseId: selectedCourseId,
        title,
        description,
        technologies,
        githubLink,
        uploadedFiles: []
      });

      if (res.data.success) {
        setMessage('Project submitted successfully! Pending Mentor Review.');
        setTitle('');
        setSelectedCourseId('');
        setDescription('');
        setTechnologies('');
        setGithubLink('');
        await fetchData();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit project. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGenerateCertificate = async (courseId) => {
    try {
      const res = await axios.post('/certificates/generate', { courseId });
      if (res.data.success) {
        await fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request certificate.');
    }
  };

  return (
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="Project Submissions" />

      <div className="max-w-4xl mx-auto px-8 py-8 relative z-10 space-y-8">
        
        {/* Course Completion Requirement Notice */}
        {courses.length === 0 && !loading && (
          <div className="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-400 text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block mb-0.5">No Eligible Completed Courses</span>
              You can only submit a final project once you have checked off all topics (100% completion) and passed the phase quiz with a score of 60% or above. Go to your <a href="/learning-path" className="underline font-bold text-amber-300">Learning Progress</a> to complete your milestones first.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Submission Form */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800/80">
            <div className="flex items-center gap-2.5 mb-6">
              <FolderGit className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-black text-white">Submit Final Project</h3>
            </div>

            {message && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                {message}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Select Completed Course *
                </label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Personal Finance Dashboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Description & Scope *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="What does your project do? What were the challenges?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 placeholder-slate-600 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Technologies Used *
                </label>
                <input
                  type="text"
                  required
                  placeholder="React, Node.js, Express, MongoDB"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  GitHub Repository Link *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/yourusername/project"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 placeholder-slate-600"
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={submitLoading || courses.length === 0}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg disabled:opacity-50 transition-all text-xs cursor-pointer"
              >
                {submitLoading ? 'Submitting...' : 'Submit Project for Review'}
              </button>
            </form>
          </div>

          {/* Submission History */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Submission History</h3>
            
            {loading && (
              <div className="text-center py-10">
                <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin mx-auto mb-2"></div>
                <p className="text-[10px] text-slate-500 font-semibold">Loading history...</p>
              </div>
            )}

            {!loading && submissions.length === 0 && (
              <div className="glass-card p-8 text-center rounded-2xl border border-slate-850">
                <FileText className="w-8 h-8 text-slate-650 mx-auto mb-2.5" />
                <p className="text-slate-400 text-xs font-semibold">No submissions found</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Your submitted final projects will appear here with review notes and certificates.
                </p>
              </div>
            )}

            {!loading && submissions.map((sub) => {
              const cId = sub.courseId._id || sub.courseId.id || sub.courseId;
              const hasCert = certificates.find(c => {
                const certCourseId = c.courseId._id || c.courseId.id || c.courseId;
                return certCourseId.toString() === cId.toString();
              });

              return (
                <div key={sub._id} className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white">{sub.title}</h4>
                      <span className="text-[10px] text-slate-500 mt-1 block">Course: {sub.courseId.title}</span>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      sub.status === 'Approved'
                        ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400'
                        : sub.status === 'Rejected'
                          ? 'border-red-500/20 bg-red-950/20 text-red-400'
                          : 'border-amber-500/20 bg-amber-950/20 text-amber-400 animate-pulse'
                    }`}>
                      {sub.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">{sub.description}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" />{sub.technologies}</span>
                    <a href={sub.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand-400 hover:underline"><Globe className="w-3.5 h-3.5" />GitHub Repo</a>
                  </div>

                  {sub.mentorFeedback && (
                    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-[10px] leading-relaxed">
                      <span className="font-extrabold text-slate-300 block mb-0.5">Mentor Feedback:</span>
                      <p className="text-slate-400 italic">"{sub.mentorFeedback}"</p>
                    </div>
                  )}

                  {sub.status === 'Approved' && (
                    <div className="pt-3 border-t border-slate-850 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wide">
                        <ShieldCheck className="w-4 h-4" />
                        Certificate Available
                      </div>

                      {hasCert ? (
                        <a
                          href={`${axios.defaults.baseURL || 'http://localhost:5000/api'}/certificates/download/${hasCert.certificateId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-brand-600 hover:bg-brand-500 text-white py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          Download Certificate PDF
                        </a>
                      ) : (
                        <button
                          onClick={() => handleGenerateCertificate(cId)}
                          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Generate Certificate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectSubmission;
