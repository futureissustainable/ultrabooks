import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string; // HH:MM format
  lastNotificationDate: string | null;
}

interface NotificationState extends NotificationSettings {
  permission: NotificationPermission | 'default';
  isSupported: boolean;

  setPermission: (permission: NotificationPermission) => void;
  setEnabled: (enabled: boolean) => void;
  setDailyReminder: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  scheduleGoalReminder: () => void;
  checkAndSendDailyReminder: (hasReadToday: boolean, currentStreak: number) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      enabled: false,
      dailyReminder: true,
      reminderTime: '20:00', // 8 PM default
      lastNotificationDate: null,
      permission: 'default',
      isSupported: typeof window !== 'undefined' && 'Notification' in window,

      setPermission: (permission) => set({ permission }),

      setEnabled: (enabled) => {
        set({ enabled });
        if (enabled) {
          get().scheduleGoalReminder();
        }
      },

      setDailyReminder: (dailyReminder) => {
        set({ dailyReminder });
        if (dailyReminder && get().enabled) {
          get().scheduleGoalReminder();
        }
      },

      setReminderTime: (reminderTime) => {
        set({ reminderTime });
        if (get().enabled && get().dailyReminder) {
          get().scheduleGoalReminder();
        }
      },

      requestPermission: async () => {
        if (!get().isSupported) return false;

        try {
          const permission = await Notification.requestPermission();
          set({ permission, enabled: permission === 'granted' });
          return permission === 'granted';
        } catch (error) {
          console.error('Failed to request notification permission:', error);
          return false;
        }
      },

      sendNotification: (title, options) => {
        const { permission, isSupported } = get();
        if (!isSupported || permission !== 'granted') return;

        try {
          // Check if service worker is available for better notifications
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_NOTIFICATION',
              payload: {
                title,
                options: {
                  icon: '/icons/icon-192.png',
                  badge: '/icons/icon-192.png',
                  tag: 'memoros-notification',
                  renotify: true,
                  ...options,
                },
              },
            });
          } else {
            // Fallback to regular notification
            new Notification(title, {
              icon: '/icons/icon-192.png',
              ...options,
            });
          }
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      },

      scheduleGoalReminder: () => {
        const { enabled, dailyReminder, reminderTime } = get();
        if (!enabled || !dailyReminder) return;

        // Calculate time until next reminder
        const [hours, minutes] = reminderTime.split(':').map(Number);
        const now = new Date();
        const reminderDate = new Date();
        reminderDate.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (reminderDate <= now) {
          reminderDate.setDate(reminderDate.getDate() + 1);
        }

        const msUntilReminder = reminderDate.getTime() - now.getTime();

        // Store the timeout so it can be cancelled if settings change
        if (typeof window !== 'undefined') {
          // Clear any existing timeout
          if ((window as unknown as { __memorosReminderTimeout?: NodeJS.Timeout }).__memorosReminderTimeout) {
            clearTimeout((window as unknown as { __memorosReminderTimeout?: NodeJS.Timeout }).__memorosReminderTimeout);
          }

          // Set new timeout (max setTimeout is ~24.8 days, so this is fine for daily)
          (window as unknown as { __memorosReminderTimeout: NodeJS.Timeout }).__memorosReminderTimeout = setTimeout(() => {
            // The actual reminder check will be done when this fires
            // For now, we just re-schedule
            get().scheduleGoalReminder();
          }, msUntilReminder);
        }
      },

      checkAndSendDailyReminder: (hasReadToday, currentStreak) => {
        const { enabled, dailyReminder, lastNotificationDate } = get();
        if (!enabled || !dailyReminder) return;

        const today = new Date().toDateString();

        // Only send one notification per day
        if (lastNotificationDate === today) return;

        // Don't send if user has already read today
        if (hasReadToday) return;

        // Send the notification
        const messages = [
          currentStreak > 0
            ? `Keep your ${currentStreak} day streak alive! Read for just a few minutes today.`
            : 'Start a reading streak today! Open a book and read for a few minutes.',
          'Your books are waiting for you. Take a reading break!',
          `Don't break the chain! Your ${currentStreak} day streak is on the line.`,
          'A few pages a day keeps the stress away. Time to read!',
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];

        get().sendNotification('Time to Read', {
          body: message,
          tag: 'daily-reminder',
          requireInteraction: false,
          data: { type: 'daily-reminder' },
        });

        set({ lastNotificationDate: today });
      },
    }),
    {
      name: 'memoros-notifications',
      partialize: (state) => ({
        enabled: state.enabled,
        dailyReminder: state.dailyReminder,
        reminderTime: state.reminderTime,
        lastNotificationDate: state.lastNotificationDate,
      }),
    }
  )
);

// Initialize permission state on load
if (typeof window !== 'undefined' && 'Notification' in window) {
  useNotificationStore.setState({ permission: Notification.permission });
}
