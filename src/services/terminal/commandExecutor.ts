import { VirtualFileSystem, VNode } from './virtualFs';

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  newCwd?: string;
}

export class CommandExecutor {
  private vfs: VirtualFileSystem;
  private env: Record<string, string> = {
    USER: 'learner',
    HOME: '/home/learner',
    SHELL: '/bin/bash',
    PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    TERM: 'xterm-256color',
    LANG: 'en_US.UTF-8',
    PWD: '/home/learner',
  };
  private previousCwd: string = '/home/learner';
  private history: string[] = [];

  constructor(vfs: VirtualFileSystem) {
    this.vfs = vfs;
  }

  public getHistory(): string[] {
    return [...this.history];
  }

  public getCompletions(input: string): string[] {
    const trimmed = input.trimStart();
    const parts = trimmed.split(/\s+/);
    const lastWord = parts[parts.length - 1] || '';

    // If starting a new command or single word
    if (parts.length <= 1) {
      const knownCommands = [
        'pwd', 'ls', 'cd', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'cat', 'head', 'tail',
        'grep', 'wc', 'sort', 'uniq', 'cut', 'echo', 'chmod', 'whoami', 'uname',
        'date', 'hostname', 'df', 'du', 'free', 'ps', 'top', 'kill', 'env', 'export',
        'clear', 'history', 'man'
      ];
      return knownCommands.filter((c) => c.startsWith(lastWord));
    }

    // Path completion
    const targetDir = lastWord.includes('/')
      ? lastWord.slice(0, lastWord.lastIndexOf('/') + 1)
      : '';
    const prefix = lastWord.slice(lastWord.lastIndexOf('/') + 1);

    const resolved = this.vfs.resolvePath(targetDir || '.');
    const node = this.vfs.getNode(resolved);
    if (!node || !node.children) return [];

    return Object.keys(node.children)
      .filter((name) => name.startsWith(prefix))
      .map((name) => (targetDir ? `${targetDir}${name}` : name));
  }

  public execute(rawInput: string): CommandResult {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    this.history.push(trimmed);

    // Pipelines
    if (trimmed.includes('|')) {
      return this.executePipeline(trimmed);
    }

    // Redirections (> or >>)
    if (trimmed.includes('>>') || trimmed.includes('>')) {
      return this.executeRedirection(trimmed);
    }

    return this.dispatchSingle(trimmed);
  }

