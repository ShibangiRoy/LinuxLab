export interface VNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  permissions: string; // e.g. "rwxr-xr-x"
  owner: string;
  group: string;
  modified: string; // ISO string
  children?: Record<string, VNode>;
}

export interface TreeItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  permissions: string;
  size: number;
  children?: TreeItem[];
}

export class VirtualFileSystem {
  private root: VNode;
  private cwd: string = '/home/learner';

  constructor(initialData?: { root: VNode; cwd: string }) {
    if (initialData && initialData.root) {
      this.root = initialData.root;
      this.cwd = initialData.cwd || '/home/learner';
    } else {
      this.root = this.createDefaultFilesystem();
    }
  }

  public serialize(): { root: VNode; cwd: string } {
    return {
      root: JSON.parse(JSON.stringify(this.root)),
      cwd: this.cwd,
    };
  }

  private createDefaultFilesystem(): VNode {
    const now = new Date().toISOString();
    const root: VNode = {
      name: '',
      type: 'dir',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      modified: now,
      children: {},
    };

    const addDir = (parent: VNode, name: string, owner = 'root', group = 'root', perms = 'rwxr-xr-x'): VNode => {
      const dir: VNode = {
        name,
        type: 'dir',
        permissions: perms,
        owner,
        group,
        modified: now,
        children: {},
      };
      parent.children![name] = dir;
      return dir;
    };

    const addFile = (parent: VNode, name: string, content = '', owner = 'learner', group = 'learner', perms = 'rw-r--r--'): VNode => {
      const file: VNode = {
        name,
        type: 'file',
        permissions: perms,
        owner,
        group,
        modified: now,
        content,
      };
      parent.children![name] = file;
      return file;
    };

    // System directories
    const bin = addDir(root, 'bin');
    addFile(bin, 'bash', '#!/bin/sh\n# LinuxLab Shell Executable', 'root', 'root', 'rwxr-xr-x');
    addFile(bin, 'ls', '#!/bin/sh\n# List directory contents', 'root', 'root', 'rwxr-xr-x');

    const etc = addDir(root, 'etc');
    addFile(etc, 'os-release', 'NAME="LinuxLab OS"\nVERSION="2026.1 LTS"\nID=linuxlab\nPRETTY_NAME="LinuxLab Interactive OS 2026"');
    addFile(etc, 'hostname', 'linuxlab-box');
    addFile(etc, 'shells', '/bin/sh\n/bin/bash\n/bin/dash\n');

    const home = addDir(root, 'home');
    const userHome = addDir(home, 'learner', 'learner', 'learner', 'rwxr-xr-x');

    addFile(
      userHome,
      'welcome.txt',
      'Welcome to LinuxLab — Interactive Linux Learning Environment!\n\nHere are a few quick tips:\n1. Use "pwd" to inspect your current folder.\n2. Use "ls" or "ls -la" to view directory contents.\n3. Use "mkdir" to create directories and "touch" to create files.\n4. Use "cat <file>" to read files.\n5. Press Tab to auto-complete commands and file paths.\n\nEnjoy your journey into Linux!',
      'learner',
      'learner',
      'rw-r--r--'
    );

    const projects = addDir(userHome, 'projects', 'learner', 'learner');
    addFile(projects, 'todo.txt', '1. Complete Level 1 Linux Fundamentals\n2. Practice pipes and text redirection\n3. Write automation script in bash\n');
    addFile(projects, 'data.csv', 'id,name,role,department\n101,Alice,DevOps,Infrastructure\n102,Bob,Developer,Frontend\n103,Charlie,SysAdmin,Operations\n104,Diana,Security,SecOps\n105,Evan,Analyst,Data\n');

    const docs = addDir(userHome, 'documents', 'learner', 'learner');
    addFile(docs, 'cheatsheet.md', '# Linux Quick Commands\n- pwd: Print working directory\n- cd <dir>: Change directory\n- ls -la: List all files with details\n- mkdir -p <path>: Create directory parents\n- grep <term> <file>: Search for text\n- wc -l <file>: Count lines\n');

    const varDir = addDir(root, 'var');
    const logDir = addDir(varDir, 'log', 'root', 'root');
    addFile(
      logDir,
      'syslog',
      'Oct 13 04:00:01 linuxlab systemd[1]: Started Daily System Check.\nOct 13 04:02:15 linuxlab kernel: LinuxLab virtual subsystem initialized.\nOct 13 04:05:33 linuxlab auth: learner session opened for user learner (uid=1000).\nOct 13 04:10:00 linuxlab systemd[1]: Reached target Graphical Interface.\nOct 13 04:12:44 linuxlab sshd: Server listening on 0.0.0.0 port 22.\n',
      'root',
      'root'
    );
    addFile(logDir, 'auth.log', 'Oct 13 04:05:32 linuxlab sshd: Accepted publickey for learner from 127.0.0.1 port 52341\n');

    const tmp = addDir(root, 'tmp', 'root', 'root', 'rwxrwxrwt');
    addFile(tmp, 'session.lock', 'PID=4812\nACTIVE=true\n', 'learner', 'learner', 'rw-rw-r--');

    return root;
  }

