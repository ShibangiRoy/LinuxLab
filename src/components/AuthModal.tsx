import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, Check } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ExperienceLevel, LearningPace, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');
  const [learningPace, setLearningPace] = useState<LearningPace>('moderate');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      if (password.length < 6) {
        setErrorMsg('New password must be at least 6 characters.');
        return;
      }
      const res = StorageService.resetPassword(email, password);
      if (res.success) {
        setSuccessMsg('Password has been reset successfully! You can now sign in.');
        setMode('login');
      } else {
        setErrorMsg(res.error || 'Password reset failed.');
      }
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register') {
      const res = StorageService.registerUser(
        email,
        password,
        displayName,
        experienceLevel,
        learningPace
      );
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else {
      // Login
      const res = StorageService.loginUser(email, password);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Sign in failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-black dark:text-neutral-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-black dark:text-white">
              {mode === 'login' && 'Sign in to LinuxLab'}
              {mode === 'register' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Account Password'}
            </h2>
            <p className="text-xs text-slate-700 dark:text-neutral-400 font-medium mt-0.5">
              {mode === 'login' && 'Access your personalized dashboard, lessons, and progress.'}
              {mode === 'register' && 'Start learning Linux with hands-on practice in a safe environment.'}
              {mode === 'forgot' && 'Enter your email and choose a new password.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-950 dark:text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            {mode === 'register' && (
              <div>
                <label className="block text-black dark:text-neutral-400 font-bold mb-1.5">
                  Display Name / Nickname
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. John Developer"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-black dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-black dark:text-neutral-400 font-bold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-black dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-black dark:text-neutral-400 font-bold">
                  {mode === 'forgot' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setMode('forgot');
                    }}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-black dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-black dark:text-neutral-500 dark:hover:text-white absolute right-2.5 top-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-black dark:text-neutral-400 font-bold mb-1.5">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperienceLevel(lvl)}
                        className={`py-2 px-2 rounded-lg border text-center capitalize transition-colors font-bold ${
                          experienceLevel === lvl
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-white'
                            : 'border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 text-slate-700 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-black dark:text-neutral-400 font-bold mb-1.5">
                    Preferred Learning Pace
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['casual', 'moderate', 'intensive'] as LearningPace[]).map((pace) => (
                      <button
                        key={pace}
                        type="button"
                        onClick={() => setLearningPace(pace)}
                        className={`py-2 px-2 rounded-lg border text-center capitalize transition-colors font-bold ${
                          learningPace === pace
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-white'
                            : 'border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 text-slate-700 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {pace}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg transition-colors mt-2 shadow-sm"
            >
              {mode === 'login' && 'Sign In'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password & Sign In'}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="text-center text-xs text-slate-700 dark:text-neutral-500 font-medium pt-2 border-t border-slate-100 dark:border-neutral-800/80">
            {mode === 'login' && (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('register');
                  }}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                >
                  Create one now
                </button>
              </span>
            )}
            {mode === 'register' && (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('login');
                  }}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                >
                  Sign in
                </button>
              </span>
            )}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setMode('login');
                }}
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
