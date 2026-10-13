import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Bookmark,
  BookOpen
} from 'lucide-react';
import { COMMAND_LIBRARY } from '../data/commandLibrary';
import { StorageService } from '../services/storage';

export const CommandLibraryView: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [safeOnly, setSafeOnly] = useState(false);
  const [bookmarkedList, setBookmarkedList] = useState<string[]>(() =>
    StorageService.getBookmarks()
      .filter((b) => b.type === 'command')
      .map((b) => b.id)
  );

  const categories = [
    'All',
    'Navigation',
    'File Management',
    'Text Processing',
    'Permissions',
    'System Info',
    'Process Management',
    'Automation & Scripting',
  ];

  const handleToggleBookmark = (cmdName: string) => {
    StorageService.toggleBookmark('command', cmdName);
    setBookmarkedList((prev) =>
      prev.includes(cmdName) ? prev.filter((c) => c !== cmdName) : [...prev, cmdName]
    );
  };

  const filtered = COMMAND_LIBRARY.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.syntax.toLowerCase().includes(q);
    const matchesCat = selectedCat === 'All' || c.category === selectedCat;
    const matchesSafe = !safeOnly || c.safe;
    return matchesSearch && matchesCat && matchesSafe;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in text-black dark:text-neutral-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">Linux Command Library</h1>
          <p className="text-xs md:text-sm text-slate-700 dark:text-neutral-400 font-medium mt-1">
            Complete dictionary of Linux shell commands with verified syntax, flags, safety notes, and live lessons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSafeOnly(!safeOnly)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              safeOnly
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe Practice Only</span>
          </button>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search command name, description, or syntax (e.g. grep, chmod, list)..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs md:text-sm text-black dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 p-1 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCat === cat
                  ? 'bg-white dark:bg-neutral-800 text-emerald-800 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-700 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((cmd) => {
          const isMarked = bookmarkedList.includes(cmd.name);
          return (
            <div
              key={cmd.name}
              className="p-5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl space-y-4 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-emerald-800 dark:text-emerald-400">
                      {cmd.name}
                    </span>
                    <span className="text-slate-300 dark:text-neutral-600">·</span>
                    <span className="text-xs text-slate-700 dark:text-neutral-400 font-bold">{cmd.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmd.safe ? (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Safe
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Destructive
                      </span>
                    )}

                    <button
                      onClick={() => handleToggleBookmark(cmd.name)}
                      className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors ${
                        isMarked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 hover:text-black dark:text-neutral-500 dark:hover:text-neutral-300'
                      }`}
                      title="Bookmark command"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono text-xs text-black dark:text-neutral-200 font-semibold">
                  $ {cmd.syntax}
                </div>

                <p className="text-xs text-slate-800 dark:text-neutral-300 font-medium leading-relaxed">{cmd.description}</p>

                {/* Flags Preview */}
                {cmd.flags.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] uppercase font-bold text-slate-600 dark:text-neutral-500 tracking-wider">
                      Key Flags:
                    </div>
                    <div className="space-y-1">
                      {cmd.flags.slice(0, 3).map((f, i) => (
                        <div key={i} className="text-xs flex items-center gap-2">
                          <code className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold">{f.flag}</code>
                          <span className="text-slate-700 dark:text-neutral-400 text-[11px] font-medium">{f.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Links */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-neutral-800/80">
                {cmd.lessonId ? (
                  <button
                    onClick={() => navigate(`/lesson/${cmd.lessonId}`)}
                    className="flex items-center gap-1 text-xs text-emerald-800 dark:text-emerald-400 hover:underline font-bold transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Practice in Lesson</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Standard utility</span>
                )}

                <button
                  onClick={() => navigate('/sandbox')}
                  className="flex items-center gap-1 text-xs text-slate-700 dark:text-neutral-400 hover:text-black dark:hover:text-white font-bold transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Try in Sandbox</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