  public getCwd(): string {
    return this.cwd;
  }

  public setCwd(path: string): boolean {
    const resolved = this.resolvePath(path);
    const node = this.getNode(resolved);
    if (node && node.type === 'dir') {
      this.cwd = resolved;
      return true;
    }
    return false;
  }

  public resolvePath(targetPath: string): string {
    if (!targetPath || targetPath === '.') return this.cwd;
    let parts: string[];

    if (targetPath.startsWith('/')) {
      parts = targetPath.split('/').filter(Boolean);
    } else if (targetPath.startsWith('~')) {
      const rest = targetPath.slice(1).split('/').filter(Boolean);
      parts = ['home', 'learner', ...rest];
    } else {
      parts = [...this.cwd.split('/').filter(Boolean), ...targetPath.split('/').filter(Boolean)];
    }

    const normalized: string[] = [];
    for (const p of parts) {
      if (p === '.') continue;
      if (p === '..') {
        if (normalized.length > 0) normalized.pop();
      } else {
        normalized.push(p);
      }
    }

    return '/' + normalized.join('/');
  }

  public getNode(path: string): VNode | null {
    if (path === '/' || path === '') return this.root;
    const parts = path.split('/').filter(Boolean);
    let curr = this.root;

    for (const p of parts) {
      if (!curr.children || !curr.children[p]) {
        return null;
      }
      curr = curr.children[p];
    }
    return curr;
  }

