import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Check,
  Award,
  FileEdit,
  Play,
  Bookmark
} from 'lucide-react';
import { CURRICULUM } from '../data/curriculum';
import { Lesson } from '../types';
import { VirtualFileSystem, TreeItem } from '../services/terminal/virtualFs';
import { CommandExecutor, CommandResult } from '../services/terminal/commandExecutor';
import { StorageService } from '../services/storage';
import { Terminal } from '../components/Terminal';
import { FilesystemVisualizer } from '../components/FilesystemVisualizer';

export const WorkspaceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load lesson
  const currentLessonIndex = CURRICULUM.findIndex((l) => l.id === id);
  const lesson: Lesson = currentLessonIndex !== -1 ? CURRICULUM[currentLessonIndex] : CURRICULUM[0];

  // Persistent / isolated VFS and Executor
  const [vfs] = useState<VirtualFileSystem>(() => new VirtualFileSystem());
  const [executor] = useState<CommandExecutor>(() => new CommandExecutor(vfs));
  const [vfsTree, setVfsTree] = useState<TreeItem>(() => vfs.getTree());
  const [showVfsTree, setShowVfsTree] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'guide' | 'task' | 'quiz' | 'notes'>('guide');

  // Task verification state
  const [taskStatus, setTaskStatus] = useState<{ verified: boolean; passed: boolean; message: string }>({
    verified: false,
    passed: false,
    message: '',
  });
  const [showHint, setShowHint] = useState(false);
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string>('');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Notes state
  const [noteText, setNoteText] = useState(() => StorageService.getLessonNote(lesson.id));
  const [noteSaved, setNoteSaved] = useState(false);

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Load initial completion from storage
  useEffect(() => {
    const progress = StorageService.getProgress()[lesson.id];
    if (progress?.taskCompleted) {
      setTaskStatus({ verified: true, passed: true, message: 'Task already completed in your history.' });
    } else {
      setTaskStatus({ verified: false, passed: false, message: '' });
    }

    if (progress?.quizScore !== undefined) {
      setQuizSubmitted(true);
      setQuizScore(progress.quizScore);
    } else {
      setQuizSubmitted(false);
      setQuizScore(null);
      setSelectedAnswers({});
    }

    setNoteText(StorageService.getLessonNote(lesson.id));
    setShowHint(false);
    setVfsTree(vfs.getTree());

    const bookmarks = StorageService.getBookmarks();
    setIsBookmarked(bookmarks.some((b) => b.type === 'lesson' && b.id === lesson.id));
  }, [lesson.id, vfs]);

  const handleCommandExecuted = (cmd: string, result: CommandResult) => {
    setLastExecutedCommand(cmd);
    setVfsTree(vfs.getTree());
    StorageService.unlockAchievement('first-command');
  };

  const handleVerifyTask = () => {
    const result = lesson.task.verify(vfs, lastExecutedCommand);
    setTaskStatus({
      verified: true,
      passed: result.passed,
      message: result.message,
    });

    if (result.passed) {
      StorageService.markTaskCompleted(lesson.id);
      StorageService.markLessonCompleted(lesson.id, true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B'],
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  };

  const handleQuizOption = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    lesson.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    StorageService.markLessonCompleted(lesson.id, taskStatus.passed, score, lesson.quiz.length);

    if (score === lesson.quiz.length) {
      StorageService.unlockAchievement('quiz-master');
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (e) {
        // Ignore
      }
    }
  };

  const handleSaveNotes = () => {
    StorageService.saveLessonNote(lesson.id, noteText);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleToggleBookmark = () => {
    const state = StorageService.toggleBookmark('lesson', lesson.id);
    setIsBookmarked(state);
  };

  const nextLesson = CURRICULUM[currentLessonIndex + 1];
  const prevLesson = CURRICULUM[currentLessonIndex - 1];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-neutral-950 text-black dark:text-neutral-100 overflow-hidden transition-colors">
      {/* Top Workspace Header */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/90 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 capitalize">
            {lesson.track} Track
          </span>
          <span className="text-slate-300 dark:text-neutral-600">·</span>
          <span className="text-xs text-slate-700 dark:text-neutral-400 font-semibold hidden sm:inline">{lesson.module}</span>
          <span className="text-slate-300 dark:text-neutral-600 hidden sm:inline">·</span>
          <h2 className="text-sm font-bold text-black dark:text-neutral-100 truncate max-w-sm sm:max-w-md">
            {lesson.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isBookmarked
                ? 'border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
            title="Bookmark this lesson"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          {prevLesson && (
            <button
              onClick={() => navigate(`/lesson/${prevLesson.id}`)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-slate-100 dark:bg-neutral-800 rounded-lg transition-colors border border-slate-200 dark:border-transparent"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>
          )}

          {nextLesson && (
            <button
              onClick={() => navigate(`/lesson/${nextLesson.id}`)}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Flagship Split Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-neutral-800 overflow-hidden">
        {/* Left Side: Interactive Terminal & Optional Live VFS Tree Drawer */}
        <div className="h-full flex overflow-hidden relative">
          {showVfsTree && (
            <div className="w-64 h-full shrink-0 border-r border-slate-200 dark:border-neutral-800 z-10">
              <FilesystemVisualizer
                tree={vfsTree}
                currentCwd={vfs.getCwd()}
                onSelectPath={(path) => {
                  executor.execute(`cd ${path}`);
                  setVfsTree(vfs.getTree());
                }}
              />
            </div>
          )}

          <div className="flex-1 h-full overflow-hidden">
            <Terminal
              vfs={vfs}
              executor={executor}
              onCommandExecuted={handleCommandExecuted}
              onToggleVfsTree={() => setShowVfsTree(!showVfsTree)}
              vfsTreeVisible={showVfsTree}
            />
          </div>
        </div>

        {/* Right Side: Lesson Reference, Tasks, Quiz, & Notes */}
        <div className="h-full flex flex-col bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-transparent'
                  : 'text-slate-800 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Concept Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('task')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap relative ${
                activeTab === 'task'
                  ? 'bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-transparent'
                  : 'text-slate-800 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Practical Task</span>
              {taskStatus.passed && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-transparent'
                  : 'text-slate-800 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Quiz ({lesson.quiz.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-transparent'
                  : 'text-slate-800 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>My Notes</span>
            </button>
          </div>

          {/* Tab Content Canvas */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* 1. CONCEPT GUIDE TAB */}
            {activeTab === 'guide' && (
              <div className="space-y-6">
                {/* Objectives */}
                <section className="space-y-2.5">
                  <h3 className="text-xs font-extrabold tracking-wider text-black dark:text-neutral-400 uppercase">
                    Learning Objectives
                  </h3>
                  <ul className="space-y-2 text-xs text-black dark:text-neutral-300 font-medium">
                    {lesson.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Syntax */}
                <section className="space-y-2">
                  <h3 className="text-xs font-extrabold tracking-wider text-black dark:text-neutral-400 uppercase">
                    Command Syntax
                  </h3>
                  <div className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                    $ {lesson.syntax}
                  </div>
                  <p className="text-xs text-slate-800 dark:text-neutral-300 font-medium leading-relaxed pt-1">
                    {lesson.description}
                  </p>
                </section>

                {/* Important Flags */}
                {lesson.flags.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-xs font-extrabold tracking-wider text-black dark:text-neutral-400 uppercase">
                      Supported Flags & Options
                    </h3>
                    <div className="border border-slate-200 dark:border-neutral-800 rounded-xl divide-y divide-slate-200 dark:divide-neutral-800 overflow-hidden bg-slate-50 dark:bg-neutral-950/40">
                      {lesson.flags.map((flag, idx) => (
                        <div key={idx} className="p-3 flex items-start gap-3 text-xs">
                          <code className="text-emerald-700 dark:text-emerald-400 font-mono font-bold shrink-0">
                            {flag.flag}
                          </code>
                          <span className="text-slate-800 dark:text-neutral-300 font-medium leading-relaxed">{flag.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Practical Examples */}
                <section className="space-y-3">
                  <h3 className="text-xs font-extrabold tracking-wider text-black dark:text-neutral-400 uppercase">
                    Practical Usage Examples
                  </h3>
                  <div className="space-y-3">
                    {lesson.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <code className="font-mono text-emerald-800 dark:text-emerald-300 font-bold">$ {ex.command}</code>
                          <button
                            onClick={() => {
                              executor.execute(ex.command);
                              setVfsTree(vfs.getTree());
                            }}
                            className="text-[10px] text-slate-700 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 font-sans font-bold transition-colors"
                            title="Execute in terminal"
                          >
                            <Play className="w-3 h-3" /> Run Example
                          </button>
                        </div>
                        <p className="text-slate-800 dark:text-neutral-400 font-medium">{ex.explanation}</p>
                        {ex.expectedOutput && (
                          <div className="pt-2 border-t border-slate-200 dark:border-neutral-900 font-mono text-[11px] text-slate-700 dark:text-neutral-500 whitespace-pre-wrap font-medium">
                            Expected Output:\n{ex.expectedOutput}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Common Mistakes */}
                {lesson.commonMistakes.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-xs font-extrabold tracking-wider text-black dark:text-neutral-400 uppercase">
                      Common Beginner Pitfalls
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-800 dark:text-neutral-300 font-medium">
                      {lesson.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Move to Task Button */}
                <div className="pt-4 border-t border-slate-200 dark:border-neutral-800">
                  <button
                    onClick={() => setActiveTab('task')}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Proceed to Hands-on Task</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. PRACTICAL TASK TAB */}
            {activeTab === 'task' && (
              <div className="space-y-6">
                <div className="p-5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Practical Challenge
                    </span>
                    {taskStatus.passed && (
                      <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" /> Verified Complete
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-black dark:text-white">
                    {lesson.task.problemStatement}
                  </h3>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-neutral-400">Step-by-step Goal:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-black dark:text-neutral-300 font-medium leading-relaxed">
                      {lesson.task.instructions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Actions: Check Answer & Hint */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleVerifyTask}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
                  >
                    Check Answer
                  </button>

                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-300 text-xs font-bold rounded-xl transition-colors border border-slate-200 dark:border-transparent"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                  </button>
                </div>

                {/* Hints box */}
                {showHint && (
                  <div className="p-4 bg-sky-50 dark:bg-neutral-950 border border-sky-200 dark:border-neutral-800 rounded-xl space-y-2 text-xs animate-fade-in text-sky-950 dark:text-sky-400">
                    <span className="font-bold">Guidance Hint:</span>
                    <ul className="space-y-1">
                      {lesson.task.hints.map((h, i) => (
                        <li key={i} className="font-mono">{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Task Result Callout */}
                {taskStatus.verified && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 animate-fade-in ${
                      taskStatus.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-medium'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {taskStatus.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Task Passed! Virtual filesystem state is verified.</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>Verification Unsuccessful</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed">{taskStatus.message}</p>
                    {taskStatus.passed && (
                      <div className="pt-2 text-[11px] text-emerald-800 dark:text-emerald-400/90 border-t border-emerald-200 dark:border-emerald-900/60 font-sans">
                        {lesson.task.solutionExplanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Proceed to Quiz Button */}
                {taskStatus.passed && (
                  <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 flex justify-end">
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Take Lesson Quiz</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. KNOWLEDGE QUIZ TAB */}
            {activeTab === 'quiz' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold tracking-wider text-black dark:text-neutral-400 uppercase">
                    Lesson Understanding Assessment
                  </h3>
                  {quizSubmitted && quizScore !== null && (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      Score: {quizScore} / {lesson.quiz.length} (
                      {Math.round((quizScore / lesson.quiz.length) * 100)}%)
                    </span>
                  )}
                </div>

                <div className="space-y-5">
                  {lesson.quiz.map((q, idx) => {
                    const userSelection = selectedAnswers[q.id];
                    return (
                      <div
                        key={q.id}
                        className="p-5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-2xl space-y-3.5 text-xs"
                      >
                        <h4 className="text-xs font-bold text-black dark:text-neutral-200">
                          {idx + 1}. {q.question}
                        </h4>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            let itemStyle = 'bg-white dark:bg-transparent border-slate-200 dark:border-neutral-800 text-black dark:text-neutral-300 hover:bg-slate-100 dark:hover:border-neutral-700';
                            if (userSelection === optIdx) {
                              itemStyle = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-950 dark:text-white font-bold';
                            }
                            if (quizSubmitted) {
                              if (optIdx === q.correctIndex) {
                                itemStyle = 'border-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-300 font-bold';
                              } else if (userSelection === optIdx && userSelection !== q.correctIndex) {
                                itemStyle = 'border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-rose-950 dark:text-rose-300 font-bold';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleQuizOption(q.id, optIdx)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex items-center justify-between font-medium ${itemStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && optIdx === q.correctIndex && (
                                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="pt-2.5 text-xs text-slate-800 dark:text-neutral-400 border-t border-slate-200 dark:border-neutral-900 leading-relaxed font-medium">
                            <span className="font-bold text-black dark:text-neutral-300">Explanation: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
                  >
                    Submit Quiz Answers
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-emerald-900 dark:text-emerald-300 font-bold">
                      Quiz Submitted! Review the explanations above.
                    </span>
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedAnswers({});
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-300 rounded text-xs transition-colors font-bold"
                    >
                      Retake Quiz
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. MY NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold tracking-wider text-black dark:text-neutral-400 uppercase">
                    Personal Study Notes
                  </h3>
                  {noteSaved && (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Notes Saved!</span>
                  )}
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record your observations, key syntax flags, or troubleshooting commands here..."
                  className="w-full h-64 p-4 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-2xl text-xs text-black dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
