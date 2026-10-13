import React, { useState } from 'react';
import { Terminal as TerminalComponent } from '../components/Terminal';
import { FilesystemVisualizer } from '../components/FilesystemVisualizer';
import { VirtualFileSystem, TreeItem } from '../services/terminal/virtualFs';
import { CommandExecutor, CommandResult } from '../services/terminal/commandExecutor';
import { Terminal, Code, FolderPlus, FileCode } from 'lucide-react';

export const SandboxView: React.FC = () => {
  const [vfs] = useState(() => new VirtualFileSystem());
  const [executor] = useState(() => new CommandExecutor(vfs));
  const [tree, setTree] = useState<TreeItem>(() => vfs.getTree());
  const [showTree, setShowTree] = useState(true);

  const handleCommandExecuted = (cmd: string, res: CommandResult) => {
    setTree(vfs.getTree());
  };

  const runPresetSnippet = (snippet: string) => {
    executor.execute(snippet);
    setTree(vfs.getTree());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-neutral-950 text-black dark:text-neutral-100 overflow-hidden transition-colors">
      {/* Top Banner / Quick presets */}
      <div className="px-6 py-2.5 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-extrabold text-black dark:text-white">Free-Play Linux Terminal Sandbox</span>
          <span className="text-slate-300 dark:text-neutral-500">·</span>
          <span className="text-slate-700 dark:text-neutral-400 font-medium hidden sm:inline">
            Unrestricted safe practice environment with live VFS inspection
          </span>
        </div>

        {/* Quick Snippets */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => runPresetSnippet('mkdir -p workspace/src && touch workspace/src/index.js')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-300 border border-slate-200 dark:border-transparent rounded text-[11px] font-bold flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <FolderPlus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Generate Web Project</span>
          </button>
          <button
            onClick={() => runPresetSnippet('cat /var/log/syslog | grep "systemd" | wc -l')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-300 border border-slate-200 dark:border-transparent rounded text-[11px] font-bold flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <Code className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>Run Pipeline Filter</span>
          </button>
          <button
            onClick={() => runPresetSnippet('echo "#!/bin/bash\necho Host: $(hostname)" > host.sh && chmod +x host.sh && ./host.sh')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-neutral-300 border border-slate-200 dark:border-transparent rounded text-[11px] font-bold flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <FileCode className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Execute Shell Script</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left VFS Explorer, Right Terminal Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {showTree && (
          <div className="w-72 h-full shrink-0 border-r border-slate-200 dark:border-neutral-800">
            <FilesystemVisualizer
              tree={tree}
              currentCwd={vfs.getCwd()}
              onSelectPath={(path) => {
                executor.execute(`cd ${path}`);
                setTree(vfs.getTree());
              }}
            />
          </div>
        )}

        <div className="flex-1 h-full overflow-hidden">
          <TerminalComponent
            vfs={vfs}
            executor={executor}
            onCommandExecuted={handleCommandExecuted}
            onToggleVfsTree={() => setShowTree(!showTree)}
            vfsTreeVisible={showTree}
          />
        </div>
      </div>
    </div>
  );
};
