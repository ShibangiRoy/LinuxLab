import { Lesson, ModuleData } from '../types';
import { VirtualFileSystem } from '../services/terminal/virtualFs';

export const MODULES: ModuleData[] = [
  {
    id: 'mod-beg-1',
    track: 'beginner',
    title: 'Navigation & Path Mastery',
    description: 'Learn the filesystem tree structure, working directories, and absolute vs relative paths.',
    lessonIds: ['l1-pwd', 'l1-ls', 'l1-cd'],
  },
  {
    id: 'mod-beg-2',
    track: 'beginner',
    title: 'File & Folder Operations',
    description: 'Create, duplicate, move, organize, and delete files safely.',
    lessonIds: ['l1-mkdir', 'l1-touch-cat', 'l1-cp-mv-rm'],
  },
  {
    id: 'mod-beg-3',
    track: 'beginner',
    title: 'File Permissions & System Info',
    description: 'Understand file security permissions, owners, and host system information.',
    lessonIds: ['l1-permissions', 'l1-sysinfo'],
  },
  {
    id: 'mod-int-1',
    track: 'intermediate',
    title: 'Pipes, Redirection & Streams',
    description: 'Harness standard input, standard output, redirection operators, and pipeline chaining.',
    lessonIds: ['l2-redirection', 'l2-pipes-grep'],
  },
  {
    id: 'mod-int-2',
    track: 'intermediate',
    title: 'Text Transformation & Filters',
    description: 'Filter, count, sort, deduplicate, and slice tabular and delimited data.',
    lessonIds: ['l2-text-tools', 'l2-processes-env'],
  },
  {
    id: 'mod-adv-1',
    track: 'advanced',
    title: 'Shell Scripting & Automation',
    description: 'Write robust bash scripts, shebangs, handle exit codes, and execute safely.',
    lessonIds: ['l3-scripting', 'l3-cron-services'],
  },
];

