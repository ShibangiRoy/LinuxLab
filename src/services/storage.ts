import { UserProfile, LessonProgress, Achievement, ExperienceLevel, LearningPace } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'linuxlab_current_user',
  USERS_DB: 'linuxlab_registered_users',
  PROGRESS: 'linuxlab_progress',
  ACHIEVEMENTS: 'linuxlab_achievements',
  BOOKMARKS: 'linuxlab_bookmarks',
  NOTES: 'linuxlab_notes',
  THEME: 'linuxlab_theme',
  VFS_STATE: 'linuxlab_vfs_state',
};

export interface StoredAccount {
  user: UserProfile;
  passwordHash: string;
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-command',
    title: 'Hello Terminal',
    description: 'Executed your first interactive Linux command in the simulated shell.',
    icon: 'Terminal',
  },
  {
    id: 'navigator',
    title: 'Filesystem Navigator',
    description: 'Completed all core navigation lessons (pwd, ls, cd).',
    icon: 'Compass',
  },
  {
    id: 'stream-weaver',
    title: 'Stream Weaver',
    description: 'Constructed a working multi-stage pipeline using pipes and redirection.',
    icon: 'GitFork',
  },
  {
    id: 'automator',
    title: 'Automation Architect',
    description: 'Wrote and executed a bash script with shebang and chmod permissions.',
    icon: 'Zap',
  },
  {
    id: 'quiz-master',
    title: 'Linux Certified',
    description: 'Scored 100% on a lesson assessment quiz on your first try.',
    icon: 'Award',
  },
];

export class StorageService {
  // Purge any stale dummy data from previous sessions
  private static sanitizeOldDummyData(): void {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.id === 'user-demo-1' || parsed.email === 'learner@linuxlab.dev') {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
      }

      // Check achievements for fake pre-unlocked timestamp
      const achData = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (achData) {
        const parsedAch: Achievement[] = JSON.parse(achData);
        if (parsedAch.some((a) => a.id === 'first-command' && a.unlockedAt === '2026-10-10T08:15:00Z')) {
          localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
        }
      }

      // Check progress for fake initial completed task
      const progData = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (progData) {
        const parsedProg = JSON.parse(progData);
        if (parsedProg['l1-pwd']?.completedAt === '2026-10-10T08:30:00Z') {
          localStorage.removeItem(STORAGE_KEYS.PROGRESS);
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  // Get current active user (null if signed out)
  public static getCurrentUser(): UserProfile | null {
    this.sanitizeOldDummyData();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return null;
  }

  public static saveCurrentUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  public static getRegisteredAccounts(): StoredAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to read accounts db', e);
    }
    return [];
  }

  public static saveRegisteredAccounts(accounts: StoredAccount[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(accounts));
  }

  // Real authentication: Sign In
  public static loginUser(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
    this.sanitizeOldDummyData();
    const cleanEmail = email.trim().toLowerCase();
    const accounts = this.getRegisteredAccounts();
    const account = accounts.find((a) => a.user.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, error: 'Account not found with this email. Please create an account.' };
    }

    if (account.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    this.saveCurrentUser(account.user);
    return { success: true, user: account.user };
  }

