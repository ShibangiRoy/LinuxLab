import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Copy, RotateCcw, Trash2, Check, Sparkles, FolderTree } from 'lucide-react';
import { VirtualFileSystem } from '../services/terminal/virtualFs';
import { CommandExecutor, CommandResult } from '../services/terminal/commandExecutor';

interface TerminalProps {
  vfs: VirtualFileSystem;
  executor: CommandExecutor;
  onCommandExecuted?: (cmd: string, result: CommandResult) => void;
  onToggleVfsTree?: () => void;
  vfsTreeVisible?: boolean;
}

interface LogEntry {
  command?: string;
  output?: string;
  cwd: string;
  isError?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  vfs,
  executor,
  onCommandExecuted,
  onToggleVfsTree,
  vfsTreeVisible,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      output: `LinuxLab Terminal Environment (Simulated GNU/Linux x86_64)\nType "help", "man", or any standard Linux command below.\nTab completion is supported for commands and files.\n`,
      cwd: vfs.getCwd(),
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    if (raw === 'clear') {
      setLogs([]);
      setInputVal('');
      setHistoryIndex(-1);
      return;
    }

    const currentCwd = vfs.getCwd();
    const res = executor.execute(raw);

    setLogs((prev) => [
      ...prev,
      {
        command: raw,
        output: res.stdout || res.stderr,
        isError: res.exitCode !== 0,
        cwd: currentCwd,
      },
    ]);

    setInputVal('');
    setHistoryIndex(-1);
    onCommandExecuted?.(raw, res);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const history = executor.getHistory();

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const completions = executor.getCompletions(inputVal);
      if (completions.length === 1) {
        const parts = inputVal.trimStart().split(/\s+/);
        if (parts.length <= 1) {
          setInputVal(completions[0] + ' ');
        } else {
          parts[parts.length - 1] = completions[0];
          setInputVal(parts.join(' ') + ' ');
        }
      } else if (completions.length > 1) {
        setLogs((prev) => [
          ...prev,
          {
            output: completions.join('  ') + '\n',
            cwd: vfs.getCwd(),
          },
        ]);
      }
    }
  };

  const handleCopyLogs = () => {
    const fullText = logs
      .map((l) => (l.command ? `learner@linuxlab:${l.cwd}$ ${l.command}\n${l.output || ''}` : l.output || ''))
      .join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetVfs = () => {
    vfs.reset();
    setLogs([
      {
        output: 'Virtual filesystem reset to initial clean sandbox state.\n',
        cwd: '/home/learner',
      },
    ]);
  };

  return (
    <div
      className="flex flex-col h-full bg-[#0a0d12] text-neutral-200 font-mono text-xs select-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Top Terminal Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 shrink-0 font-sans transition-colors">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-extrabold text-black dark:text-neutral-200 text-xs">
            learner@linuxlab-box
          </span>
          <span className="text-[11px] text-slate-700 dark:text-neutral-500 font-mono font-bold">
            ({vfs.getCwd()})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleVfsTree && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVfsTree();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                vfsTreeVisible
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                  : 'bg-white text-black border border-slate-200 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-white dark:border-transparent'
              }`}
              title="Toggle Live File System Tree"
            >
              <FolderTree className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>VFS Tree</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyLogs();
            }}
            className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-md text-[11px] text-black dark:text-neutral-400 dark:hover:text-white border border-slate-200 dark:border-transparent transition-colors font-bold"
            title="Copy terminal session"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLogs([]);
            }}
            className="p-1 text-slate-700 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 rounded transition-colors"
            title="Clear terminal (or type 'clear')"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetVfs();
            }}
            className="p-1 text-slate-700 hover:text-amber-600 dark:text-neutral-400 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded transition-colors"
            title="Reset Virtual Filesystem"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 leading-relaxed">
        {logs.map((log, idx) => (
          <div key={idx} className="space-y-1">
            {log.command !== undefined && (
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="text-emerald-400 font-semibold">learner@linuxlab</span>
                <span className="text-neutral-500">:</span>
                <span className="text-sky-400 font-medium">{log.cwd}</span>
                <span className="text-neutral-500">$</span>
                <span className="text-white font-bold">{log.command}</span>
              </div>
            )}
            {log.output && (
              <pre
                className={`whitespace-pre-wrap ${
                  log.isError ? 'text-rose-400' : 'text-neutral-300'
                }`}
              >
                {log.output}
              </pre>
            )}
          </div>
        ))}

        {/* Live Input Prompt */}
        <form onSubmit={handleExecute} className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 font-semibold shrink-0">learner@linuxlab</span>
          <span className="text-neutral-500 shrink-0">:</span>
          <span className="text-sky-400 font-medium shrink-0">{vfs.getCwd()}</span>
          <span className="text-neutral-500 shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-neutral-600 caret-emerald-400"
            placeholder="enter command (Tab to autocomplete)..."
            autoFocus
          />
        </form>
        <div ref={scrollRef} />
      </div>

      {/* Terminal Keyboard Helper Footer */}
      <div className="px-4 py-1.5 bg-slate-100 dark:bg-neutral-900/50 border-t border-slate-200 dark:border-neutral-800 text-[10px] text-slate-800 dark:text-neutral-500 font-bold flex items-center justify-between shrink-0 font-sans transition-colors">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1 py-0.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-transparent rounded font-mono text-black dark:text-white">Enter</kbd> run</span>
          <span><kbd className="px-1 py-0.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-transparent rounded font-mono text-black dark:text-white">Tab</kbd> autocomplete</span>
          <span><kbd className="px-1 py-0.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-transparent rounded font-mono text-black dark:text-white">↑ / ↓</kbd> history</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400/80">
          <Sparkles className="w-3 h-3" />
          <span>Sandboxed VFS</span>
        </div>
      </div>
    </div>
  );
};