  public createDirectory(path: string, recursive: boolean = false): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path);
    const parts = resolved.split('/').filter(Boolean);
    if (parts.length === 0) return { success: false, error: 'Cannot create root directory' };

    let curr = this.root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!curr.children || !curr.children[part]) {
        if (recursive) {
          const newDir: VNode = {
            name: part,
            type: 'dir',
            permissions: 'rwxr-xr-x',
            owner: 'learner',
            group: 'learner',
            modified: new Date().toISOString(),
            children: {},
          };
          if (!curr.children) curr.children = {};
          curr.children[part] = newDir;
          curr = newDir;
        } else {
          return { success: false, error: `No such file or directory: /${parts.slice(0, i + 1).join('/')}` };
        }
      } else {
        const next = curr.children[part];
        if (next.type !== 'dir') return { success: false, error: `Not a directory: ${part}` };
        curr = next;
      }
    }

    const targetName = parts[parts.length - 1];
    if (curr.children && curr.children[targetName]) {
      return { success: false, error: `File exists: ${targetName}` };
    }

    if (!curr.children) curr.children = {};
    curr.children[targetName] = {
      name: targetName,
      type: 'dir',
      permissions: 'rwxr-xr-x',
      owner: 'learner',
      group: 'learner',
      modified: new Date().toISOString(),
      children: {},
    };

    return { success: true };
  }

  public createFile(path: string, content: string = '', append: boolean = false): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path);
    const parts = resolved.split('/').filter(Boolean);
    if (parts.length === 0) return { success: false, error: 'Invalid path' };

    const parentPath = '/' + parts.slice(0, -1).join('/');
    const parentNode = this.getNode(parentPath);
    if (!parentNode || parentNode.type !== 'dir') {
      return { success: false, error: `No such directory: ${parentPath}` };
    }

    const fileName = parts[parts.length - 1];
    if (!parentNode.children) parentNode.children = {};

    const existing = parentNode.children[fileName];
    const now = new Date().toISOString();

    if (existing) {
      if (existing.type === 'dir') return { success: false, error: `${fileName} is a directory` };
      existing.content = append ? (existing.content || '') + content : content;
      existing.modified = now;
    } else {
      parentNode.children[fileName] = {
        name: fileName,
        type: 'file',
        permissions: 'rw-r--r--',
        owner: 'learner',
        group: 'learner',
        content,
        modified: now,
      };
    }

    return { success: true };
  }

  public removeNode(path: string, recursive: boolean = false): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path);
    if (resolved === '/' || resolved === '/home' || resolved === '/home/learner') {
      return { success: false, error: 'Cannot remove system directory' };
    }

    const parts = resolved.split('/').filter(Boolean);
    const parentPath = '/' + parts.slice(0, -1).join('/');
    const parentNode = this.getNode(parentPath);
    const targetName = parts[parts.length - 1];

    if (!parentNode || !parentNode.children || !parentNode.children[targetName]) {
      return { success: false, error: `No such file or directory: ${path}` };
    }

    const target = parentNode.children[targetName];
    if (target.type === 'dir' && Object.keys(target.children || {}).length > 0 && !recursive) {
      return { success: false, error: `Directory not empty: ${targetName}` };
    }

    delete parentNode.children[targetName];
    return { success: true };
  }

  public copyNode(srcPath: string, destPath: string, recursive: boolean = false): { success: boolean; error?: string } {
    const resolvedSrc = this.resolvePath(srcPath);
    const srcNode = this.getNode(resolvedSrc);
    if (!srcNode) return { success: false, error: `cannot stat '${srcPath}': No such file or directory` };

    if (srcNode.type === 'dir' && !recursive) {
      return { success: false, error: `-r not specified; omitting directory '${srcPath}'` };
    }

    let resolvedDest = this.resolvePath(destPath);
    const destNode = this.getNode(resolvedDest);

    // If destination is an existing directory, copy inside it
    if (destNode && destNode.type === 'dir') {
      resolvedDest = `${resolvedDest}/${srcNode.name}`.replace('//', '/');
    }

    const destParts = resolvedDest.split('/').filter(Boolean);
    const parentDestPath = '/' + destParts.slice(0, -1).join('/');
    const parentDestNode = this.getNode(parentDestPath);

    if (!parentDestNode || parentDestNode.type !== 'dir') {
      return { success: false, error: `cannot create '${destPath}': No such directory` };
    }

    const destName = destParts[destParts.length - 1];
    const cloneNode = (node: VNode, newName: string): VNode => {
      const copy: VNode = {
        name: newName,
        type: node.type,
        permissions: node.permissions,
        owner: 'learner',
        group: 'learner',
        modified: new Date().toISOString(),
        content: node.content,
      };
      if (node.children) {
        copy.children = {};
        for (const [k, child] of Object.entries(node.children)) {
          copy.children[k] = cloneNode(child, child.name);
        }
      }
      return copy;
    };

    if (!parentDestNode.children) parentDestNode.children = {};
    parentDestNode.children[destName] = cloneNode(srcNode, destName);

    return { success: true };
  }

  public moveNode(srcPath: string, destPath: string): { success: boolean; error?: string } {
    const copyRes = this.copyNode(srcPath, destPath, true);
    if (!copyRes.success) return copyRes;
    return this.removeNode(srcPath, true);
  }

  public setPermissions(path: string, mode: string): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path);
    const node = this.getNode(resolved);
    if (!node) return { success: false, error: `cannot access '${path}': No such file or directory` };

    // Support chmod +x, chmod 755, chmod 644, etc.
    if (mode === '+x') {
      node.permissions = node.permissions.replace(/-(.)-/g, 'x$1x').replace(/-$/, 'x');
    } else if (mode === '-x') {
      node.permissions = node.permissions.replace(/x/g, '-');
    } else if (/^[0-7]{3}$/.test(mode)) {
      const mapPerm = (digit: string) => {
        const d = parseInt(digit, 10);
        const r = d & 4 ? 'r' : '-';
        const w = d & 2 ? 'w' : '-';
        const x = d & 1 ? 'x' : '-';
        return `${r}${w}${x}`;
      };
      node.permissions = `${mapPerm(mode[0])}${mapPerm(mode[1])}${mapPerm(mode[2])}`;
    } else {
      return { success: false, error: `invalid mode: '${mode}'` };
    }

    return { success: true };
  }

  public getTree(node: VNode = this.root, currentPath: string = ''): TreeItem {
    const path = currentPath === '' ? '/' : currentPath;
    const item: TreeItem = {
      name: node.name || '/',
      path,
      type: node.type,
      permissions: node.permissions,
      size: node.content ? node.content.length : 4096,
    };

    if (node.type === 'dir' && node.children) {
      item.children = Object.values(node.children).map((child) => {
        const childPath = path === '/' ? `/${child.name}` : `${path}/${child.name}`;
        return this.getTree(child, childPath);
      });
    }

    return item;
  }

  public reset(): void {
    this.root = this.createDefaultFilesystem();
    this.cwd = '/home/learner';
  }
}