  private dispatchSingle(cmdStr: string): CommandResult {
    const expanded = this.expandVariables(cmdStr);
    const tokens = this.tokenize(expanded);
    if (tokens.length === 0) return { stdout: '', stderr: '', exitCode: 0 };

    const cmd = tokens[0];
    const args = tokens.slice(1);

    switch (cmd) {
      case 'pwd':
        return { stdout: this.vfs.getCwd() + '\n', stderr: '', exitCode: 0 };

      case 'whoami':
        return { stdout: `${this.env.USER}\n`, stderr: '', exitCode: 0 };

      case 'hostname':
        return { stdout: 'linuxlab-box\n', stderr: '', exitCode: 0 };

      case 'date':
        return { stdout: new Date().toUTCString() + '\n', stderr: '', exitCode: 0 };

      case 'clear':
        return { stdout: '\x1b[2J\x1b[H', stderr: '', exitCode: 0 };

      case 'history': {
        const list = this.history
          .map((h, i) => `  ${(i + 1).toString().padStart(4, ' ')}  ${h}`)
          .join('\n');
        return { stdout: list ? list + '\n' : '', stderr: '', exitCode: 0 };
      }

      case 'uname': {
        const hasA = args.includes('-a');
        const hasR = args.includes('-r');
        if (hasA) {
          return {
            stdout: 'Linux linuxlab-box 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux\n',
            stderr: '',
            exitCode: 0,
          };
        }
        if (hasR) return { stdout: '6.8.0-45-generic\n', stderr: '', exitCode: 0 };
        return { stdout: 'Linux\n', stderr: '', exitCode: 0 };
      }

      case 'cd': {
        const dest = args[0] || '~';
        let targetPath = dest;
        if (dest === '-') {
          targetPath = this.previousCwd;
        }

        const current = this.vfs.getCwd();
        const ok = this.vfs.setCwd(targetPath);
        if (!ok) {
          return { stdout: '', stderr: `cd: ${dest}: No such file or directory\n`, exitCode: 1 };
        }
        this.previousCwd = current;
        this.env.PWD = this.vfs.getCwd();
        if (dest === '-') {
          return { stdout: `${this.vfs.getCwd()}\n`, stderr: '', exitCode: 0, newCwd: this.vfs.getCwd() };
        }
        return { stdout: '', stderr: '', exitCode: 0, newCwd: this.vfs.getCwd() };
      }

      case 'ls': {
        let showAll = false;
        let showLong = false;
        let humanReadable = false;
        const targets: string[] = [];

        for (const arg of args) {
          if (arg.startsWith('-') && arg !== '-') {
            if (arg.includes('a')) showAll = true;
            if (arg.includes('l')) showLong = true;
            if (arg.includes('h')) humanReadable = true;
          } else {
            targets.push(arg);
          }
        }

        const targetPath = targets[0] || this.vfs.getCwd();
        const resolved = this.vfs.resolvePath(targetPath);
        const node = this.vfs.getNode(resolved);

        if (!node) {
          return { stdout: '', stderr: `ls: cannot access '${targetPath}': No such file or directory\n`, exitCode: 2 };
        }

        if (node.type === 'file') {
          return { stdout: node.name + '\n', stderr: '', exitCode: 0 };
        }

        const entries: string[] = [];
        if (showAll) {
          entries.push(showLong ? `drwxr-xr-x 2 learner learner 4096 Oct 13 04:00 .` : '.');
          entries.push(showLong ? `drwxr-xr-x 4 root    root    4096 Oct 13 04:00 ..` : '..');
        }

        if (node.children) {
          const names = Object.keys(node.children).sort();
          for (const name of names) {
            if (!showAll && name.startsWith('.')) continue;
            const child = node.children[name];
            if (showLong) {
              const typeChar = child.type === 'dir' ? 'd' : '-';
              const sizeVal = child.content ? child.content.length : 4096;
              const sizeStr = humanReadable && sizeVal > 1024
                ? `${Math.round(sizeVal / 1024)}K`
                : sizeVal.toString();
              const dateStr = new Date(child.modified).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
              entries.push(
                `${typeChar}${child.permissions.padEnd(9)} 1 ${child.owner.padEnd(8)} ${child.group.padEnd(8)} ${sizeStr.padStart(6)} ${dateStr} ${name}`
              );
            } else {
              entries.push(name);
            }
          }
        }

        return { stdout: entries.join(showLong ? '\n' : '  ') + (entries.length ? '\n' : ''), stderr: '', exitCode: 0 };
      }

      case 'mkdir': {
        const recursive = args.includes('-p');
        const dirNames = args.filter((a) => !a.startsWith('-'));
        if (dirNames.length === 0) {
          return { stdout: '', stderr: "mkdir: missing operand\nTry 'mkdir --help' for more information.\n", exitCode: 1 };
        }

        for (const name of dirNames) {
          const res = this.vfs.createDirectory(name, recursive);
          if (!res.success) {
            return { stdout: '', stderr: `mkdir: cannot create directory '${name}': ${res.error}\n`, exitCode: 1 };
          }
        }
        return { stdout: '', stderr: '', exitCode: 0 };
      }

      case 'touch': {
        const fileNames = args.filter((a) => !a.startsWith('-'));
        if (fileNames.length === 0) {
          return { stdout: '', stderr: 'touch: missing file operand\n', exitCode: 1 };
        }
        for (const name of fileNames) {
          const res = this.vfs.createFile(name, '');
          if (!res.success) {
            return { stdout: '', stderr: `touch: cannot touch '${name}': ${res.error}\n`, exitCode: 1 };
          }
        }
        return { stdout: '', stderr: '', exitCode: 0 };
      }

      case 'cat': {
        const numberLines = args.includes('-n');
        const targets = args.filter((a) => !a.startsWith('-'));
        if (targets.length === 0) {
          return { stdout: '', stderr: 'cat: missing file operand\n', exitCode: 1 };
        }

        const outputParts: string[] = [];
        for (const target of targets) {
          const resolved = this.vfs.resolvePath(target);
          const node = this.vfs.getNode(resolved);
          if (!node) {
            return { stdout: '', stderr: `cat: ${target}: No such file or directory\n`, exitCode: 1 };
          }
          if (node.type === 'dir') {
            return { stdout: '', stderr: `cat: ${target}: Is a directory\n`, exitCode: 1 };
          }

          let content = node.content || '';
          if (numberLines) {
            content = content
              .split('\n')
              .map((line, i) => `     ${i + 1}  ${line}`)
              .join('\n');
          }
          outputParts.push(content);
        }

        const out = outputParts.join('');
        return { stdout: out.endsWith('\n') ? out : out + '\n', stderr: '', exitCode: 0 };
      }

      case 'head': {
        let linesCount = 10;
        let fileArg = '';
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-n' && args[i + 1]) {
            linesCount = parseInt(args[i + 1], 10) || 10;
            i++;
          } else if (args[i].startsWith('-') && /^\-\d+$/.test(args[i])) {
            linesCount = parseInt(args[i].slice(1), 10) || 10;
          } else if (!args[i].startsWith('-')) {
            fileArg = args[i];
          }
        }

        if (!fileArg) return { stdout: '', stderr: 'head: missing operand\n', exitCode: 1 };
        const resolved = this.vfs.resolvePath(fileArg);
        const node = this.vfs.getNode(resolved);
        if (!node || node.type !== 'file') return { stdout: '', stderr: `head: cannot open '${fileArg}': No such file\n`, exitCode: 1 };

        const lines = (node.content || '').split('\n').slice(0, linesCount).join('\n');
        return { stdout: lines + '\n', stderr: '', exitCode: 0 };
      }

