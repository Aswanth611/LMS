import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, user, error, setError } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    setError(null);
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleFillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@eduflick.ai');
      setPassword('adminpassword');
    } else {
      setEmail('john@student.com');
      setPassword('studentpassword');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 grid-bg flex items-center justify-center p-6 relative">
      {/* Background blobs */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full radial-gradient-indigo animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full radial-gradient-purple animate-pulse-slow"></div>

      <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col">
        {/* Logo Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center font-bold text-white text-xl shadow-lg mb-3">
            EF
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1">Sign in to resume your learning pathway</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10 disabled:opacity-50 transition-all duration-200 text-xs"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Quick Fills */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleFillDemo('student')}
              className="py-1.5 px-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-brand-300 transition-colors"
            >
              Demo Student
            </button>
            <button
              onClick={() => handleFillDemo('admin')}
              className="py-1.5 px-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-accent-purple transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Route register */}
        <p className="text-slate-400 text-xs text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 font-bold hover:underline">
            Register free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
