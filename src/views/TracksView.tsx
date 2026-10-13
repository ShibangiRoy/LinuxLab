import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  Play,
  CheckCircle2
} from 'lucide-react';
import { CURRICULUM, MODULES } from '../data/curriculum';
import { StorageService } from '../services/storage';
import { TrackLevel } from '../types';

export const TracksView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const progressMap = StorageService.getProgress();

  const tracks: { id: TrackLevel; title: string; subtitle: string; badgeColor: string }[] = [
    {
      id: 'beginner',
      title: 'Level 1: Beginner — Linux Fundamentals',
      subtitle: 'Pathways, terminal navigation, filesystem operations, permissions & system info.',
      badgeColor: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      id: 'intermediate',
      title: 'Level 2: Intermediate — Working with Linux',
      subtitle: 'Pipes, redirection streams, grep filters, text transformation, processes, and environment.',
      badgeColor: 'text-sky-700 dark:text-sky-400',
    },
    {
      id: 'advanced',
      title: 'Level 3: Advanced — Administration & Automation',
      subtitle: 'Shell scripting, bash shebangs, task scheduling with cron, and Linux services.',
      badgeColor: 'text-purple-700 dark:text-purple-400',
    },
  ];

  const filteredTracks = selectedTrack === 'all'
    ? tracks
    : tracks.filter((t) => t.id === selectedTrack);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in text-black dark:text-neutral-100">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">Curriculum Tracks</h1>
          <p className="text-xs md:text-sm text-slate-700 dark:text-neutral-400 font-medium mt-1">
            Structured 3-tier learning pathway designed to build confidence from day one.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl">
          {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedTrack(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                selectedTrack === lvl
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-emerald-400 shadow-sm'
                  : 'text-slate-700 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks Container */}
      <div className="space-y-10">
        {filteredTracks.map((track) => {
          const trackLessons = CURRICULUM.filter((l) => l.track === track.id);
          const trackModules = MODULES.filter((m) => m.track === track.id);
          const completedCount = trackLessons.filter((l) => progressMap[l.id]?.completed).length;
          const percent = Math.round((completedCount / trackLessons.length) * 100);

          return (
            <div key={track.id} className="space-y-4">
              {/* Track Header Card */}
              <div className="p-5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${track.badgeColor}`}>
                      {track.id}
                    </span>
                    <span className="text-slate-300 dark:text-neutral-600">·</span>
                    <span className="text-xs text-slate-700 dark:text-neutral-400 font-semibold">
                      {trackLessons.length} Lessons
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-black dark:text-white">{track.title}</h2>
                  <p className="text-xs text-slate-800 dark:text-neutral-400 font-medium max-w-2xl">{track.subtitle}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-black dark:text-white tabular-nums">{percent}%</div>
                    <div className="text-[11px] text-slate-700 dark:text-neutral-500 font-semibold tabular-nums">
                      {completedCount} / {trackLessons.length} done
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const firstIncomplete = trackLessons.find((l) => !progressMap[l.id]?.completed) || trackLessons[0];
                      navigate(`/lesson/${firstIncomplete.id}`);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-neutral-950" />
                    <span>{completedCount > 0 ? 'Resume' : 'Start'}</span>
                  </button>
                </div>
              </div>

              {/* Modules List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trackModules.map((mod) => {
                  const modLessons = CURRICULUM.filter((l) => l.moduleId === mod.id);
                  return (
                    <div
                      key={mod.id}
                      className="p-5 bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800/80 rounded-2xl space-y-4 shadow-sm"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-black dark:text-neutral-200">{mod.title}</h3>
                        <p className="text-xs text-slate-800 dark:text-neutral-400 font-medium mt-1">{mod.description}</p>
                      </div>

                      <div className="space-y-2">
                        {modLessons.map((les) => {
                          const isDone = !!progressMap[les.id]?.completed;
                          return (
                            <div
                              key={les.id}
                              onClick={() => navigate(`/lesson/${les.id}`)}
                              className="p-3 bg-slate-50 dark:bg-neutral-950/80 hover:bg-slate-100 dark:hover:bg-neutral-850 border border-slate-200 dark:border-neutral-800/80 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                    isDone
                                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                      : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-500'
                                  }`}
                                >
                                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : '•'}
                                </div>
                                <span className="text-xs font-bold text-black dark:text-neutral-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                  {les.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-neutral-500 font-medium">
                                <Clock className="w-3 h-3" />
                                <span>{les.estimatedMinutes}m</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