      case 'tail': {
        let linesCount = 10;
        let fileArg = '';
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-n' && args[i + 1]) {
            linesCount = parseInt(args[i + 1], 10) || 10;
            i++;
          } else if (!args[i].startsWith('-')) {
            fileArg = args[i];
          }
        }

        if (!fileArg) return { stdout: '', stderr: 'tail: missing operand\n', exitCode: 1 };
        const resolved = this.vfs.resolvePath(fileArg);
        const node = this.vfs.getNode(resolved);
        if (!node || node.type !== 'file') return { stdout: '', stderr: `tail: cannot open '${fileArg}': No such file\n`, exitCode: 1 };

        const allLines = (node.content || '').split('\n');
        const lines = allLines.slice(Math.max(0, allLines.length - linesCount)).join('\n');
        return { stdout: lines + '\n', stderr: '', exitCode: 0 };
      }

      case 'cp': {
        const recursive = args.includes('-r') || args.includes('-R');
        const targets = args.filter((a) => !a.startsWith('-'));
        if (targets.length < 2) return { stdout: '', stderr: 'cp: missing destination file operand\n', exitCode: 1 };
        const src = targets[0];
        const dest = targets[1];
        const res = this.vfs.copyNode(src, dest, recursive);
        if (!res.success) return { stdout: '', stderr: `cp: ${res.error}\n`, exitCode: 1 };
        return { stdout: '', stderr: '', exitCode: 0 };
      }

      case 'mv': {
        const targets = args.filter((a) => !a.startsWith('-'));
        if (targets.length < 2) return { stdout: '', stderr: 'mv: missing destination file operand\n', exitCode: 1 };
        const src = targets[0];
        const dest = targets[1];
        const res = this.vfs.moveNode(src, dest);
        if (!res.success) return { stdout: '', stderr: `mv: ${res.error}\n`, exitCode: 1 };
        return { stdout: '', stderr: '', exitCode: 0 };
      }

      case 'rm': {
        const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-R');
        const targets = args.filter((a) => !a.startsWith('-'));
        if (targets.length === 0) return { stdout: '', stderr: 'rm: missing operand\n', exitCode: 1 };
        for (const t of targets) {
          const res = this.vfs.removeNode(t, recursive);
          if (!res.success && !args.includes('-f') && !args.includes('-rf')) {
            return { stdout: '', stderr: `rm: cannot remove '${t}': ${res.error}\n`, exitCode: 1 };
          }
        }
        return { stdout: '', stderr: '', exitCode: 0 };
      }

      case 'chmod': {
        const targets = args.filter((a) => !a.startsWith('-') || a === '+x' || a === '-x');
        if (targets.length < 2) return { stdout: '', stderr: 'chmod: missing operand\nUsage: chmod [MODE] FILE\n', exitCode: 1 };
        const mode = targets[0];
        const file = targets[1];
        const res = this.vfs.setPermissions(file, mode);
        if (!res.success) return { stdout: '', stderr: `chmod: ${res.error}\n`, exitCode: 1 };
        return { stdout: '', stderr: '', exitCode: 0 };
      }

      case 'grep': {
        const ignoreCase = args.includes('-i');
        const invert = args.includes('-v');
        const number = args.includes('-n');
        const cleanArgs = args.filter((a) => !a.startsWith('-'));

        if (cleanArgs.length < 2) return { stdout: '', stderr: 'Usage: grep [OPTIONS] PATTERN FILE\n', exitCode: 2 };
        const pattern = cleanArgs[0];
        const file = cleanArgs[1];

        const resolved = this.vfs.resolvePath(file);
        const node = this.vfs.getNode(resolved);
        if (!node || node.type !== 'file') return { stdout: '', stderr: `grep: ${file}: No such file\n`, exitCode: 2 };

        const lines = (node.content || '').split('\n');
        const matches: string[] = [];
        const regex = new RegExp(pattern, ignoreCase ? 'i' : '');

        lines.forEach((l, idx) => {
          const hit = regex.test(l);
          if ((hit && !invert) || (!hit && invert)) {
            matches.push(number ? `${idx + 1}:${l}` : l);
          }
        });

        return { stdout: matches.length > 0 ? matches.join('\n') + '\n' : '', stderr: '', exitCode: matches.length > 0 ? 0 : 1 };
      }

      case 'wc': {
        const countLines = args.includes('-l');
        const countWords = args.includes('-w');
        const countBytes = args.includes('-c');
        const fileArg = args.find((a) => !a.startsWith('-'));
        if (!fileArg) return { stdout: '', stderr: 'wc: missing file operand\n', exitCode: 1 };

        const resolved = this.vfs.resolvePath(fileArg);
        const node = this.vfs.getNode(resolved);
        if (!node || node.type !== 'file') return { stdout: '', stderr: `wc: ${fileArg}: No such file\n`, exitCode: 1 };

        const text = node.content || '';
        const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
        const words = text.split(/\s+/).filter(Boolean).length;
        const bytes = text.length;

        if (countLines && !countWords && !countBytes) return { stdout: `${lines} ${fileArg}\n`, stderr: '', exitCode: 0 };
        if (countWords && !countLines && !countBytes) return { stdout: `${words} ${fileArg}\n`, stderr: '', exitCode: 0 };
        if (countBytes && !countLines && !countWords) return { stdout: `${bytes} ${fileArg}\n`, stderr: '', exitCode: 0 };

        return { stdout: ` ${lines}  ${words} ${bytes} ${fileArg}\n`, stderr: '', exitCode: 0 };
      }

      case 'echo': {
        const text = args.join(' ').replace(/^["']|["']$/g, '');
        return { stdout: text + '\n', stderr: '', exitCode: 0 };
      }

      case 'env': {
        const out = Object.entries(this.env)
          .map(([k, v]) => `${k}=${v}`)
          .join('\n');
        return { stdout: out + '\n', stderr: '', exitCode: 0 };
      }

      case 'export': {
        if (args.length === 0) {
          const out = Object.entries(this.env)
            .map(([k, v]) => `declare -x ${k}="${v}"`)
            .join('\n');
          return { stdout: out + '\n', stderr: '', exitCode: 0 };
        }
        for (const arg of args) {
          if (arg.includes('=')) {
            const [key, ...vals] = arg.split('=');
            this.env[key.trim()] = vals.join('=').replace(/^["']|["']$/g, '');
          }
        }
        return { stdout: '', stderr: '', exitCode: 0 };
      }

      case 'df': {
        return {
          stdout: 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/root       20511312 4194304  15264384  22% /\ntmpfs            1024000      64   1023936   1% /tmp\n',
          stderr: '',
          exitCode: 0,
        };
      }

      case 'free': {
        return {
          stdout: '               total        used        free      shared  buff/cache   available\nMem:         8192000     2048000     4096000      128000     2048000     5896000\nSwap:        2097152           0     2097152\n',
          stderr: '',
          exitCode: 0,
        };
      }

      case 'ps': {
        return {
          stdout: '  PID TTY          TIME CMD\n 1201 pts/0    00:00:00 bash\n 1450 pts/0    00:00:00 ps\n',
          stderr: '',
          exitCode: 0,
        };
      }

      case 'top': {
        return {
          stdout: 'top - 04:30:15 up 2 days,  1:10,  1 user,  load average: 0.05, 0.08, 0.02\nTasks:  94 total,   1 running,  93 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  1.2 us,  0.5 sy,  0.0 ni, 98.2 id,  0.1 wa,  0.0 hi,  0.0 si\nMiB Mem :   8000.0 total,   4000.0 free,   2000.0 used,   2000.0 buff/cache\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1201 learner   20   0   14384   5412   3820 S   0.0   0.1   0:00.12 bash\n    1 root      20   0  168444  11280   8240 S   0.0   0.1   0:01.88 systemd\n',
          stderr: '',
          exitCode: 0,
        };
      }

      case 'man': {
        const topic = args[0] || '';
        const manuals: Record<string, string> = {
          pwd: 'NAME\n    pwd - print name of current/working directory\n\nSYNOPSIS\n    pwd [-LP]\n\nDESCRIPTION\n    Print the full filename of the current working directory.',
          ls: 'NAME\n    ls - list directory contents\n\nSYNOPSIS\n    ls [OPTION]... [FILE]...\n\nDESCRIPTION\n    List information about the FILEs (the current directory by default).\n    -a, --all: do not ignore entries starting with .\n    -l: use a long listing format\n    -h, --human-readable: with -l, print sizes like 1K 234M 2G',
          mkdir: 'NAME\n    mkdir - make directories\n\nSYNOPSIS\n    mkdir [OPTION]... DIRECTORY...\n\nDESCRIPTION\n    Create the DIRECTORY(ies), if they do not already exist.\n    -p, --parents: no error if existing, make parent directories as needed.',
          cat: 'NAME\n    cat - concatenate files and print on the standard output\n\nSYNOPSIS\n    cat [OPTION]... [FILE]...\n\nDESCRIPTION\n    Concatenate FILE(s) to standard output.\n    -n, --number: number all output lines',
          grep: 'NAME\n    grep - print lines that match patterns\n\nSYNOPSIS\n    grep [OPTION]... PATTERNS [FILE]...\n\nDESCRIPTION\n    Search for PATTERNS in each FILE.\n    -i, --ignore-case: ignore case distinctions\n    -v, --invert-match: select non-matching lines\n    -n, --line-number: prefix each line of output with the 1-based line number',
          chmod: 'NAME\n    chmod - change file mode bits\n\nSYNOPSIS\n    chmod [OPTION]... MODE[,MODE]... FILE...\n\nDESCRIPTION\n    This manual page documents the GNU version of chmod. chmod changes the file mode bits of each given file.',
        };

        if (manuals[topic]) {
          return { stdout: manuals[topic] + '\n', stderr: '', exitCode: 0 };
        }
        return { stdout: '', stderr: `No manual entry for ${topic || 'unknown'}\n`, exitCode: 16 };
      }

      default:
        // Check if user is executing a script directly: ./script.sh
        if (cmd.startsWith('./') || cmd.startsWith('/')) {
          const resolved = this.vfs.resolvePath(cmd);
          const node = this.vfs.getNode(resolved);
          if (!node) {
            return { stdout: '', stderr: `bash: ${cmd}: No such file or directory\n`, exitCode: 127 };
          }
          if (node.type === 'dir') {
            return { stdout: '', stderr: `bash: ${cmd}: Is a directory\n`, exitCode: 126 };
          }
          if (!node.permissions.includes('x')) {
            return { stdout: '', stderr: `bash: ${cmd}: Permission denied (need chmod +x ${cmd})\n`, exitCode: 126 };
          }

          // Execute script lines safely
          const scriptLines = (node.content || '').split('\n').filter((l) => l.trim() && !l.startsWith('#'));
          let scriptOut = '';
          for (const line of scriptLines) {
            const sub = this.execute(line);
            scriptOut += sub.stdout || sub.stderr;
            if (sub.exitCode !== 0) return { stdout: scriptOut, stderr: sub.stderr, exitCode: sub.exitCode };
          }
          return { stdout: scriptOut, stderr: '', exitCode: 0 };
        }

        return {
          stdout: '',
          stderr: `linuxlab: command not found: ${cmd}. Type 'man' or explore the lesson panel.\n`,
          exitCode: 127,
        };
    }
  }

  private executeRedirection(raw: string): CommandResult {
    const isAppend = raw.includes('>>');
    const separator = isAppend ? '>>' : '>';
    const parts = raw.split(separator);
    const leftCmd = parts[0].trim();
    const targetFile = parts[1].trim();

    if (!targetFile) {
      return { stdout: '', stderr: 'bash: syntax error near unexpected token \'newline\'\n', exitCode: 2 };
    }

    const result = this.dispatchSingle(leftCmd);
    if (result.exitCode !== 0) return result;

    const writeRes = this.vfs.createFile(targetFile, result.stdout, isAppend);
    if (!writeRes.success) {
      return { stdout: '', stderr: `bash: ${targetFile}: ${writeRes.error}\n`, exitCode: 1 };
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private executePipeline(raw: string): CommandResult {
    const stages = raw.split('|').map((s) => s.trim());
    let currentInput = '';

    for (const stage of stages) {
      const tokens = this.tokenize(stage);
      const cmd = tokens[0];
      const args = tokens.slice(1);

      if (cmd === 'grep') {
        const ignoreCase = args.includes('-i');
        const invert = args.includes('-v');
        const pattern = args.find((a) => !a.startsWith('-')) || '';
        const lines = currentInput.split('\n');
        const regex = new RegExp(pattern, ignoreCase ? 'i' : '');
        const filtered = lines.filter((l) => {
          if (!l) return false;
          const hit = regex.test(l);
          return invert ? !hit : hit;
        });
        currentInput = filtered.length > 0 ? filtered.join('\n') + '\n' : '';
      } else if (cmd === 'wc') {
        const countLines = args.includes('-l');
        const lines = currentInput.split('\n').filter(Boolean).length;
        const words = currentInput.split(/\s+/).filter(Boolean).length;
        const bytes = currentInput.length;
        if (countLines) {
          currentInput = `${lines}\n`;
        } else {
          currentInput = ` ${lines}  ${words} ${bytes}\n`;
        }
      } else if (cmd === 'sort') {
        const reverse = args.includes('-r');
        const lines = currentInput.split('\n').filter(Boolean);
        lines.sort();
        if (reverse) lines.reverse();
        currentInput = lines.join('\n') + '\n';
      } else if (cmd === 'uniq') {
        const lines = currentInput.split('\n').filter(Boolean);
        const unique = Array.from(new Set(lines));
        currentInput = unique.join('\n') + '\n';
      } else if (cmd === 'cut') {
        let delimiter = '\t';
        let fieldIndex = 1;
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-d' && args[i + 1]) delimiter = args[i + 1];
          if (args[i] === '-f' && args[i + 1]) fieldIndex = parseInt(args[i + 1], 10) || 1;
        }
        const lines = currentInput.split('\n').filter(Boolean);
        const extracted = lines.map((l) => {
          const parts = l.split(delimiter);
          return parts[fieldIndex - 1] || '';
        });
        currentInput = extracted.join('\n') + '\n';
      } else {
        const res = this.dispatchSingle(stage);
        if (res.exitCode !== 0) return res;
        currentInput = res.stdout;
      }
    }

    return { stdout: currentInput, stderr: '', exitCode: 0 };
  }

  private expandVariables(str: string): string {
    return str.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => {
      return this.env[name] !== undefined ? this.env[name] : '';
    });
  }

  private tokenize(str: string): string[] {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[1] !== undefined ? match[1] : match[2] !== undefined ? match[2] : match[0]);
    }
    return matches;
  }
}
