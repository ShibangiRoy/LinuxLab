import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Sun, Moon, User, Play, LogOut, Check, LogIn, UserPlus } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  theme,
  onToggleTheme,
  onOpenAuth,
  onLogout,
}) => {
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Curriculum Tracks', path: '/tracks' },
    { label: 'Command Library', path: '/commands' },
    { label: 'Free-Play Sandbox', path: '/sandbox' },
  ];

  return (
    <header className="h-16 border-b border-slate-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between gap-8 select-none transition-colors">
      {/* Zone 1: Brand Wordmark */}
      <Link
        to="/"
        className="text-lg font-bold tracking-tight text-black dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-600/30 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
          <Terminal className="w-4 h-4" />
        </div>
        <span className="font-bold text-black dark:text-neutral-100">LinuxLab</span>
      </Link>

      {/* Zone 2: Single-Line Nav Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-800 hover:text-black dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Zone 3: Actions, Theme, and Profile / Sign In */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle visual theme"
          className="p-2 text-slate-700 hover:text-black hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900 rounded-lg transition-colors"
          title={theme === 'dark' ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Continue Learning CTA */}
        <Link
          to="/lesson/l1-pwd"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-neutral-950" />
          <span>Practice</span>
        </Link>

        {/* Authenticated State vs Signed-Out State */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-xs text-black dark:text-neutral-300"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline font-semibold">{user.displayName}</span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xl py-2 z-50 text-xs text-black dark:text-neutral-300 divide-y divide-slate-100 dark:divide-neutral-800">
                <div className="px-4 py-2.5">
                  <div className="font-bold text-black dark:text-white truncate">{user.displayName}</div>
                  <div className="text-[11px] text-slate-700 dark:text-neutral-500 truncate">{user.email}</div>
                  <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold capitalize">
                    {user.experienceLevel} · {user.learningPace} pace
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-neutral-800 text-black dark:text-white transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-700 dark:text-neutral-400" />
                    <span className="font-medium">Profile & Preferences</span>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-neutral-800 text-black dark:text-white transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium">Switch Account</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-bold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 text-xs font-bold transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
