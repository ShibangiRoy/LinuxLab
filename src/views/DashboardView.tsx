import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Terminal,
  BookOpen,
  Award,
  Flame,
  ArrowRight,
  CheckCircle2,
  Play,
  Sparkles,
  TrendingUp,
  LogIn
} from 'lucide-react';
import { CURRICULUM } from '../data/curriculum';
import { StorageService } from '../services/storage';
import { UserProfile } from '../types';

interface DashboardViewProps {
  user: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onOpenAuth }) => {
  const navigate = useNavigate();
  const progressMap = StorageService.getProgress();
  const achievements = StorageService.getAchievements();

  // Metrics calculation
  const totalLessons = CURRICULUM.length;
  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const completionPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Find next recommended lesson (first incomplete lesson)
  const nextLesson = CURRICULUM.find((l) => !progressMap[l.id]?.completed) || CURRICULUM[0];

  // Track counts
  const beginnerLessons = CURRICULUM.filter((l) => l.track === 'beginner');
  const beginnerCompleted = beginnerLessons.filter((l) => progressMap[l.id]?.completed).length;

  const intermediateLessons = CURRICULUM.filter((l) => l.track === 'intermediate');
  const intermediateCompleted = intermediateLessons.filter((l) => progressMap[l.id]?.completed).length;

  const advancedLessons = CURRICULUM.filter((l) => l.track === 'advanced');
  const advancedCompleted = advancedLessons.filter((l) => progressMap[l.id]?.completed).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in text-black dark:text-neutral-100">
      {/* Welcome & Continue Learning Hero Strip */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
            {user ? (
              <>
                <span className="capitalize">{user.experienceLevel} Track</span>
                <span className="text-slate-400 dark:text-neutral-600">·</span>
                <span className="capitalize">{user.learningPace} Pace</span>
              </>
            ) : (
              <span>Interactive Linux Academy</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black dark:text-white">
            {user ? `Welcome back, ${user.displayName}` : 'Welcome to LinuxLab'}
          </h1>
          <p className="text-xs md:text-sm text-slate-800 dark:text-neutral-400 font-medium leading-relaxed">
            {user ? (
              <>
                Continue mastering the Linux command line through hands-on practice in an isolated, safe virtual environment. Next up: <strong className="text-black dark:text-neutral-200 font-bold">{nextLesson.title}</strong>.
              </>
            ) : (
              <>
                Master Linux commands through hands-on terminal practice, safe virtual filesystem execution, and practical verified tasks. Sign in to save your personal progress across sessions.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => navigate(`/lesson/${nextLesson.id}`)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Play className="w-4 h-4 fill-neutral-950" />
            <span>{completedCount > 0 ? 'Continue Learning' : 'Start Lesson 1'}</span>
          </button>

          {!user && (
            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-300 font-semibold text-xs transition-colors border border-slate-200 dark:border-neutral-700/50"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

          {user && (
            <button
              onClick={() => navigate('/sandbox')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-300 font-semibold text-xs transition-colors border border-slate-200 dark:border-neutral-700/50"
            >
              <Terminal className="w-4 h-4" />
              <span>Open Sandbox</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards (Real User Data, Tabular Figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl space-y-2 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-700 dark:text-neutral-400">
            <span className="text-xs font-bold text-black dark:text-neutral-300">Curriculum Progress</span>
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-black dark:text-white tabular-nums">{completionPercent}%</div>
          <div className="text-xs text-slate-700 dark:text-neutral-500 font-medium tabular-nums">
            {completedCount} of {totalLessons} lessons completed
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl space-y-2 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-700 dark:text-neutral-400">
            <span className="text-xs font-bold text-black dark:text-neutral-300">Learning Streak</span>
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-black dark:text-white tabular-nums">{user?.streakCount || 0} Days</div>
          <div className="text-xs text-slate-700 dark:text-neutral-500 font-medium">
            {user ? 'Active session' : 'Sign in to track streak'}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl space-y-2 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-700 dark:text-neutral-400">
            <span className="text-xs font-bold text-black dark:text-neutral-300">Tasks Verified</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-black dark:text-white tabular-nums">
            {completedCount} / {totalLessons}
          </div>
          <div className="text-xs text-slate-700 dark:text-neutral-500 font-medium">Live VFS tests passed</div>
        </div>

        <div className="p-5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl space-y-2 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-700 dark:text-neutral-400">
            <span className="text-xs font-bold text-black dark:text-neutral-300">Achievements</span>
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-black dark:text-white tabular-nums">
            {achievements.filter((a) => a.unlockedAt).length} / {achievements.length}
          </div>
          <div className="text-xs text-slate-700 dark:text-neutral-500 font-medium">Milestones unlocked</div>
        </div>
      </div>

      {/* Curriculum Tracks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Learning Tracks</h2>
            <p className="text-xs text-slate-700 dark:text-neutral-400 font-medium">
              Structured 3-tier learning pathway from fundamentals to advanced administration.
            </p>
          </div>
          <button
            onClick={() => navigate('/tracks')}
            className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 transition-colors"
          >
            <span>View All Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level 1: Beginner */}
          <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl flex flex-col justify-between space-y-5 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Level 1</span>
                <span className="text-xs text-slate-700 dark:text-neutral-500 font-semibold tabular-nums">
                  {beginnerCompleted} / {beginnerLessons.length} Completed
                </span>
              </div>
              <h3 className="text-base font-bold text-black dark:text-white">Beginner — Fundamentals</h3>
              <p className="text-xs text-slate-800 dark:text-neutral-400 font-medium leading-relaxed">
                Core terminal navigation (pwd, cd, ls), file creation, copy/move/remove, basic file permissions, and system information.
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(beginnerCompleted / beginnerLessons.length) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => navigate('/lesson/l1-pwd')}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>{beginnerCompleted > 0 ? 'Continue Track' : 'Start Level 1'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Level 2: Intermediate */}
          <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl flex flex-col justify-between space-y-5 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Level 2</span>
                <span className="text-xs text-slate-700 dark:text-neutral-500 font-semibold tabular-nums">
                  {intermediateCompleted} / {intermediateLessons.length} Completed
                </span>
              </div>
              <h3 className="text-base font-bold text-black dark:text-white">Intermediate — Working with Linux</h3>
              <p className="text-xs text-slate-800 dark:text-neutral-400 font-medium leading-relaxed">
                Pipes, standard streams, output redirection (&gt;, &gt;&gt;), text processing with grep, wc, sort, uniq, cut, and process inspection.
              </p>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 dark:bg-sky-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(intermediateCompleted / intermediateLessons.length) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => navigate('/lesson/l2-redirection')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-transparent"
            >
              <span>Explore Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Level 3: Advanced */}
          <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl flex flex-col justify-between space-y-5 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Level 3</span>
                <span className="text-xs text-slate-700 dark:text-neutral-500 font-semibold tabular-nums">
                  {advancedCompleted} / {advancedLessons.length} Completed
                </span>
              </div>
              <h3 className="text-base font-bold text-black dark:text-white">Advanced — Administration & Scripts</h3>
              <p className="text-xs text-slate-800 dark:text-neutral-400 font-medium leading-relaxed">
                Shell automation, bash shebangs, exit codes, scheduling with cron, and Linux service management paradigms.
              </p>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 dark:bg-purple-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(advancedCompleted / advancedLessons.length) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => navigate('/lesson/l3-scripting')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-transparent"
            >
              <span>Explore Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Next Lesson Card */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-black dark:text-white">Recommended Next Lesson</h3>
          </div>
          <span className="text-xs text-slate-700 dark:text-neutral-500 font-bold capitalize">{nextLesson.track} Track</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-emerald-800 dark:text-emerald-300">{nextLesson.title}</h4>
            <p className="text-xs text-slate-800 dark:text-neutral-400 font-medium max-w-2xl">{nextLesson.description}</p>
          </div>

          <button
            onClick={() => navigate(`/lesson/${nextLesson.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors shrink-0 shadow-sm"
          >
            <span>Start Lesson</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
