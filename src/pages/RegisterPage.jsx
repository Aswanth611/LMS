import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserPlus, Sparkles, Mail, Lock, User, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useApp();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    setValidationError('');
    setApiError('');

    if (!name) {
      setValidationError('Full Name is required');
      return false;
    }
    if (!email) {
      setValidationError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setValidationError('Password is required');
      return false;
    }
    if (password.length < 4) {
      setValidationError('Password must be at least 4 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(name, email, password);
      // New users always start with selecting their tracks
      navigate('/track-selection');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 dark:bg-slate-900 transition-colors">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/50 bg-white p-8 shadow-lg dark:border-slate-800/50 dark:bg-slate-950">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-950 dark:text-white">Create Account</h2>
          <p className="mt-1.5 text-xs font-semibold text-slate-400">
            Sign up to build your personalized AI career roadmap.
          </p>
        </div>

        {/* Validation or API error alert */}
        {(validationError || apiError) && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-rose-50/50 p-3.5 border border-rose-100/50 text-rose-650 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-455">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-semibold">{validationError || apiError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lms.com"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-650/15 hover:bg-indigo-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
