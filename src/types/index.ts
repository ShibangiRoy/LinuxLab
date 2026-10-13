export type TrackLevel = 'beginner' | 'intermediate' | 'advanced';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningPace = 'casual' | 'moderate' | 'intensive';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  experienceLevel: ExperienceLevel;
  learningPace: LearningPace;
  theme: 'dark' | 'light';
  streakCount: number;
  lastActiveDate: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PracticalTask {
  id: string;
  problemStatement: string;
  instructions: string[];
  hints: string[];
  solutionExplanation: string;
  verify: (vfs: any, lastCommand?: string) => { passed: boolean; message: string };
}

export interface LessonExample {
  command: string;
  explanation: string;
  expectedOutput: string;
}

export interface LessonFlag {
  flag: string;
  purpose: string;
}

export interface Lesson {
  id: string;
  track: TrackLevel;
  module: string;
  moduleId: string;
  title: string;
  estimatedMinutes: number;
  objectives: string[];
  syntax: string;
  description: string;
  flags: LessonFlag[];
  examples: LessonExample[];
  commonMistakes: string[];
  safetyNotes?: string;
  task: PracticalTask;
  quiz: QuizQuestion[];
}

export interface ModuleData {
  id: string;
  track: TrackLevel;
  title: string;
  description: string;
  lessonIds: string[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  taskCompleted: boolean;
  quizScore?: number;
  quizTotal?: number;
  completedAt?: string;
  lastAccessed: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface CommandDoc {
  name: string;
  category: 'Navigation' | 'File Management' | 'Text Processing' | 'Permissions' | 'System Info' | 'Process Management' | 'Automation & Scripting';
  track: TrackLevel;
  syntax: string;
  description: string;
  flags: { flag: string; description: string }[];
  examples: { command: string; description: string }[];
  safe: boolean;
  relatedCommands: string[];
  lessonId?: string;
}
