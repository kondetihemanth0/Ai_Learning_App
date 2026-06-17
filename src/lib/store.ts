import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuizResult {
  subject: string;
  topic: string;
  score: number;
  total: number;
  date: string;
}

export interface LessonProgress {
  subject: string;
  topic: string;
  completed: boolean;
  timeSpent: number; // minutes
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;
  
  learningLevel: 'beginner' | 'intermediate' | 'expert';
  setLearningLevel: (level: 'beginner' | 'intermediate' | 'expert') => void;
  
  quizResults: QuizResult[];
  addQuizResult: (result: QuizResult) => void;
  
  lessonHistory: LessonProgress[];
  addLesson: (lesson: LessonProgress) => void;
  
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  
  totalTimeSpent: number;
  addTime: (minutes: number) => void;
  
  streak: number;
  lastActiveDate: string;
  updateStreak: () => void;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', unlocked: false },
  { id: 'quiz_ace', title: 'Quiz Ace', description: 'Score 100% on a quiz', icon: '🏆', unlocked: false },
  { id: 'explorer', title: 'Explorer', description: 'Try 5 different subjects', icon: '🗺️', unlocked: false },
  { id: 'scientist', title: 'Scientist', description: 'Run 10 simulations', icon: '🔬', unlocked: false },
  { id: 'streak_7', title: '7-Day Streak', description: 'Learn 7 days in a row', icon: '🔥', unlocked: false },
  { id: 'quiz_master', title: 'Quiz Master', description: 'Complete 10 quizzes', icon: '📝', unlocked: false },
  { id: 'speed_learner', title: 'Speed Learner', description: 'Complete 5 lessons in one day', icon: '⚡', unlocked: false },
  { id: 'knowledge_seeker', title: 'Knowledge Seeker', description: 'Spend 60 minutes learning', icon: '📚', unlocked: false },
];

export const useStore = create<AppState>()(
  persist(
     (set, get) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      
      learningLevel: 'beginner',
      setLearningLevel: (level) => set({ learningLevel: level }),
      
      quizResults: [],
      addQuizResult: (result) => {
        const results = [...get().quizResults, result];
        set({ quizResults: results });
        // Check achievements
        if (result.score === result.total) get().unlockAchievement('quiz_ace');
        if (results.length >= 10) get().unlockAchievement('quiz_master');
      },
      
      lessonHistory: [],
      addLesson: (lesson) => {
        const history = [...get().lessonHistory, lesson];
        set({ lessonHistory: history });
        if (history.length >= 1) get().unlockAchievement('first_lesson');
        const subjects = new Set(history.map(l => l.subject));
        if (subjects.size >= 5) get().unlockAchievement('explorer');
      },
      
      achievements: DEFAULT_ACHIEVEMENTS,
      unlockAchievement: (id) => {
        const achievements = get().achievements.map(a => 
          a.id === id && !a.unlocked ? { ...a, unlocked: true, date: new Date().toISOString() } : a
        );
        set({ achievements });
      },
      
      totalTimeSpent: 0,
      addTime: (minutes) => {
        const total = get().totalTimeSpent + minutes;
        set({ totalTimeSpent: total });
        if (total >= 60) get().unlockAchievement('knowledge_seeker');
      },
      
      streak: 0,
      lastActiveDate: '',
      updateStreak: () => {
        const today = new Date().toDateString();
        const last = get().lastActiveDate;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (last === today) return;
        const newStreak = last === yesterday ? get().streak + 1 : 1;
        set({ streak: newStreak, lastActiveDate: today });
        if (newStreak >= 7) get().unlockAchievement('streak_7');
      },
    }),
    { 
      name: 'learnai-store',
      version: 5,
      migrate: (persisted: any, version: number) => {
        if (version < 5) {
          // Clear ollama key — switch to Groq (user must enter gsk_ key)
          if (!persisted.apiKey || persisted.apiKey === 'ollama') {
            persisted.apiKey = '';
          }
        }
        return persisted;
      },
    }
  )
);