  // Real authentication: Register
  public static registerUser(
    email: string,
    password: string,
    displayName: string,
    experienceLevel: ExperienceLevel,
    learningPace: LearningPace
  ): { success: boolean; user?: UserProfile; error?: string } {
    this.sanitizeOldDummyData();
    const cleanEmail = email.trim().toLowerCase();
    const accounts = this.getRegisteredAccounts();

    if (accounts.some((a) => a.user.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      experienceLevel,
      learningPace,
      theme: this.getTheme(),
      streakCount: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    accounts.push({
      user: newUser,
      passwordHash: password,
    });

    this.saveRegisteredAccounts(accounts);
    this.saveCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  // Real authentication: Reset Password
  public static resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = this.getRegisteredAccounts();
    const target = accounts.find((a) => a.user.email.toLowerCase() === cleanEmail);

    if (!target) {
      return { success: false, error: 'No account registered with this email.' };
    }

    target.passwordHash = newPassword;
    this.saveRegisteredAccounts(accounts);

    // If currently logged in, update current session
    const current = this.getCurrentUser();
    if (current && current.email.toLowerCase() === cleanEmail) {
      this.saveCurrentUser(target.user);
    }

    return { success: true };
  }

  // Sign out properly
  public static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  public static updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const updated = { ...user, ...updates };
    this.saveCurrentUser(updated);

    // Also update in registered accounts db
    const accounts = this.getRegisteredAccounts();
    const idx = accounts.findIndex((a) => a.user.id === user.id);
    if (idx !== -1) {
      accounts[idx].user = updated;
      this.saveRegisteredAccounts(accounts);
    }

    return updated;
  }

  // Progress (Empty by default for real users)
  public static getProgress(): Record<string, LessonProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Progress read failed', e);
    }
    return {};
  }

  public static saveProgress(progress: Record<string, LessonProgress>): void {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }

  public static markLessonCompleted(lessonId: string, taskPassed = true, quizScore?: number, quizTotal?: number): void {
    const all = this.getProgress();
    const existing = all[lessonId] || {
      lessonId,
      completed: false,
      taskCompleted: false,
      lastAccessed: new Date().toISOString(),
    };

    all[lessonId] = {
      ...existing,
      completed: true,
      taskCompleted: taskPassed || existing.taskCompleted,
      quizScore: quizScore !== undefined ? quizScore : existing.quizScore,
      quizTotal: quizTotal !== undefined ? quizTotal : existing.quizTotal,
      completedAt: existing.completedAt || new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    };

    this.saveProgress(all);

    // Update streak for active user
    const user = this.getCurrentUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      if (user.lastActiveDate !== today) {
        this.updateProfile({
          streakCount: (user.streakCount || 0) + 1,
          lastActiveDate: today,
        });
      }
    }
  }

  public static markTaskCompleted(lessonId: string): void {
    const all = this.getProgress();
    const existing = all[lessonId] || {
      lessonId,
      completed: false,
      taskCompleted: false,
      lastAccessed: new Date().toISOString(),
    };

    all[lessonId] = {
      ...existing,
      taskCompleted: true,
      lastAccessed: new Date().toISOString(),
    };

    this.saveProgress(all);
  }

  // Achievements
  public static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Achievements read failed', e);
    }
    return INITIAL_ACHIEVEMENTS;
  }

  public static unlockAchievement(id: string): Achievement | null {
    const list = this.getAchievements();
    const target = list.find((a) => a.id === id);
    if (target && !target.unlockedAt) {
      target.unlockedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(list));
      return target;
    }
    return null;
  }

  // Bookmarks
  public static getBookmarks(): { type: 'command' | 'lesson'; id: string }[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Bookmarks read failed', e);
    }
    return [];
  }

  public static toggleBookmark(type: 'command' | 'lesson', id: string): boolean {
    const list = this.getBookmarks();
    const index = list.findIndex((b) => b.type === type && b.id === id);
    let isBookmarked = false;
    if (index >= 0) {
      list.splice(index, 1);
      isBookmarked = false;
    } else {
      list.push({ type, id });
      isBookmarked = true;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    return isBookmarked;
  }

  // Notes
  public static getLessonNote(lessonId: string): string {
    try {
      const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '{}');
      return notes[lessonId] || '';
    } catch (e) {
      return '';
    }
  }

  public static saveLessonNote(lessonId: string, noteText: string): void {
    try {
      const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '{}');
      notes[lessonId] = noteText;
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('Save note failed', e);
    }
  }

  // Theme
  public static getTheme(): 'dark' | 'light' {
    const val = localStorage.getItem(STORAGE_KEYS.THEME);
    return val === 'light' ? 'light' : 'dark';
  }

  public static setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // Reset Progress
  public static resetProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.VFS_STATE);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
  }
}
