import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StreakGoal, DailyProgress, StreakData } from '@/lib/supabase/types';

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterday = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

const createEmptyDayProgress = (date: string): DailyProgress => ({
  date,
  pagesRead: 0,
  minutesRead: 0,
  goalMet: false,
});

interface StreakState extends StreakData {
  // Session tracking
  sessionStartTime: number | null;
  sessionStartPage: number | null;

  // Actions
  setGoal: (goal: StreakGoal) => void;
  startReadingSession: (currentPage?: number) => void;
  endReadingSession: (currentPage?: number) => void;
  addPages: (pages: number) => void;
  addMinutes: (minutes: number) => void;
  checkAndUpdateStreak: () => void;
  resetStreak: () => void;

  // UI State
  isStreakModalOpen: boolean;
  isGoalModalOpen: boolean;
  showCelebration: boolean;
  setStreakModalOpen: (open: boolean) => void;
  setGoalModalOpen: (open: boolean) => void;
  dismissCelebration: () => void;
}

const defaultGoal: StreakGoal = {
  type: 'minutes',
  target: 15,
};

const defaultStreakData: StreakData = {
  goal: defaultGoal,
  currentStreak: 0,
  longestStreak: 0,
  todayProgress: createEmptyDayProgress(getToday()),
  history: [],
  lastUpdated: getToday(),
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      ...defaultStreakData,

      // Session tracking
      sessionStartTime: null,
      sessionStartPage: null,

      // UI State
      isStreakModalOpen: false,
      isGoalModalOpen: false,
      showCelebration: false,

      setGoal: (goal) => {
        set({ goal });
        // Re-check if goal is now met
        get().checkAndUpdateStreak();
      },

      startReadingSession: (currentPage) => {
        set({
          sessionStartTime: Date.now(),
          sessionStartPage: currentPage ?? null,
        });
      },

      endReadingSession: (currentPage) => {
        const { sessionStartTime, sessionStartPage, addMinutes, addPages } = get();

        if (sessionStartTime) {
          const minutesRead = Math.floor((Date.now() - sessionStartTime) / 60000);
          if (minutesRead > 0) {
            addMinutes(minutesRead);
          }
        }

        if (sessionStartPage !== null && currentPage !== undefined) {
          const pagesRead = Math.max(0, currentPage - sessionStartPage);
          if (pagesRead > 0) {
            addPages(pagesRead);
          }
        }

        set({
          sessionStartTime: null,
          sessionStartPage: null,
        });
      },

      addPages: (pages) => {
        const state = get();
        const today = getToday();

        // Ensure we have today's progress
        let todayProgress = state.todayProgress;
        if (todayProgress.date !== today) {
          // It's a new day, check streak continuity first
          state.checkAndUpdateStreak();
          todayProgress = createEmptyDayProgress(today);
        }

        const newPagesRead = todayProgress.pagesRead + pages;
        const goalMet = state.goal.type === 'pages'
          ? newPagesRead >= state.goal.target
          : todayProgress.goalMet;

        const wasNotMet = !todayProgress.goalMet;
        const justMetGoal = wasNotMet && goalMet;

        set({
          todayProgress: {
            ...todayProgress,
            pagesRead: newPagesRead,
            goalMet,
          },
          lastUpdated: new Date().toISOString(),
          showCelebration: justMetGoal,
        });

        if (justMetGoal) {
          get().checkAndUpdateStreak();
        }
      },

      addMinutes: (minutes) => {
        const state = get();
        const today = getToday();

        // Ensure we have today's progress
        let todayProgress = state.todayProgress;
        if (todayProgress.date !== today) {
          // It's a new day, check streak continuity first
          state.checkAndUpdateStreak();
          todayProgress = createEmptyDayProgress(today);
        }

        const newMinutesRead = todayProgress.minutesRead + minutes;
        const goalMet = state.goal.type === 'minutes'
          ? newMinutesRead >= state.goal.target
          : todayProgress.goalMet;

        const wasNotMet = !todayProgress.goalMet;
        const justMetGoal = wasNotMet && goalMet;

        set({
          todayProgress: {
            ...todayProgress,
            minutesRead: newMinutesRead,
            goalMet,
          },
          lastUpdated: new Date().toISOString(),
          showCelebration: justMetGoal,
        });

        if (justMetGoal) {
          get().checkAndUpdateStreak();
        }
      },

      checkAndUpdateStreak: () => {
        const state = get();
        const today = getToday();
        const yesterday = getYesterday();

        let { currentStreak, longestStreak, todayProgress, history } = state;

        // If it's a new day
        if (todayProgress.date !== today) {
          // Save yesterday's progress to history
          if (todayProgress.date) {
            history = [todayProgress, ...history].slice(0, 365); // Keep 1 year
          }

          // Check if streak continues
          const lastDate = todayProgress.date;
          if (lastDate === yesterday && todayProgress.goalMet) {
            // Streak continues from yesterday
          } else if (lastDate !== yesterday) {
            // Streak is broken (missed a day)
            currentStreak = 0;
          }

          // Create new today progress
          todayProgress = createEmptyDayProgress(today);
        }

        // If today's goal is met, increment streak
        if (todayProgress.goalMet) {
          // Only count today once
          const alreadyCounted = history.some(d => d.date === today && d.goalMet);
          if (!alreadyCounted && todayProgress.date === today) {
            currentStreak = currentStreak + 1;
            longestStreak = Math.max(longestStreak, currentStreak);
          }
        }

        set({
          currentStreak,
          longestStreak,
          todayProgress,
          history,
          lastUpdated: new Date().toISOString(),
        });
      },

      resetStreak: () => {
        set({
          ...defaultStreakData,
          todayProgress: createEmptyDayProgress(getToday()),
          lastUpdated: new Date().toISOString(),
        });
      },

      setStreakModalOpen: (open) => set({ isStreakModalOpen: open }),
      setGoalModalOpen: (open) => set({ isGoalModalOpen: open }),
      dismissCelebration: () => set({ showCelebration: false }),
    }),
    {
      name: 'ultrabooks-streak-data',
      partialize: (state) => ({
        goal: state.goal,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        todayProgress: state.todayProgress,
        history: state.history,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
