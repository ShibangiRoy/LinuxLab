import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  Check,
  Bookmark,
  BookOpen,
  ArrowRight,
  LogOut,
  LogIn,
  User,
  Shield,
  Award
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { UserProfile, ExperienceLevel, LearningPace } from '../types';
import { CURRICULUM } from '../data/curriculum';
import { COMMAND_LIBRARY } from '../data/commandLibrary';

interface ProfileViewProps {
  user: UserProfile | null;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onOpenAuth,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [level, setLevel] = useState<ExperienceLevel>(user?.experienceLevel || 'beginner');
  const [pace, setPace] = useState<LearningPace>(user?.learningPace || 'moderate');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const bookmarks = StorageService.getBookmarks();
  const achievements = StorageService.getAchievements();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = StorageService.updateProfile({
      displayName,
      experienceLevel: level,
      learningPace: pace,
    });
    if (updated) {
      onUpdateUser(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleResetAllProgress = () => {
    StorageService.resetProgress();
    setConfirmReset(false);
    navigate('/');
    window.location.reload();
  };

  const bookmarkedLessons = CURRICULUM.filter((l) =>
    bookmarks.some((b) => b.type === 'lesson' && b.id === l.id)
  );

  const bookmarkedCommands = COMMAND_LIBRARY.filter((c) =>
    bookmarks.some((b) => b.type === 'command' && b.id === c.name)
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-fade-in text-black dark:text-neutral-100">
        <div className="p-8 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-black dark:text-white">Guest Session Active</h1>
            <p className="text-xs text-slate-700 dark:text-neutral-400 max-w-md mx-auto">
              You are currently exploring LinuxLab as a guest. Sign in or create an account to save your completed lessons, customize your learning track, and track your achievements.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-5 py-2.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-black dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors shadow-xs"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 animate-fade-in text-black dark:text-neutral-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">Learner Profile & Preferences</h1>
          <p className="text-xs md:text-sm text-slate-700 dark:text-neutral-400 font-medium mt-1">
            Manage your account settings, track progress, and review saved bookmarks.
          </p>
        </div>

        {/* Working Sign Out Button in Header */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 transition-colors shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl space-y-6 md:col-span-1 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-2xl">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-black dark:text-white">{user.displayName}</h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-3 text-xs font-medium">
            <div className="flex items-center justify-between text-slate-700 dark:text-neutral-400">
              <span className="font-bold text-black dark:text-neutral-200">Account Track</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 capitalize">{user.experienceLevel}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-neutral-400">
              <span className="font-bold text-black dark:text-neutral-200">Study Pace</span>
              <span className="font-bold text-black dark:text-neutral-200 capitalize">{user.learningPace}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-neutral-400">
              <span className="font-bold text-black dark:text-neutral-200">Current Streak</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">{user.streakCount} Days</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-neutral-400">
              <span className="font-bold text-black dark:text-neutral-200">Joined Date</span>
              <span className="text-black dark:text-neutral-300 font-mono text-[11px] font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-2">
            {/* Primary Sign Out Action */}
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Account</span>
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-950 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-400 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Learning Progress</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl space-y-2 text-xs text-rose-950 dark:text-rose-300">
                <p className="font-bold">Are you sure? This will clear all completed lesson records.</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetAllProgress}
                    className="flex-1 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-300 rounded text-[11px] font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preferences Form & Bookmarks */}
        <div className="md:col-span-2 space-y-6">
          {/* Preferences Form */}
          <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-black dark:text-white">Curriculum Preferences</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {savedSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Profile and curriculum preferences updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-black dark:text-neutral-400 font-bold mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black dark:text-neutral-400 font-bold mb-1.5">
                    Target Experience Track
                  </label>
                  <div className="space-y-2">
                    {(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={`w-full py-2 px-3 rounded-xl border text-left capitalize transition-colors flex items-center justify-between font-bold ${
                          level === lvl
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-white'
                            : 'border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 text-slate-700 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <span>{lvl}</span>
                        {level === lvl && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-black dark:text-neutral-400 font-bold mb-1.5">
                    Learning Cadence
                  </label>
                  <div className="space-y-2">
                    {(['casual', 'moderate', 'intensive'] as LearningPace[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPace(p)}
                        className={`w-full py-2 px-3 rounded-xl border text-left capitalize transition-colors flex items-center justify-between font-bold ${
                          pace === p
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-white'
                            : 'border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 text-slate-700 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <span>{p}</span>
                        {pace === p && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold rounded-xl transition-colors shadow-sm"
              >
                Save Preferences
              </button>
            </form>
          </div>

          {/* Bookmarks Section */}
          <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-black dark:text-white">Saved Bookmarks</h3>
            </div>

            {bookmarkedLessons.length === 0 && bookmarkedCommands.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-neutral-500 font-medium">
                You haven't bookmarked any lessons or commands yet. Click the bookmark icon in any lesson or command card to save it here.
              </p>
            ) : (
              <div className="space-y-3">
                {bookmarkedLessons.map((les) => (
                  <div
                    key={les.id}
                    onClick={() => navigate(`/lesson/${les.id}`)}
                    className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 rounded-xl flex items-center justify-between cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-black dark:text-white">{les.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                  </div>
                ))}

                {bookmarkedCommands.map((cmd) => (
                  <div
                    key={cmd.name}
                    onClick={() => navigate('/commands')}
                    className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 rounded-xl flex items-center justify-between cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-800 dark:text-emerald-400 font-bold">{cmd.name}</span>
                      <span className="text-slate-700 dark:text-neutral-400 font-medium">{cmd.description}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