export const CURRICULUM: Lesson[] = [
  // --- LEVEL 1: BEGINNER ---
  {
    id: 'l1-pwd',
    track: 'beginner',
    module: 'Navigation & Path Mastery',
    moduleId: 'mod-beg-1',
    title: '01. Inspecting Working Directory with pwd',
    estimatedMinutes: 8,
    objectives: [
      'Understand the Unix filesystem hierarchy starting from root (/).',
      'Execute the pwd (print working directory) command.',
      'Differentiate between absolute paths (/home/learner) and relative paths (.).',
    ],
    syntax: 'pwd [-L | -P]',
    description:
      'In Linux, everything is structured in a single inverted tree originating at the root directory "/". The "pwd" command reports the exact absolute path of your current shell location.',
    flags: [
      { flag: '-L', purpose: 'Logical mode: shows the working directory retaining any symbolic links.' },
      { flag: '-P', purpose: 'Physical mode: resolves any symbolic links to their real filesystem path.' },
    ],
    examples: [
      {
        command: 'pwd',
        explanation: 'Prints the current working directory.',
        expectedOutput: '/home/learner',
      },
    ],
    commonMistakes: [
      'Typing "PWD" in uppercase — Linux is strictly case-sensitive.',
      'Confusing the root directory "/" with the root user\'s home "/root".',
    ],
    task: {
      id: 'task-l1-pwd',
      problemStatement: 'Verify your current terminal location.',
      instructions: [
        'Run the print working directory command to verify that your session started in your user home folder.',
      ],
      hints: [
        'Type "pwd" and press Enter.',
      ],
      solutionExplanation: 'Executing "pwd" inspects the internal shell working directory state and prints "/home/learner".',
      verify: (vfs: VirtualFileSystem) => {
        const cwd = vfs.getCwd();
        if (cwd === '/home/learner') {
          return { passed: true, message: 'You are verified at /home/learner.' };
        }
        return { passed: false, message: `Your current directory is ${cwd}. Return to /home/learner using "cd /home/learner".` };
      },
    },
    quiz: [
      {
        id: 'q-pwd-1',
        question: 'What does the "pwd" command stand for?',
        options: [
          'Path With Directory',
          'Print Working Directory',
          'Password Directory',
          'Process Workflow Daemon',
        ],
        correctIndex: 1,
        explanation: '"pwd" stands for Print Working Directory, outputting the absolute path of your current folder.',
      },
      {
        id: 'q-pwd-2',
        question: 'Which character represents the absolute top-level directory in Linux?',
        options: ['~', '#', '/', 'C:\\'],
        correctIndex: 2,
        explanation: 'The single forward slash (/) represents the root directory in Unix-like operating systems.',
      },
    ],
  },

  {
    id: 'l1-ls',
    track: 'beginner',
    module: 'Navigation & Path Mastery',
    moduleId: 'mod-beg-1',
    title: '02. Listing Files and Metadata with ls',
    estimatedMinutes: 12,
    objectives: [
      'List files and subdirectories with ls.',
      'Reveal hidden configuration files using the -a flag.',
      'Read detailed permissions, owners, and byte sizes using the -l and -lh flags.',
    ],
    syntax: 'ls [OPTION]... [FILE/DIR]...',
    description:
      'The "ls" command lists information about files and directories. Files whose names start with a period (.) are hidden by default in Linux.',
    flags: [
      { flag: '-a, --all', purpose: 'Do not ignore entries starting with . (shows hidden files).' },
      { flag: '-l', purpose: 'Use long listing format showing file type, permissions, owner, group, size, and date.' },
      { flag: '-h, --human-readable', purpose: 'With -l, display human-friendly sizes like 4K, 25M.' },
      { flag: '-la', purpose: 'Combine -l and -a to see all files with complete metadata details.' },
    ],
    examples: [
      {
        command: 'ls',
        explanation: 'Lists visible files in current directory.',
        expectedOutput: 'documents  projects  welcome.txt',
      },
      {
        command: 'ls -la',
        explanation: 'Lists all files including hidden ones with full metadata.',
        expectedOutput: 'drwxr-xr-x 2 learner learner 4096 Oct 13 04:00 .\n-rw-r--r-- 1 learner learner  320 Oct 13 04:00 welcome.txt',
      },
    ],
    commonMistakes: [
      'Thinking a folder is empty when it actually contains hidden dotfiles.',
      'Forgetting that ls can accept a path argument, like "ls /var/log".',
    ],
    task: {
      id: 'task-l1-ls',
      problemStatement: 'Inspect the system logs directory.',
      instructions: [
        'List the files inside the "/var/log" directory using ls.',
      ],
      hints: [
        'Provide the target path to ls: "ls /var/log" or "ls -l /var/log".',
      ],
      solutionExplanation: 'Running "ls /var/log" inspects the contents of /var/log without needing to navigate into it.',
      verify: (vfs: VirtualFileSystem, lastCmd?: string) => {
        if (lastCmd && lastCmd.includes('ls') && lastCmd.includes('/var/log')) {
          return { passed: true, message: 'Excellent! You listed the contents of /var/log.' };
        }
        return { passed: false, message: 'Run "ls /var/log" to inspect the system log folder.' };
      },
    },
    quiz: [
      {
        id: 'q-ls-1',
        question: 'How do you designate a hidden file in Linux?',
        options: [
          'Set the file attribute to H in chmod',
          'Start the filename with a dot (e.g., .bashrc)',
          'Store it in the /tmp folder',
          'Enclose the filename in brackets',
        ],
        correctIndex: 1,
        explanation: 'Any file or folder whose name begins with a period (.) is hidden from standard view.',
      },
      {
        id: 'q-ls-2',
        question: 'What does the first character "d" mean in "-rw-r--r--" vs "drwxr-xr-x"?',
        options: [
          '"d" indicates a deleted file',
          '"d" indicates a directory, while "-" indicates a regular file',
          '"d" indicates a dynamic symbolic link',
          '"d" indicates device driver',
        ],
        correctIndex: 1,
        explanation: 'In the 10-character mode string, "d" denotes a directory and "-" denotes a standard file.',
      },
    ],
  },

  {
    id: 'l1-cd',
    track: 'beginner',
    module: 'Navigation & Path Mastery',
    moduleId: 'mod-beg-1',
    title: '03. Changing Directories with cd',
    estimatedMinutes: 10,
    objectives: [
      'Navigate between directories using cd.',
      'Use shortcut tokens: "." (current), ".." (parent), "~" (home), and "-" (previous).',
    ],
    syntax: 'cd [DIRECTORY]',
    description:
      'The "cd" (change directory) command alters the current working directory of your shell. Running "cd" with no arguments returns you to your home directory (~).',
    flags: [
      { flag: 'cd ~', purpose: 'Go to home directory (/home/learner).' },
      { flag: 'cd ..', purpose: 'Move one level up to the parent directory.' },
      { flag: 'cd -', purpose: 'Switch back to the previous working directory.' },
    ],
    examples: [
      {
        command: 'cd projects',
        explanation: 'Enters the projects directory located in the current folder.',
        expectedOutput: '(silent on success)',
      },
      {
        command: 'cd ..',
        explanation: 'Steps up to the parent folder.',
        expectedOutput: '(silent on success)',
      },
    ],
    commonMistakes: [
      'Typing "cd.." without a space between cd and .. (Linux commands require space separation).',
      'Forgetting that ~ represents /home/username.',
    ],
    task: {
      id: 'task-l1-cd',
      problemStatement: 'Navigate into your projects directory.',
      instructions: [
        'Change directory into the "projects" folder located in your home directory.',
      ],
      hints: [
        'Run "cd projects" or "cd /home/learner/projects".',
      ],
      solutionExplanation: 'Executing "cd projects" moves your shell context into /home/learner/projects.',
      verify: (vfs: VirtualFileSystem) => {
        if (vfs.getCwd() === '/home/learner/projects') {
          return { passed: true, message: 'Success! Your current working directory is /home/learner/projects.' };
        }
        return { passed: false, message: `Currently in ${vfs.getCwd()}. Run "cd /home/learner/projects".` };
      },
    },
    quiz: [
      {
        id: 'q-cd-1',
        question: 'Which command quickly returns you to your previous directory?',
        options: ['cd ~', 'cd ..', 'cd -', 'cd /'],
        correctIndex: 2,
        explanation: '"cd -" switches back to the previous directory using the $OLDPWD shell variable.',
      },
    ],
  },

  {
    id: 'l1-mkdir',
    track: 'beginner',
    module: 'File & Folder Operations',
    moduleId: 'mod-beg-2',
    title: '04. Creating Directories with mkdir',
    estimatedMinutes: 12,
    objectives: [
      'Create single and nested directory branches.',
      'Use the -p (parents) flag to build complex hierarchies without errors.',
    ],
    syntax: 'mkdir [OPTION]... DIRECTORY...',
    description:
      'The "mkdir" (make directory) command creates folders in the filesystem. Using the -p flag creates any missing intermediate parent folders automatically.',
    flags: [
      { flag: '-p, --parents', purpose: 'Create ancestor directories as needed, avoiding errors if directories already exist.' },
      { flag: '-v, --verbose', purpose: 'Print a message for each created directory.' },
    ],
    examples: [
      {
        command: 'mkdir workspace',
        explanation: 'Creates a folder named workspace.',
        expectedOutput: '(silent on success)',
      },
      {
        command: 'mkdir -p lab/day1/exercises',
        explanation: 'Creates the full folder branch in one go.',
        expectedOutput: '(silent on success)',
      },
    ],
    commonMistakes: [
      'Attempting to create "a/b/c" without -p when "a" and "b" do not exist yet.',
      'Using spaces in directory names without quotes: "mkdir my projects" creates two separate folders.',
    ],
    task: {
      id: 'task-l1-mkdir',
      problemStatement: 'Construct a project directory structure.',
      instructions: [
        'In your home directory (/home/learner), create a directory structure "app/src" in a single command using the parents flag.',
      ],
      hints: [
        'Use "mkdir -p app/src".',
      ],
      solutionExplanation: 'Using "mkdir -p app/src" creates both the parent "app" and the child "src" folder.',
      verify: (vfs: VirtualFileSystem) => {
        const node = vfs.getNode('/home/learner/app/src');
        if (node && node.type === 'dir') {
          return { passed: true, message: 'Directory /home/learner/app/src exists in the virtual filesystem.' };
        }
        return { passed: false, message: 'Directory "app/src" was not found in /home/learner.' };
      },
    },
    quiz: [
      {
        id: 'q-mkdir-1',
        question: 'What does "mkdir -p a/b/c" do if folder "a" does not exist?',
        options: [
          'Throws an error: "No such file or directory"',
          'Prompts for confirmation',
          'Creates folder "a", then "b", then "c"',
          'Creates only folder "c" in root',
        ],
        correctIndex: 2,
        explanation: 'The -p flag instructs mkdir to create all missing ancestor folders along the path.',
      },
    ],
  },

  {
    id: 'l1-touch-cat',
    track: 'beginner',
    module: 'File & Folder Operations',
    moduleId: 'mod-beg-2',
    title: '05. Creating & Reading Files with touch & cat',
    estimatedMinutes: 14,
    objectives: [
      'Create empty files with touch.',
      'Output file contents to the terminal using cat.',
      'Use cat -n to view line numbers.',
    ],
    syntax: 'touch FILE... | cat [OPTION]... [FILE]...',
    description:
      '"touch" creates empty files or updates their timestamp. "cat" (concatenate) displays file contents directly in your terminal.',
    flags: [
      { flag: 'cat -n', purpose: 'Number all output lines sequentially starting from 1.' },
      { flag: 'cat -b', purpose: 'Number non-empty output lines only.' },
    ],
    examples: [
      {
        command: 'touch notes.txt',
        explanation: 'Creates a new empty file.',
        expectedOutput: '(silent on success)',
      },
      {
        command: 'cat welcome.txt',
        explanation: 'Outputs the contents of welcome.txt.',
        expectedOutput: 'Welcome to LinuxLab — Interactive Linux Learning Environment!...',
      },
    ],
    commonMistakes: [
      'Using cat to read huge files (e.g. 50,000 lines) — use head, tail, or less for large files.',
    ],
    task: {
      id: 'task-l1-touch-cat',
      problemStatement: 'Create and populate a study log.',
      instructions: [
        'Create a file named "study.txt" in your home directory (/home/learner).',
        'Add the text "Linux Fundamentals 2026" into it using redirection: echo "Linux Fundamentals 2026" > study.txt',
      ],
      hints: [
        'Run `echo "Linux Fundamentals 2026" > study.txt`.',
      ],
      solutionExplanation: 'Using echo with ">" creates the file and writes the string.',
      verify: (vfs: VirtualFileSystem) => {
        const node = vfs.getNode('/home/learner/study.txt');
        if (!node || node.type !== 'file') {
          return { passed: false, message: 'study.txt was not found in /home/learner.' };
        }
        if (node.content && node.content.includes('Linux Fundamentals 2026')) {
          return { passed: true, message: 'study.txt created and verified with the correct text.' };
        }
        return { passed: false, message: 'study.txt exists, but does not contain "Linux Fundamentals 2026".' };
      },
    },
    quiz: [
      {
        id: 'q-touch-1',
        question: 'What happens when you run "touch file.txt" on an existing file?',
        options: [
          'The file content is cleared',
          'An error is raised',
          'Its modification timestamp is updated to the current time, preserving contents',
          'It renames the file',
        ],
        correctIndex: 2,
        explanation: 'touch does not alter contents of existing files; it simply refreshes the access/modification timestamps.',
      },
    ],
  },

  {
    id: 'l1-cp-mv-rm',
    track: 'beginner',
    module: 'File & Folder Operations',
    moduleId: 'mod-beg-2',
    title: '06. Copying, Moving, and Removing with cp, mv, rm',
    estimatedMinutes: 15,
    objectives: [
      'Copy files and directories with cp and cp -r.',
      'Move and rename files using mv.',
      'Safely delete files and directories using rm and rm -r.',
    ],
    syntax: 'cp [-r] SRC DEST | mv SRC DEST | rm [-r] TARGET...',
    description:
      '"cp" duplicates files or directories (with -r). "mv" relocates or renames files without duplicating. "rm" removes files permanently — Linux has no Trash or Recycle Bin by default!',
    flags: [
      { flag: 'cp -r', purpose: 'Recursive copy: copies directories and all their sub-contents.' },
      { flag: 'rm -r', purpose: 'Recursive delete: removes directories and their contents.' },
      { flag: 'rm -f', purpose: 'Force: ignores nonexistent files and never prompts for confirmation.' },
    ],
    examples: [
      {
        command: 'cp welcome.txt welcome_backup.txt',
        explanation: 'Creates a duplicate copy named welcome_backup.txt.',
        expectedOutput: '(silent on success)',
      },
      {
        command: 'mv welcome_backup.txt backup.txt',
        explanation: 'Renames welcome_backup.txt to backup.txt.',
        expectedOutput: '(silent on success)',
      },
    ],
    commonMistakes: [
      'Running "rm -rf /" or removing files by mistake — Linux does not prompt for undo!',
      'Forgetting -r when copying or deleting directories.',
    ],
    task: {
      id: 'task-l1-cp-mv',
      problemStatement: 'Duplicate and rename a document.',
      instructions: [
        'Copy "welcome.txt" to a new file named "readme.txt" in your home directory.',
      ],
      hints: [
        'Run `cp welcome.txt readme.txt`.',
      ],
      solutionExplanation: 'Running "cp welcome.txt readme.txt" duplicates the content into readme.txt.',
      verify: (vfs: VirtualFileSystem) => {
        const original = vfs.getNode('/home/learner/welcome.txt');
        const copied = vfs.getNode('/home/learner/readme.txt');
        if (copied && copied.type === 'file' && copied.content === original?.content) {
          return { passed: true, message: 'readme.txt created as a verified duplicate of welcome.txt.' };
        }
        return { passed: false, message: 'readme.txt was not found or differs from welcome.txt.' };
      },
    },
    quiz: [
      {
        id: 'q-cp-1',
        question: 'Which flag is mandatory when copying a directory using cp?',
        options: ['-f', '-r', '-a', '-d'],
        correctIndex: 1,
        explanation: '-r (or -R) stands for recursive, copying all nested subdirectories and files.',
      },
    ],
  },

  {
    id: 'l1-permissions',
    track: 'beginner',
    module: 'File Permissions & System Info',
    moduleId: 'mod-beg-3',
    title: '07. Linux File Permissions with chmod',
    estimatedMinutes: 15,
    objectives: [
      'Interpret file permission triplets: User (Owner), Group, and Others.',
      'Understand read (r=4), write (w=2), and execute (x=1) permissions.',
      'Apply permissions using symbolic (+x, -w) and octal (755, 644) modes.',
    ],
    syntax: 'chmod [MODE] FILE...',
    description:
      'Linux controls access via permission triplets: Owner, Group, Others. Each tier can have Read (4), Write (2), and Execute (1) permissions. 755 translates to rwxr-xr-x (Owner can read/write/execute; others can read/execute).',
    flags: [
      { flag: 'chmod +x script.sh', purpose: 'Add executable permission for all users.' },
      { flag: 'chmod 755 file', purpose: 'rwxr-xr-x: owner full access, group & others read/execute.' },
      { flag: 'chmod 644 file', purpose: 'rw-r--r--: owner read/write, group & others read only.' },
    ],
    examples: [
      {
        command: 'chmod +x test.sh',
        explanation: 'Enables execution on test.sh.',
        expectedOutput: '(silent on success)',
      },
    ],
    commonMistakes: [
      'Granting 777 (rwxrwxrwx) to sensitive files — this allows anyone to modify or delete them.',
    ],
    task: {
      id: 'task-l1-chmod',
      problemStatement: 'Make a script executable.',
      instructions: [
        'Create a file named "run.sh" in your home directory, then make it executable using `chmod +x run.sh`.',
      ],
      hints: [
        'Run `touch run.sh` then `chmod +x run.sh`.',
      ],
      solutionExplanation: 'Using chmod +x sets the executable bit in the permission mode string.',
      verify: (vfs: VirtualFileSystem) => {
        const file = vfs.getNode('/home/learner/run.sh');
        if (!file) return { passed: false, message: 'run.sh was not found.' };
        if (file.permissions.includes('x')) {
          return { passed: true, message: 'run.sh has executable permissions set!' };
        }
        return { passed: false, message: `run.sh exists with permissions "${file.permissions}", missing executable bit (+x).` };
      },
    },
    quiz: [
      {
        id: 'q-chmod-1',
        question: 'What does octal permission 755 translate to in symbolic notation?',
        options: ['rwxrwxrwx', 'rwxr-xr-x', 'rw-r--r--', 'r-xr-xr-x'],
        correctIndex: 1,
        explanation: '7 = 4+2+1 (rwx), 5 = 4+0+1 (r-x), 5 = 4+0+1 (r-x) => rwxr-xr-x.',
      },
    ],
  },

  {
    id: 'l1-sysinfo',
    track: 'beginner',
    module: 'File Permissions & System Info',
    moduleId: 'mod-beg-3',
    title: '08. System Information: whoami, uname, date',
    estimatedMinutes: 10,
    objectives: [
      'Inspect the active user with whoami.',
      'Check kernel version and architecture with uname -a.',
      'View system date and time with date.',
    ],
    syntax: 'whoami | uname [-a] | date',
    description:
      'System utility commands provide quick insight into the host environment, current user session, kernel build, and time.',
    flags: [
      { flag: 'uname -a', purpose: 'Print all available system and kernel information.' },
      { flag: 'uname -r', purpose: 'Print kernel release version.' },
    ],
    examples: [
      {
        command: 'whoami',
        explanation: 'Prints active username.',
        expectedOutput: 'learner',
      },
      {
        command: 'uname -a',
        explanation: 'Prints full OS and kernel signature.',
        expectedOutput: 'Linux linuxlab-box 6.8.0-45-generic #45-Ubuntu SMP...',
      },
    ],
    commonMistakes: [
      'Assuming whoami outputs your real name rather than your Unix username.',
    ],
    task: {
      id: 'task-l1-sysinfo',
      problemStatement: 'Store your system kernel signature in a log file.',
      instructions: [
        'Save the output of `uname -a` into a file named "kernel_info.txt" in your home directory using redirection.',
      ],
      hints: [
        'Run `uname -a > kernel_info.txt`.',
      ],
      solutionExplanation: 'The ">" operator captures stdout from uname -a into kernel_info.txt.',
      verify: (vfs: VirtualFileSystem) => {
        const file = vfs.getNode('/home/learner/kernel_info.txt');
        if (file && file.type === 'file' && file.content?.includes('Linux')) {
          return { passed: true, message: 'kernel_info.txt contains verified kernel information.' };
        }
        return { passed: false, message: 'kernel_info.txt is missing or does not contain kernel output.' };
      },
    },
    quiz: [
      {
        id: 'q-sys-1',
        question: 'Which command prints the Linux kernel release number?',
        options: ['whoami', 'uname -r', 'date', 'pwd'],
        correctIndex: 1,
        explanation: 'uname -r outputs the specific kernel release version string.',
      },
    ],
  },

  // --- LEVEL 2: INTERMEDIATE ---
  {
    id: 'l2-redirection',
    track: 'intermediate',
    module: 'Pipes, Redirection & Streams',
    moduleId: 'mod-int-1',
    title: '09. Standard Streams & Redirection (> and >>)',
    estimatedMinutes: 15,
    objectives: [
      'Differentiate standard output (stdout), standard error (stderr), and standard input (stdin).',
      'Redirect and overwrite file content with >.',
      'Append data to existing files without destroying content using >>.',
    ],
    syntax: 'command > file (overwrite) | command >> file (append)',
    description:
      'Unix treats input and output as byte streams. Redirection with ">" writes to a file, replacing its contents. Redirection with ">>" appends to the end of the file.',
    flags: [
      { flag: '>', purpose: 'Redirect stdout to file (overwrites existing file).' },
      { flag: '>>', purpose: 'Redirect stdout to file (appends to end of file).' },
      { flag: '2>', purpose: 'Redirect stderr only (errors).' },
    ],
    examples: [
      {
        command: 'echo "First line" > log.txt',
        explanation: 'Writes "First line" to log.txt.',
        expectedOutput: '(silent on success)',
      },
      {
        command: 'echo "Second line" >> log.txt',
        explanation: 'Appends "Second line" to log.txt without erasing "First line".',
        expectedOutput: '(silent on success)',
      },
    ],
    commonMistakes: [
      'Using ">" when you meant ">>", accidentally wiping an entire file!',
    ],
    task: {
      id: 'task-l2-redirection',
      problemStatement: 'Append daily activity logs.',
      instructions: [
        'Write "Entry 1" to a file named "journal.txt".',
        'Then append "Entry 2" to the same "journal.txt" using the append operator >>.',
      ],
      hints: [
        'Run `echo "Entry 1" > journal.txt` followed by `echo "Entry 2" >> journal.txt`.',
      ],
      solutionExplanation: 'Using > for Entry 1 creates the file, and >> for Entry 2 appends the second line.',
      verify: (vfs: VirtualFileSystem) => {
        const file = vfs.getNode('/home/learner/journal.txt');
        if (!file) return { passed: false, message: 'journal.txt was not found.' };
        const content = file.content || '';
        if (content.includes('Entry 1') && content.includes('Entry 2')) {
          return { passed: true, message: 'journal.txt has both entries appended successfully!' };
        }
        return { passed: false, message: 'journal.txt must contain both "Entry 1" and "Entry 2".' };
      },
    },
    quiz: [
      {
        id: 'q-redir-1',
        question: 'What is the key difference between > and >>?',
        options: [
          '> executes with sudo, >> does not',
          '> overwrites existing file content; >> appends to the end of the file',
          '> handles binary files, >> handles text files',
          '> redirects stdin, >> redirects stdout',
        ],
        correctIndex: 1,
        explanation: '> overwrites the target file, while >> preserves existing lines and adds new lines at the end.',
      },
    ],
  },

  {
    id: 'l2-pipes-grep',
    track: 'intermediate',
    module: 'Pipes, Redirection & Streams',
    moduleId: 'mod-int-1',
    title: '10. Chaining Commands with Pipes (|) and grep',
    estimatedMinutes: 18,
    objectives: [
      'Harness the pipe operator (|) to pass output of one command as input to another.',
      'Filter output lines matching text patterns with grep.',
      'Count filtered lines using wc -l.',
    ],
    syntax: 'command1 | grep [OPTIONS] PATTERN | wc -l',
    description:
      'The Unix philosophy is built around combining small, composable tools. A pipe (|) connects the stdout stream of the left program to the stdin stream of the right program.',
    flags: [
      { flag: 'grep -i', purpose: 'Case-insensitive search.' },
      { flag: 'grep -v', purpose: 'Invert match (select non-matching lines).' },
      { flag: 'grep -n', purpose: 'Print matching line numbers.' },
      { flag: 'wc -l', purpose: 'Count lines in input stream.' },
    ],
    examples: [
      {
        command: 'cat /var/log/syslog | grep "systemd"',
        explanation: 'Streams syslog lines and filters only lines containing "systemd".',
        expectedOutput: 'Oct 13 04:00:01 linuxlab systemd[1]: Started Daily System Check...',
      },
      {
        command: 'cat /var/log/syslog | grep "systemd" | wc -l',
        explanation: 'Counts occurrences of systemd log lines.',
        expectedOutput: '2',
      },
    ],
    commonMistakes: [
      'Putting a filename after grep when already piping from cat.',
      'Confusing the pipe | with logical OR ||.',
    ],
    task: {
      id: 'task-l2-pipes',
      problemStatement: 'Filter user records from projects data.',
      instructions: [
        'Inspect "projects/data.csv", filter lines containing "Developer", and count them with wc -l.',
        'Redirect this count to a file named "developer_count.txt" in your home directory.',
      ],
      hints: [
        'Run `cat projects/data.csv | grep "Developer" | wc -l > developer_count.txt`.',
      ],
      solutionExplanation: 'Piping data.csv into grep "Developer" filters matching lines, wc -l counts them, and > writes the result.',
      verify: (vfs: VirtualFileSystem) => {
        const file = vfs.getNode('/home/learner/developer_count.txt');
        if (!file) return { passed: false, message: 'developer_count.txt was not found.' };
        if (file.content?.trim() === '1') {
          return { passed: true, message: 'developer_count.txt correctly contains "1".' };
        }
        return { passed: false, message: `Expected "1", but found "${file.content?.trim()}".` };
      },
    },
    quiz: [
      {
        id: 'q-pipe-1',
        question: 'What does the pipe operator (|) do?',
        options: [
          'Executes two commands concurrently in the background',
          'Connects stdout of the command on the left to stdin of the command on the right',
          'Saves command output to a temporary RAM cache',
          'Validates command syntax before execution',
        ],
        correctIndex: 1,
        explanation: 'The pipe operator streams stdout directly into stdin of the next process.',
      },
    ],
  },

  {
    id: 'l2-text-tools',
    track: 'intermediate',
    module: 'Text Transformation & Filters',
    moduleId: 'mod-int-2',
    title: '11. Text Filtering with sort, uniq, and cut',
    estimatedMinutes: 18,
    objectives: [
      'Sort lines alphabetically or numerically with sort.',
      'Remove adjacent duplicate lines using uniq.',
      'Extract specific columns from delimited files using cut.',
    ],
    syntax: 'sort [-r] | uniq [-c] | cut -d DELIM -f FIELD',
    description:
      'Command-line text processing allows rapid data wrangling. "sort" orders lines, "uniq" filters duplicates (requires sorted input), and "cut" extracts specific columns from CSVs or tab-separated text.',
    flags: [
      { flag: 'sort -r', purpose: 'Reverse sorting order (descending).' },
      { flag: 'sort -n', purpose: 'Sort numerically instead of alphabetically.' },
      { flag: 'cut -d "," -f 2', purpose: 'Extract second column of a comma-delimited file.' },
    ],
    examples: [
      {
        command: 'cut -d "," -f 2 projects/data.csv',
        explanation: 'Extracts the "name" column from data.csv.',
        expectedOutput: 'name\nAlice\nBob\nCharlie\nDiana\nEvan',
      },
    ],
    commonMistakes: [
      'Running "uniq" on unsorted data — uniq only collapses adjacent identical lines.',
    ],
    task: {
      id: 'task-l2-text-tools',
      problemStatement: 'Extract and sort department names.',
      instructions: [
        'Extract the department column (field 4) from "projects/data.csv" using `cut -d "," -f 4 projects/data.csv`.',
        'Pipe the result to `sort` and save to "departments.txt".',
      ],
      hints: [
        'Run `cut -d "," -f 4 projects/data.csv | sort > departments.txt`.',
      ],
      solutionExplanation: 'cut extracts column 4, sort alphabetizes it, and > writes the output.',
      verify: (vfs: VirtualFileSystem) => {
        const file = vfs.getNode('/home/learner/departments.txt');
        if (!file) return { passed: false, message: 'departments.txt was not found.' };
        if (file.content?.includes('Infrastructure') && file.content?.includes('Frontend')) {
          return { passed: true, message: 'departments.txt verified with extracted and sorted fields.' };
        }
        return { passed: false, message: 'departments.txt content does not match expected output.' };
      },
    },
    quiz: [
      {
        id: 'q-cut-1',
        question: 'Why is it usually necessary to pipe data through "sort" before "uniq"?',
        options: [
          '"uniq" requires sorted input to identify adjacent duplicate lines',
          '"uniq" will error out on unsorted files',
          '"sort" strips whitespace from lines',
          'It is not necessary; uniq searches the whole file',
        ],
        correctIndex: 0,
        explanation: 'uniq compares each line only to its immediate predecessor, so input must be sorted first to catch all duplicates.',
      },
    ],
  },

  {
    id: 'l2-processes-env',
    track: 'intermediate',
    module: 'Text Transformation & Filters',
    moduleId: 'mod-int-2',
    title: '12. Processes & Environment Variables ($PATH, export)',
    estimatedMinutes: 16,
    objectives: [
      'Inspect running processes with ps and top.',
      'View environment variables using env.',
      'Define and export custom shell environment variables using export.',
    ],
    syntax: 'ps aux | top | export VAR=value | echo $VAR',
    description:
      'Linux processes inherit environment variables from their parent shell. The "export" command promotes shell variables to the environment, making them accessible to child processes and scripts.',
    flags: [
      { flag: 'export NAME=VAL', purpose: 'Set an environment variable available to child processes.' },
      { flag: 'echo $PATH', purpose: 'Display colon-separated directories where executables are found.' },
      { flag: 'ps', purpose: 'Show active processes in the current shell session.' },
    ],
    examples: [
      {
        command: 'export APP_ENV=production',
        explanation: 'Exports APP_ENV to the shell environment.',
        expectedOutput: '(silent on success)',
      },
      {
        command: 'echo $APP_ENV',
        explanation: 'Prints variable value.',
        expectedOutput: 'production',
      },
    ],
    commonMistakes: [
      'Putting spaces around the equals sign: "export A = 1" (bash expects "export A=1").',
      'Forgetting the "$" symbol when referencing variables.',
    ],
    task: {
      id: 'task-l2-env',
      problemStatement: 'Export a custom configuration variable.',
      instructions: [
        'Set and export an environment variable named "STAGE" with the value "development": `export STAGE=development`.',
      ],
      hints: [
        'Run `export STAGE=development` (no spaces around =).',
      ],
      solutionExplanation: 'Running export STAGE=development stores STAGE into the shell environment.',
      verify: (vfs: VirtualFileSystem, lastCmd?: string) => {
        if (lastCmd && lastCmd.includes('export') && lastCmd.includes('STAGE=development')) {
          return { passed: true, message: 'Variable STAGE exported to environment.' };
        }
        return { passed: false, message: 'Run "export STAGE=development".' };
      },
    },
    quiz: [
      {
        id: 'q-env-1',
        question: 'What is the purpose of the $PATH environment variable?',
        options: [
          'It stores the current user\'s home directory',
          'It lists directories searched when you type a command name',
          'It holds the absolute path to the kernel image',
          'It defines file download locations',
        ],
        correctIndex: 1,
        explanation: '$PATH contains colon-separated directories that the shell searches to find executable binaries.',
      },
    ],
  },

  // --- LEVEL 3: ADVANCED ---
  {
    id: 'l3-scripting',
    track: 'advanced',
    module: 'Shell Scripting & Automation',
    moduleId: 'mod-adv-1',
    title: '13. Shell Scripting, Shebang & Exit Codes',
    estimatedMinutes: 22,
    objectives: [
      'Write executable shell scripts with the shebang line (#!/bin/bash).',
      'Understand exit codes: 0 for success, non-zero for errors.',
      'Grant execution permissions and run scripts using ./script.sh.',
    ],
    syntax: '#!/bin/bash\nchmod +x script.sh && ./script.sh',
    description:
      'Shell scripts bundle complex command flows into reusable files. The Shebang ("#!/bin/bash") at line 1 informs the operating system which interpreter should parse the file. When executed, commands return an exit code ($?), where 0 indicates clean success.',
    flags: [
      { flag: '#!/bin/bash', purpose: 'Shebang line declaring the Bash shell interpreter.' },
      { flag: 'exit 0', purpose: 'Terminates script with a successful exit code.' },
      { flag: 'exit 1', purpose: 'Terminates script signaling a general error.' },
    ],
    examples: [
      {
        command: 'echo "#!/bin/bash\necho Build Ready" > build.sh && chmod +x build.sh && ./build.sh',
        explanation: 'Creates, marks executable, and runs build.sh.',
        expectedOutput: 'Build Ready',
      },
    ],
    commonMistakes: [
      'Omitting the leading "./": typing "script.sh" will fail because current directory (.) is not in $PATH for security reasons.',
      'Forgetting to chmod +x before executing.',
    ],
    task: {
      id: 'task-l3-script',
      problemStatement: 'Author an automated deployment script.',
      instructions: [
        'Create a file named "deploy.sh" in your home directory.',
        'Write the following contents into it:\necho "Deploying LinuxLab Service"\necho "All checks passed"',
        'Make the script executable with `chmod +x deploy.sh` and run it with `./deploy.sh`.',
      ],
      hints: [
        'Run `echo "echo Deploying LinuxLab Service" > deploy.sh`, then `echo "echo All checks passed" >> deploy.sh`, then `chmod +x deploy.sh`.',
      ],
      solutionExplanation: 'Creates deploy.sh, sets executable bit, and verifies output.',
      verify: (vfs: VirtualFileSystem) => {
        const file = vfs.getNode('/home/learner/deploy.sh');
        if (!file) return { passed: false, message: 'deploy.sh was not found.' };
        if (!file.permissions.includes('x')) {
          return { passed: false, message: 'deploy.sh exists but is missing executable permission (run chmod +x deploy.sh).' };
        }
        if (file.content?.includes('Deploying LinuxLab Service')) {
          return { passed: true, message: 'deploy.sh authored and marked executable!' };
        }
        return { passed: false, message: 'deploy.sh must contain the echo deployment messages.' };
      },
    },
    quiz: [
      {
        id: 'q-script-1',
        question: 'What is the role of the first line "#!/bin/bash" (Shebang) in a script?',
        options: [
          'It is an optional comment for human readers',
          'It tells the operating system kernel which program to use as the script interpreter',
          'It gives the script root privileges',
          'It enables debug tracing',
        ],
        correctIndex: 1,
        explanation: 'The shebang tells the kernel loader to execute /bin/bash to interpret the commands inside the script.',
      },
    ],
  },

  {
    id: 'l3-cron-services',
    track: 'advanced',
    module: 'Shell Scripting & Automation',
    moduleId: 'mod-adv-1',
    title: '14. Scheduled Tasks with Cron & Systemd Concepts',
    estimatedMinutes: 20,
    objectives: [
      'Decipher cron schedule syntax (minute, hour, day-of-month, month, day-of-week).',
      'Understand crontab management.',
      'Learn systemd service management paradigms (systemctl status, restart).',
    ],
    syntax: '* * * * * command (m h dom mon dow)',
    description:
      'Cron is the time-based job scheduler in Unix-like operating systems. Crontab entries follow a 5-field time format followed by the command to execute: "* * * * *" denotes every minute of every hour of every day.',
    flags: [
      { flag: 'crontab -l', purpose: 'List current user\'s scheduled cron jobs.' },
      { flag: 'crontab -e', purpose: 'Edit the user crontab file.' },
      { flag: '0 2 * * *', purpose: 'Run every day at 02:00 AM.' },
    ],
    examples: [
      {
        command: 'echo "0 3 * * * /home/learner/backup.sh" > mycron',
        explanation: 'Defines a cron job scheduled daily at 3:00 AM.',
        expectedOutput: '(silent on success)',
      },
    ],
    commonMistakes: [
      'Assuming cron jobs run with full shell environment paths — always use absolute paths in crontab commands.',
    ],
    task: {
      id: 'task-l3-cron',
      problemStatement: 'Schedule a daily midnight maintenance job.',
      instructions: [
        'Create a file named "crontab.txt" in your home directory.',
        'Add a cron entry that runs every midnight at 00:00: `0 0 * * * /home/learner/deploy.sh`.',
      ],
      hints: [
        'Run `echo "0 0 * * * /home/learner/deploy.sh" > crontab.txt`.',
      ],
      solutionExplanation: 'The 5 fields "0 0 * * *" correspond to minute 0, hour 0, every day, month, and day-of-week.',
      verify: (vfs: VirtualFileSystem) => {
        const file = vfs.getNode('/home/learner/crontab.txt');
        if (!file) return { passed: false, message: 'crontab.txt was not found.' };
        if (file.content?.includes('0 0 * * *')) {
          return { passed: true, message: 'crontab.txt contains a valid midnight schedule!' };
        }
        return { passed: false, message: 'crontab.txt must contain "0 0 * * * /home/learner/deploy.sh".' };
      },
    },
    quiz: [
      {
        id: 'q-cron-1',
        question: 'In the cron expression "30 4 * * 1", when does the job execute?',
        options: [
          'Every 30 minutes for 4 hours on January 1st',
          'At 04:30 AM every Monday',
          'On the 4th of every month at 30 minutes past midnight',
          'Every 4 days in May',
        ],
        correctIndex: 1,
        explanation: 'Minute=30, Hour=4 (04:30), Day-of-week=1 (Monday). The job runs every Monday at 04:30 AM.',
      },
    ],
  },
];
