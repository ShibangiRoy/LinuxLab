import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, HardDrive } from 'lucide-react';
import { TreeItem } from '../services/terminal/virtualFs';

interface FilesystemVisualizerProps {
  tree: TreeItem;
  currentCwd: string;
  onSelectPath?: (path: string) => void;
}

export const FilesystemVisualizer: React.FC<FilesystemVisualizerProps> = ({
  tree,
  currentCwd,
  onSelectPath,
}) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-950 border-r border-slate-200 dark:border-neutral-800 text-xs text-black dark:text-neutral-300 font-mono select-none overflow-hidden transition-colors">
      <div className="p-3 bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-black dark:text-neutral-200 font-sans text-xs">Virtual Filesystem (VFS)</span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-sans font-bold">Live State</span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-1">
        <TreeNodeItem item={tree} currentCwd={currentCwd} onSelectPath={onSelectPath} depth={0} />
      </div>

      <div className="p-2.5 bg-slate-50 dark:bg-neutral-900/60 border-t border-slate-200 dark:border-neutral-800 text-[11px] text-slate-700 dark:text-neutral-400 font-sans flex items-center justify-between font-bold">
        <span>CWD:</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-mono truncate max-w-[180px]">{currentCwd}</span>
      </div>
    </div>
  );
};

const TreeNodeItem: React.FC<{
  item: TreeItem;
  currentCwd: string;
  onSelectPath?: (path: string) => void;
  depth: number;
}> = ({ item, currentCwd, onSelectPath, depth }) => {
  const [isOpen, setIsOpen] = useState(depth < 3);

  const isDirectory = item.type === 'dir';
  const isCwd = currentCwd === item.path;

  return (
    <div>
      <div
        onClick={() => {
          if (isDirectory) setIsOpen(!isOpen);
          onSelectPath?.(item.path);
        }}
        style={{ paddingLeft: `${depth * 14}px` }}
        className={`flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors ${
          isCwd
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800/60'
            : 'hover:bg-slate-100 dark:hover:bg-neutral-800 text-black dark:text-neutral-400 font-medium'
        }`}
      >
        {isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-500 shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 h-3.5 shrink-0" />
            <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-neutral-400 shrink-0" />
          </>
        )}

        <span className="truncate flex-1 font-mono text-[11px] font-medium">{item.name}</span>

        {!isDirectory && (
          <span className="text-[10px] text-slate-500 dark:text-neutral-600 font-mono font-semibold">{item.size}B</span>
        )}
      </div>

      {isDirectory && isOpen && item.children && (
        <div className="space-y-0.5">
          {item.children.map((child) => (
            <TreeNodeItem
              key={child.path}
              item={child}
              currentCwd={currentCwd}
              onSelectPath={onSelectPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
