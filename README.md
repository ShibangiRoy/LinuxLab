# 🐧 LinuxLab — Interactive Linux Learning Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

**LinuxLab** is a full-featured, browser-based Linux learning platform engineered to guide students, aspiring DevOps engineers, and developers from foundational command-line navigation to advanced shell scripting and system administration.

Through a combination of structured level-based lessons, an in-memory virtual filesystem (VFS), an interactive safe command simulator, automated task verification, and assessments, LinuxLab makes learning Linux active, safe, and engaging.

```
                  THE LINUXLAB LEARNING CYCLE
                  
  ┌───────────┐      ┌────────────┐      ┌──────────────┐
  │   Learn   │ ───► │ Understand │ ───► │   Practice   │
  └───────────┘      └────────────┘      └──────────────┘
                                                 │
                                                 ▼
  ┌───────────┐      ┌────────────┐      ┌──────────────┐
  │   Apply   │ ◄─── │ Track Prog │ ◄─── │ Complete Task│
  └───────────┘      └────────────┘      └──────────────┘
```

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Pipelines](#-architecture--pipelines)
  - [1. Command Execution Pipeline](#1-command-execution-pipeline)
  - [2. Task Verification Pipeline](#2-task-verification-pipeline)
  - [3. Application Build & Static Delivery Pipeline](#3-application-build--static-delivery-pipeline)
- [Project Structure](#-project-structure)
- [Installation & Dependencies](#-installation--dependencies)
  - [Prerequisites](#prerequisites)
  - [Installation Steps](#installation-steps)
  - [Dependencies Breakdown](#dependencies-breakdown)
- [Virtual Filesystem (VFS) Specification](#-virtual-filesystem-vfs-specification)
- [Supported Linux Commands](#-supported-linux-commands)
- [Curriculum Breakdown](#-curriculum-breakdown)
- [How to Use the Application](#-how-to-use-the-application)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Deployment Guide](#-deployment-guide)
- [Contributing & Code Quality](#-contributing--code-quality)
- [License](#-license)

---

## 🌟 Key Features

- **Safe Simulated Terminal**: Execute Linux commands inside an in-memory client-side sandbox. No host system commands or dangerous root access required.
- **In-Memory Virtual Filesystem (VFS)**: Persistent hierarchy containing `/home/learner`, `/etc`, `/var/log`, `/bin`, and `/tmp` with real inode permissions (`rwxr-xr-x`), file sizes, and timestamps.
- **Live VFS Tree Explorer**: Toggleable visual tree drawer beside the terminal displaying directories and files updating in real-time as you execute `mkdir`, `touch`, `cp`, `mv`, or `rm`.
- **Realistic Shell Capabilities**: Tab key auto-completion, command history with $\uparrow$ / $\downarrow$ arrow keys, clipboard export, standard streams redirection (`>`, `>>`), and pipelines (`|`).
- **Split-Screen Workspace**: 50/50 responsive desktop layout pairing the terminal with interactive lesson guides, code examples, common pitfalls, and practical challenges.
- **Real State Verification**: Practical tasks inspect the virtual environment state (e.g. verifying folder creation or file contents) rather than matching raw user command strings.
- **Quizzes & Assessments**: Conceptual and output-prediction questions after every lesson with explanations for both correct and incorrect choices.
- **Free-Play Sandbox**: Open terminal playground with one-click presets to generate web project folders, simulate log parsing, and run automation scripts.
- **Searchable Command Library**: 20+ documented Linux utilities filterable by category and safety status with direct cross-links to lessons.
- **Clean Authentication & State Management**: Register and sign in with email and password, customize learning pace, track streaks, and cleanly sign out anytime without mock data.
- **Dual Visual Modes**: Ultra-high contrast **Dark Mode** (`#0B0F0E`) and **Bright Mode** (`#F8FAFC` canvas with `#000000` pure black text conforming to WCAG AA contrast standards).

---

## 🏗️ Architecture & Pipelines

### 1. Command Execution Pipeline

When a user types a command and presses `Enter`, input flows through a modular, safe execution pipeline:

```
[Raw User Input] (e.g. "cat /var/log/syslog | grep Oct | wc -l > results.txt")
        │
        ▼
┌──────────────────────────────────────────────┐
│ 1. History Appender & Trimmer                │ -> Records input into history buffer
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│ 2. Pipeline & Redirection Parser             │ -> Detects '|', '>', '>>'
└──────────────────────────────────────────────┘
        │
        ├─────────────────────────────────────────────────┐
        ▼ (Sequential Stages)                             ▼ (Target File)
┌────────────────────────────────────────┐       ┌────────────────────────┐
│ 3. Variable Expander                   │       │ Output Stream Handler  │
│    Replaces $USER, $HOME, $PATH, $PWD  │       │ Writes stdout into VFS │
└────────────────────────────────────────┘       └────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│ 4. Lexical Tokenizer                   │
│    Parses flags, quotes, and arguments │
└────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│ 5. Command Dispatcher                  │
│    Routes to handler (ls, grep, etc.)  │
└────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│ 6. VFS State Mutator / Reader          │
│    Resolves inodes, reads/writes nodes │
└────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│ 7. CommandResult Producer              │
│    Yields { stdout, stderr, exitCode } │
└────────────────────────────────────────┘
        │
        ▼
[Terminal Emulator Output & Live VFS Tree Update]
```

### 2. Task Verification Pipeline

Unlike trivial learning tools that perform naive regex checks on what the user typed, LinuxLab verifies the **resulting filesystem state**:

```
[User Executes Commands in Terminal]
        │
        ▼ (Virtual Filesystem Mutates)
[User Clicks "Check Answer"]
        │
        ▼
┌────────────────────────────────────────────────────────┐
│ 1. Invokes Lesson Task Validator: task.verify(vfs)     │
└────────────────────────────────────────────────────────┘
        │
        ├── Reads target node via vfs.getNode(path)
        ├── Validates inode type ('file' vs 'dir')
        ├── Asserts file contents or permissions (e.g. chmod +x)
        │
        ▼
┌────────────────────────────────────────────────────────┐
│ 2. Outcome Evaluator                                   │
└────────────────────────────────────────────────────────┘
        ├── [PASSED] ──► Confetti Trigger ──► Mark Progress ──► Unlock Next Lesson
        │
        └── [FAILED] ──► Diagnostic Guidance ──► Hint Disclosure ──► Retry
```

### 3. Application Build & Static Delivery Pipeline

```
[TypeScript Source Files (TSX / TS)]
        │
        ▼
[TypeScript Static Type Checking (tsc --noEmit)]
        │
        ▼
[Vite Bundler + Tailwind CSS v4 Engine]
        │
        ▼
[Optimized Production Assets in dist/]
        ├── index.html
        ├── assets/index-[hash].js
        └── assets/index-[hash].css
```

---

## 📁 Project Structure

```
linuxlab/
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignored files & node_modules
├── index.html                      # HTML entry point with Google Fonts (Plus Jakarta Sans & JetBrains Mono)
├── metadata.json                   # AI Studio applet metadata & capabilities
├── package.json                    # Dependencies, scripts, and package metadata
├── tsconfig.json                   # TypeScript compiler configuration (bundler resolution, ES2022)
├── vite.config.ts                  # Vite configuration with Tailwind CSS v4 & React plugins
├── README.md                       # Comprehensive GitHub documentation (this file)
└── src/
    ├── main.tsx                    # React DOM root entry point
    ├── index.css                   # Global Tailwind CSS imports & custom typography rules
    ├── App.tsx                     # Top-level Router, theme state, and AuthModal mounting
    │
    ├── types/
    │   └── index.ts                # TypeScript interfaces (UserProfile, Lesson, VNode, CommandDoc, etc.)
    │
    ├── services/
    │   ├── storage.ts              # LocalStorage persistent persistence service (auth, progress, notes, streak)
    │   └── terminal/
    │       ├── virtualFs.ts        # Virtual Filesystem engine (inodes, permissions, path resolver, tree generator)
    │       └── commandExecutor.ts  # Safe command parser, pipeline handler, redirection & dispatch engine
    │
    ├── data/
    │   ├── curriculum.ts           # 14 comprehensive lessons across 3 levels with practical tasks & quizzes
    │   └── commandLibrary.ts       # 20+ documented Linux commands with syntax, flags, and safety levels
    │
    ├── components/
    │   ├── Navbar.tsx              # Top bar adhering to Top Bar Contract (Wordmark, Nav links, Auth/Profile)
    │   ├── Terminal.tsx            # High-performance terminal emulator with Tab completion & history
    │   ├── FilesystemVisualizer.tsx# Live collapsible directory tree explorer for VFS inspection
    │   └── AuthModal.tsx           # Real email/password Login, Registration, and Password Reset modal
    │
    └── views/
        ├── DashboardView.tsx       # Personalized dashboard (metrics, tracks, streaks, recommendations)
        ├── WorkspaceView.tsx       # 50/50 split-screen learning workspace (Terminal + Concept Deck + Task Checker + Quiz)
        ├── TracksView.tsx          # 3-tier curriculum explorer (Beginner, Intermediate, Advanced modules)
        ├── CommandLibraryView.tsx  # Searchable, filterable Linux command reference with live try buttons
        ├── SandboxView.tsx         # Free-play terminal sandbox with presets & live VFS visualizer
        └── ProfileView.tsx         # User preferences, track selection, bookmarks, and sign-out controls
```

---

## 📦 Installation & Dependencies

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (Node 20+ LTS recommended)
- **Package Manager**: `npm` (bundled with Node), `bun`, `pnpm`, or `yarn`

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/linuxlab.git
   cd linuxlab
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Set up local environment configuration**:
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to start using the platform.

### Dependencies Breakdown

#### Production Dependencies (`dependencies`)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` | `^19.0.1` | Core declarative UI library |
| `react-dom` | `^19.0.1` | React DOM renderer |
| `react-router-dom` | `^7.x` | Client-side routing with `HashRouter` |
| `lucide-react` | `^0.546.0` | Clean, modern developer and terminal interface icons |
| `canvas-confetti` | `^1.9.4` | Particle celebration effects on task completion |
| `motion` | `^12.23.24` | Smooth transitions and state animations |
| `@tailwindcss/vite` | `^4.3.3` | Tailwind CSS v4 compiler plugin for Vite |
| `vite` | `^8.3.0` | Next-generation frontend build tool and dev server |
| `express` | `^4.21.2` | Lightweight server entry point for container/full-stack hosting |
| `dotenv` | `^17.2.3` | Environment variable management |
| `@google/genai` | `^2.4.0` | Google Gen AI SDK integration for server capabilities |

#### Development Dependencies (`devDependencies`)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `typescript` | `^7.0.2` | Static type checking and compiler |
| `@types/react` | `^19.3.0` | TypeScript definitions for React |
| `@types/react-dom` | `^19.3.0` | TypeScript definitions for React DOM |
| `@types/canvas-confetti` | `^1.9.0` | TypeScript definitions for Canvas Confetti |
| `@types/node` | `^22.14.0` | Node.js type definitions |
| `tailwindcss` | `^4.3.3` | Utility-first CSS framework |
| `tsx` | `^4.21.0` | TypeScript execute engine for Node scripts |

---

## 🗄️ Virtual Filesystem (VFS) Specification

The Virtual Filesystem represents an in-memory Unix directory tree. Each node is typed as an inode:

```typescript
export interface VNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;         // Plaintext payload for files
  permissions: string;      // Standard mode bits, e.g. "rwxr-xr-x"
  owner: string;            // Default: "learner" or "root"
  group: string;            // Default: "learner" or "root"
  modified: string;         // ISO timestamp
  children?: Record<string, VNode>; // Directory children map
}
```

### Initial File Hierarchy

```
/
├── bin/
│   ├── bash                (Shell binary simulation)
│   └── ls                  (Directory listing utility)
├── etc/
│   ├── os-release          (OS signature: LinuxLab OS 2026.1 LTS)
│   ├── hostname            ("linuxlab-box")
│   └── shells              (List of supported login shells)
├── home/
│   └── learner/            (Default active shell user directory: ~)
│       ├── welcome.txt     (Introductory tips and quick commands)
│       ├── documents/
│       │   └── cheatsheet.md
│       └── projects/
│           ├── todo.txt
│           └── data.csv    (5-row CSV dataset for grep, cut, sort practice)
├── var/
│   └── log/
│       ├── syslog          (Sample system boot and authentication log entries)
│       └── auth.log        (Sample SSH authentication records)
└── tmp/
    └── session.lock        (Temporary lock file)
```

---

## 💻 Supported Linux Commands

| Command | Supported Flags | Behavior & Capabilities |
| :--- | :--- | :--- |
| `pwd` | `-L`, `-P` | Prints the absolute path of the current working directory. |
| `ls` | `-a`, `-l`, `-h`, `-la` | Lists directory contents, hidden dotfiles, permissions, owners, and sizes. |
| `cd` | `~`, `..`, `-`, `/`, relative | Changes current directory; updates internal shell context and `$PWD`. |
| `mkdir` | `-p`, `-v` | Creates new directories; `-p` generates nested intermediate parent folders. |
| `touch` | Multiple file arguments | Creates empty files or updates file modification timestamps. |
| `cat` | `-n`, `-b` | Concatenates and outputs file contents with optional line numbering. |
| `head` | `-n <lines>` | Prints the first $N$ lines of a file (default: 10). |
| `tail` | `-n <lines>` | Prints the last $N$ lines of a file (default: 10). |
| `cp` | `-r`, `-i`, `-v` | Copies files or recursively duplicates directory trees. |
| `mv` | `-i`, `-f` | Renames files or moves files/directories to another destination. |
| `rm` | `-r`, `-f`, `-rf` | Deletes files; `-r` removes directories and all nested children. |
| `chmod` | `+x`, `-x`, `755`, `644`, `777` | Modifies permission bits for Owner, Group, and Others. |
| `grep` | `-i`, `-v`, `-n` | Searches regular text patterns with case-insensitivity and line numbers. |
| `wc` | `-l`, `-w`, `-c` | Counts newlines, words, and byte lengths in files or piped streams. |
| `sort` | `-r`, `-n` | Alphabetizes or numerically sorts lines; `-r` reverses sorting order. |
| `uniq` | `-c`, `-d`, `-u` | Filters or counts adjacent duplicate lines from sorted streams. |
| `cut` | `-d <delim>`, `-f <field>` | Extracts specific columns from CSV or delimiter-separated data. |
| `echo` | Quoted / unquoted strings | Prints text to stdout; expands shell variables ($USER, $HOME, $PATH). |
| `whoami`| — | Outputs current active session username (`learner`). |
| `uname` | `-a`, `-r`, `-m` | Outputs kernel name, release version, architecture, and OS signature. |
| `date`  | — | Displays current UTC timestamp in standard RFC format. |
| `hostname`| — | Prints the simulated host system name (`linuxlab-box`). |
| `df`    | `-h` | Reports filesystem disk usage statistics across root and tmp mounts. |
| `free`  | `-h`, `-m` | Displays total, used, and available system RAM and buffer memory. |
| `ps`    | `aux` | Shows process snapshots including PID, user, TTY, CPU, and command name. |
| `top`   | — | Displays instantaneous CPU and memory resource utilization snapshot. |
| `env`   | — | Prints all active environment variables. |
| `export`| `VAR=value` | Exports environment variables to child processes and scripts. |
| `clear` | — | Clears the visible terminal output canvas. |
| `history`| — | Displays numbered list of previously executed commands in this session. |
| `man`   | `<command>` | Displays built-in manual pages for commands (e.g. `man ls`, `man grep`). |
| `./file`| Execution of scripts | Runs scripts marked with `chmod +x` containing shebang `#!/bin/bash`. |

---

## 📚 Curriculum Breakdown

### Level 1: Beginner — Linux Fundamentals
1. **01. Inspecting Working Directory with pwd**: Learn the inverted tree structure and inspect active paths.
2. **02. Listing Files and Metadata with ls**: View hidden files, understand mode bits, owner strings, and file sizes.
3. **03. Changing Directories with cd**: Master relative navigation, parent folders (`..`), home (`~`), and previous (`-`).
4. **04. Creating Directories with mkdir**: Create directory branches using the `-p` parent flag.
5. **05. Creating & Reading Files with touch & cat**: Create files, inspect text with `cat -n`, and practice redirection.
6. **06. Copying, Moving, and Removing with cp, mv, rm**: Duplicate files, rename paths, and safely remove targets.
7. **07. Linux File Permissions with chmod**: Decipher octal (755, 644) and symbolic (`+x`, `-w`) file permissions.
8. **08. System Information: whoami, uname, date**: Check system architecture, active user session, and kernel builds.

### Level 2: Intermediate — Working with Linux
9. **09. Standard Streams & Redirection (> and >>)**: Differentiate stdout, stdin, stderr, and learn overwrite vs. append.
10. **10. Chaining Commands with Pipes (|) and grep**: Combine composable Unix tools and filter text streams.
11. **11. Text Filtering with sort, uniq, and cut**: Slice tabular CSV records, alphabetize rows, and deduplicate streams.
12. **12. Processes & Environment Variables ($PATH, export)**: Inspect processes with `ps` and configure shell environment variables.

### Level 3: Advanced — Administration & Automation
13. **13. Shell Scripting, Shebang & Exit Codes**: Author `deploy.sh` scripts, configure shebang lines, and handle exit codes.
14. **14. Scheduled Tasks with Cron & Systemd Concepts**: Decipher the 5-field cron syntax (`* * * * *`) and study service management.

---

## 🧭 How to Use the Application

```
Step 1: Open Dashboard
   │
   ├── (Optional) Click "Sign In" or "Register" to create an account
   │
   └── Click "Start Lesson 1" or "Continue Learning"
         │
         ▼
Step 2: Enter Split-Screen Workspace
   │
   ├── Left Panel: Interactive Terminal
   │     • Type commands (e.g., pwd, ls -la, mkdir lab)
   │     • Press TAB for autocomplete
   │     • Press UP/DOWN arrows for history
   │     • Toggle "VFS Tree" to see files created in real-time
   │
   └── Right Panel: Lesson Deck
         • Concept Guide: Read objectives, syntax, flags, and click "Run Example"
         • Practical Task: Review instructions, run terminal commands, click "Check Answer"
         • Quiz: Answer multiple-choice questions for instant feedback
         • My Notes: Save personal study notes
         │
         ▼
Step 3: Review Progress & Explore
   │
   ├── Return to Dashboard to track streak and completion %
   ├── Browse Command Library for quick syntax lookup
   └── Launch Free-Play Sandbox to experiment without guardrails
```

---

## ⚙️ Configuration & Environment Variables

LinuxLab includes an `.env.example` file. For standard client-side usage, no API keys are required. If server-side proxy features are enabled:

```env
# Optional Gemini API key if using AI server extensions
GEMINI_API_KEY="YOUR_API_KEY_HERE"

# Application hosting URL (configured automatically on Cloud Run / preview hosts)
APP_URL="http://localhost:3000"
```

---

## 🚢 Deployment Guide

### Building for Production

Compile the TypeScript code and bundle static assets:
```bash
npm run build
```
This generates an optimized static bundle in the `dist/` directory.

### Deploying to Static Hosting Platforms

- **Vercel / Netlify / Cloudflare Pages**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Single-Page App (SPA) redirect rule: Route all requests to `/index.html` (or use the built-in `HashRouter` which works out-of-the-box).

- **Docker / Cloud Run Container**:
  ```dockerfile
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  FROM node:20-alpine AS runner
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY package*.json ./
  RUN npm ci --omit=dev
  EXPOSE 3000
  CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
  ```

---

## 🛡️ Contributing & Code Quality

To verify types and catch lint errors:
```bash
# Run TypeScript compiler checks
npm run lint

# Clean distribution artifacts
npm run clean
```

### Pull Request Guidelines
1. Ensure all TypeScript types are explicitly defined in `src/types/index.ts`.
2. Do not introduce unrestricted OS shell execution calls (`child_process.exec` or `eval`). Keep all terminal commands sandboxed within `commandExecutor.ts` and `virtualFs.ts`.
3. Adhere to the design constitution: maintain high-contrast black text (`#000000`) in bright mode and deep neutrals in dark mode.

---

## 📄 License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for more information.
