import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register, user, error, setError } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'mentor') {
        navigate('/mentor-dashboard');
      } else if (user.role === 'student' && !user.selectedTrack) {
        navigate('/tracks');
      } else {
        navigate('/dashboard');
      }
    }
    setError(null);
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const success = await register(name, email, password, role);
    setLoading(false);
    if (success) {
      if (role === 'mentor') {
        navigate('/mentor-dashboard');
      } else {
        navigate('/tracks');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 grid-bg flex items-center justify-center p-6 relative">
      {/* Background blobs */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full radial-gradient-indigo animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full radial-gradient-purple animate-pulse-slow"></div>

      <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col">
        {/* Logo Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center font-bold text-white text-xl shadow-lg mb-3">
            EF
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1">Get started with your customized study path</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Select Your Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-0 transition-colors"
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10 disabled:opacity-50 transition-all duration-200 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Route login */}
        <p className="text-slate-400 text-xs text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
