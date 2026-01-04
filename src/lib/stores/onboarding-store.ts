import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Onboarding Store - Psychology-driven user journey tracking
 *
 * Applies behavioral psychology principles:
 * - Endowed Progress Effect: Pre-complete some steps to give users a head start
 * - Zeigarnik Effect: Incomplete tasks drive completion
 * - Goal Gradient Effect: Progress accelerates as goals get closer
 */

export interface OnboardingMilestone {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  // Pre-completed items (Endowed Progress Effect)
  preCompleted?: boolean;
}

interface OnboardingState {
  // Core state
  hasSeenWelcome: boolean;
  hasCompletedOnboarding: boolean;
  showOnboardingChecklist: boolean;
  milestones: OnboardingMilestone[];

  // User preferences
  dismissedHints: Set<string>;

  // Actions
  setHasSeenWelcome: (seen: boolean) => void;
  completeMilestone: (id: string) => void;
  dismissHint: (hintId: string) => void;
  resetOnboarding: () => void;
  toggleChecklist: () => void;
  getProgress: () => { completed: number; total: number; percentage: number };
}

// Default milestones with Endowed Progress Effect
// First 2 are pre-completed to give users momentum
const defaultMilestones: OnboardingMilestone[] = [
  {
    id: 'account_created',
    label: 'Create account',
    description: 'Welcome to MEMOROS!',
    completed: true,
    preCompleted: true,
    completedAt: new Date().toISOString(),
  },
  {
    id: 'explore_library',
    label: 'Explore library',
    description: 'You found your way here',
    completed: true,
    preCompleted: true,
    completedAt: new Date().toISOString(),
  },
  {
    id: 'first_book',
    label: 'Add your first book',
    description: 'Upload or browse classics',
    completed: false,
  },
  {
    id: 'start_reading',
    label: 'Start reading',
    description: 'Open a book and dive in',
    completed: false,
  },
  {
    id: 'create_highlight',
    label: 'Create a highlight',
    description: 'Save your favorite passages',
    completed: false,
  },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      hasSeenWelcome: false,
      hasCompletedOnboarding: false,
      showOnboardingChecklist: true,
      milestones: defaultMilestones,
      dismissedHints: new Set(),

      setHasSeenWelcome: (seen: boolean) => set({ hasSeenWelcome: seen }),

      completeMilestone: (id: string) => {
        set((state) => {
          const milestones = state.milestones.map((m) =>
            m.id === id && !m.completed
              ? { ...m, completed: true, completedAt: new Date().toISOString() }
              : m
          );

          // Check if all milestones are complete
          const allComplete = milestones.every((m) => m.completed);

          return {
            milestones,
            hasCompletedOnboarding: allComplete,
          };
        });
      },

      dismissHint: (hintId: string) => {
        set((state) => ({
          dismissedHints: new Set([...state.dismissedHints, hintId]),
        }));
      },

      resetOnboarding: () => {
        set({
          hasSeenWelcome: false,
          hasCompletedOnboarding: false,
          showOnboardingChecklist: true,
          milestones: defaultMilestones,
          dismissedHints: new Set(),
        });
      },

      toggleChecklist: () => {
        set((state) => ({
          showOnboardingChecklist: !state.showOnboardingChecklist,
        }));
      },

      getProgress: () => {
        const { milestones } = get();
        const completed = milestones.filter((m) => m.completed).length;
        const total = milestones.length;
        const percentage = Math.round((completed / total) * 100);
        return { completed, total, percentage };
      },
    }),
    {
      name: 'ultrabooks-onboarding',
      partialize: (state) => ({
        hasSeenWelcome: state.hasSeenWelcome,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        showOnboardingChecklist: state.showOnboardingChecklist,
        milestones: state.milestones,
        dismissedHints: Array.from(state.dismissedHints),
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<OnboardingState> & { dismissedHints?: string[] };
        return {
          ...current,
          ...p,
          dismissedHints: new Set(p.dismissedHints || []),
        };
      },
    }
  )
);
