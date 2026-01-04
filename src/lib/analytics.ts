import posthog from 'posthog-js';

// =============================================================================
// POSTHOG CONFIGURATION
// =============================================================================

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  if (initialized) return;
  if (!POSTHOG_KEY) {
    console.warn('[Analytics] PostHog key not configured. Set NEXT_PUBLIC_POSTHOG_KEY.');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Capture pageviews automatically
    capture_pageview: true,
    // Capture pageleaves for session duration
    capture_pageleave: true,
    // Enable session recording
    enable_recording_console_log: false,
    // Respect Do Not Track
    respect_dnt: true,
    // Disable in development by default
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        // Uncomment to disable in dev:
        // ph.opt_out_capturing();
      }
    },
    // Persistence
    persistence: 'localStorage+cookie',
    // Auto-capture clicks, inputs, etc.
    autocapture: true,
    // Session replay settings
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-mask]',
    },
  });

  initialized = true;
}

// =============================================================================
// USER IDENTIFICATION
// =============================================================================

export function identifyUser(userId: string, properties?: UserProperties) {
  if (typeof window === 'undefined') return;

  posthog.identify(userId, {
    ...properties,
    identified_at: new Date().toISOString(),
  });
}

export function resetUser() {
  if (typeof window === 'undefined') return;
  posthog.reset();
}

export function setUserProperties(properties: UserProperties) {
  if (typeof window === 'undefined') return;
  posthog.people.set(properties);
}

export function incrementUserProperty(property: string, value: number = 1) {
  if (typeof window === 'undefined') return;
  posthog.people.increment(property, value);
}

// =============================================================================
// EVENT TYPES - Strongly typed analytics events
// =============================================================================

export interface UserProperties {
  email?: string;
  display_name?: string;
  created_at?: string;
  book_count?: number;
  total_reading_time_minutes?: number;
  current_streak?: number;
  longest_streak?: number;
  plan?: 'free' | 'pro';
}

// ---- FUNNEL: Acquisition (Landing → Signup → Library) ----
export type AcquisitionEvent =
  | { event: 'landing_page_viewed'; properties?: { referrer?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string } }
  | { event: 'signup_started'; properties?: { method: 'email' | 'google' | 'github' } }
  | { event: 'signup_completed'; properties: { method: 'email' | 'google' | 'github'; user_id: string } }
  | { event: 'login_started'; properties?: { method: 'email' | 'google' | 'github' } }
  | { event: 'login_completed'; properties: { method: 'email' | 'google' | 'github'; user_id: string } }
  | { event: 'login_failed'; properties: { method: 'email' | 'google' | 'github'; error: string } }
  | { event: 'onboarding_started'; properties?: Record<string, unknown> }
  | { event: 'onboarding_completed'; properties?: { steps_completed: number } };

// ---- FUNNEL: Activation (Library → Upload → First Read) ----
export type ActivationEvent =
  | { event: 'library_viewed'; properties?: { book_count: number } }
  | { event: 'book_upload_started'; properties: { file_type: string; file_size_mb: number } }
  | { event: 'book_upload_completed'; properties: { book_id: string; title: string; file_type: string; file_size_mb: number } }
  | { event: 'book_upload_failed'; properties: { file_type: string; error: string } }
  | { event: 'first_book_opened'; properties: { book_id: string; book_type: 'uploaded' | 'classic' } }
  | { event: 'classic_book_selected'; properties: { book_id: string; title: string; author: string } };

// ---- FUNNEL: Engagement (Reading → Interaction → Return) ----
export type EngagementEvent =
  | { event: 'book_opened'; properties: { book_id: string; title: string; book_type: 'uploaded' | 'classic'; progress_percent: number } }
  | { event: 'book_closed'; properties: { book_id: string; reading_session_minutes: number; pages_read: number; progress_percent: number } }
  | { event: 'reading_session_started'; properties: { book_id: string } }
  | { event: 'reading_session_ended'; properties: { book_id: string; duration_seconds: number; pages_read: number } }
  | { event: 'bookmark_created'; properties: { book_id: string; page?: number } }
  | { event: 'bookmark_deleted'; properties: { book_id: string } }
  | { event: 'highlight_created'; properties: { book_id: string; color: string; text_length: number } }
  | { event: 'highlight_deleted'; properties: { book_id: string } }
  | { event: 'note_created'; properties: { book_id: string; note_length: number } }
  | { event: 'reader_settings_changed'; properties: { setting: string; value: string | number } }
  | { event: 'theme_changed'; properties: { theme: 'light' | 'dark' | 'sepia' } }
  | { event: 'font_changed'; properties: { font_family: string; font_size: number } };

// ---- FUNNEL: Retention (Streaks → Daily Usage) ----
export type RetentionEvent =
  | { event: 'daily_reading_goal_set'; properties: { minutes: number } }
  | { event: 'daily_reading_goal_achieved'; properties: { minutes_read: number; streak_day: number } }
  | { event: 'streak_started'; properties?: Record<string, unknown> }
  | { event: 'streak_continued'; properties: { streak_day: number } }
  | { event: 'streak_broken'; properties: { streak_length: number } }
  | { event: 'streak_milestone_reached'; properties: { streak_day: number; milestone: 7 | 30 | 100 | 365 } }
  | { event: 'app_opened'; properties?: { days_since_last_open?: number } }
  | { event: 'push_notification_enabled'; properties?: Record<string, unknown> }
  | { event: 'push_notification_disabled'; properties?: Record<string, unknown> }
  | { event: 'reminder_set'; properties: { time: string } };

// ---- FUNNEL: Viral/Sharing (Share → View → Convert) ----
export type ViralEvent =
  | { event: 'share_initiated'; properties: { book_id: string; share_type: 'book' | 'collection' } }
  | { event: 'share_link_created'; properties: { book_id?: string; share_type: 'book' | 'collection'; include_bookmarks: boolean; include_highlights: boolean; expires_hours: number } }
  | { event: 'share_link_copied'; properties: { share_code: string } }
  | { event: 'share_page_viewed'; properties: { share_code: string; share_type: 'book' | 'collection'; is_authenticated: boolean } }
  | { event: 'shared_book_added_to_library'; properties: { share_code: string; book_id: string } }
  | { event: 'share_converted_to_signup'; properties: { share_code: string } };

// ---- Feature Usage ----
export type FeatureEvent =
  | { event: 'search_performed'; properties: { query: string; results_count: number } }
  | { event: 'collection_created'; properties: { name: string; book_count: number } }
  | { event: 'collection_deleted'; properties: { collection_id: string } }
  | { event: 'book_deleted'; properties: { book_id: string } }
  | { event: 'settings_opened'; properties?: Record<string, unknown> }
  | { event: 'data_exported'; properties?: Record<string, unknown> }
  | { event: 'pwa_install_prompted'; properties?: Record<string, unknown> }
  | { event: 'pwa_installed'; properties?: Record<string, unknown> }
  | { event: 'offline_mode_activated'; properties?: Record<string, unknown> };

// ---- Errors & Performance ----
export type ErrorEvent =
  | { event: 'error_occurred'; properties: { error_type: string; error_message: string; page?: string; component?: string } }
  | { event: 'api_error'; properties: { endpoint: string; status_code: number; error_message: string } }
  | { event: 'file_parse_error'; properties: { file_type: string; error_message: string } };

// Union of all event types
export type AnalyticsEvent =
  | AcquisitionEvent
  | ActivationEvent
  | EngagementEvent
  | RetentionEvent
  | ViralEvent
  | FeatureEvent
  | ErrorEvent;

// =============================================================================
// TRACKING FUNCTIONS
// =============================================================================

/**
 * Track a typed analytics event
 */
export function track<T extends AnalyticsEvent>(eventData: T) {
  if (typeof window === 'undefined') return;

  const { event, properties } = eventData as { event: string; properties?: Record<string, unknown> };

  posthog.capture(event, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track a page view (usually automatic, but can be called manually for SPAs)
 */
export function trackPageView(path?: string) {
  if (typeof window === 'undefined') return;

  posthog.capture('$pageview', {
    $current_url: path || window.location.href,
  });
}

/**
 * Start a timed event (for measuring duration)
 */
const timedEvents: Map<string, number> = new Map();

export function startTimedEvent(eventName: string) {
  timedEvents.set(eventName, Date.now());
}

export function endTimedEvent(eventName: string, properties?: Record<string, unknown>) {
  const startTime = timedEvents.get(eventName);
  if (!startTime) return;

  const durationMs = Date.now() - startTime;
  const durationSeconds = Math.round(durationMs / 1000);

  posthog.capture(eventName, {
    ...properties,
    duration_seconds: durationSeconds,
    duration_ms: durationMs,
  });

  timedEvents.delete(eventName);
}

// =============================================================================
// FUNNEL HELPERS - Pre-built tracking for common flows
// =============================================================================

export const funnels = {
  // Acquisition funnel
  acquisition: {
    landingViewed: (utmParams?: { source?: string; medium?: string; campaign?: string }) => {
      track({
        event: 'landing_page_viewed',
        properties: {
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
          utm_source: utmParams?.source,
          utm_medium: utmParams?.medium,
          utm_campaign: utmParams?.campaign,
        },
      });
    },
    signupStarted: (method: 'email' | 'google' | 'github' = 'email') => {
      track({ event: 'signup_started', properties: { method } });
    },
    signupCompleted: (userId: string, method: 'email' | 'google' | 'github' = 'email') => {
      track({ event: 'signup_completed', properties: { user_id: userId, method } });
      identifyUser(userId);
    },
    loginStarted: (method: 'email' | 'google' | 'github' = 'email') => {
      track({ event: 'login_started', properties: { method } });
    },
    loginCompleted: (userId: string, method: 'email' | 'google' | 'github' = 'email') => {
      track({ event: 'login_completed', properties: { user_id: userId, method } });
      identifyUser(userId);
    },
    loginFailed: (method: 'email' | 'google' | 'github', error: string) => {
      track({ event: 'login_failed', properties: { method, error } });
    },
  },

  // Activation funnel
  activation: {
    libraryViewed: (bookCount: number) => {
      track({ event: 'library_viewed', properties: { book_count: bookCount } });
    },
    uploadStarted: (fileType: string, fileSizeMb: number) => {
      track({ event: 'book_upload_started', properties: { file_type: fileType, file_size_mb: fileSizeMb } });
      startTimedEvent('book_upload');
    },
    uploadCompleted: (bookId: string, title: string, fileType: string, fileSizeMb: number) => {
      endTimedEvent('book_upload');
      track({ event: 'book_upload_completed', properties: { book_id: bookId, title, file_type: fileType, file_size_mb: fileSizeMb } });
    },
    uploadFailed: (fileType: string, error: string) => {
      endTimedEvent('book_upload');
      track({ event: 'book_upload_failed', properties: { file_type: fileType, error } });
    },
    classicSelected: (bookId: string, title: string, author: string) => {
      track({ event: 'classic_book_selected', properties: { book_id: bookId, title, author } });
    },
    firstBookOpened: (bookId: string, bookType: 'uploaded' | 'classic') => {
      track({ event: 'first_book_opened', properties: { book_id: bookId, book_type: bookType } });
    },
  },

  // Engagement funnel
  engagement: {
    bookOpened: (bookId: string, title: string, bookType: 'uploaded' | 'classic', progressPercent: number) => {
      track({ event: 'book_opened', properties: { book_id: bookId, title, book_type: bookType, progress_percent: progressPercent } });
      startTimedEvent(`reading_session_${bookId}`);
    },
    bookClosed: (bookId: string, pagesRead: number, progressPercent: number) => {
      const startTime = timedEvents.get(`reading_session_${bookId}`);
      const sessionMinutes = startTime ? Math.round((Date.now() - startTime) / 60000) : 0;
      track({ event: 'book_closed', properties: { book_id: bookId, reading_session_minutes: sessionMinutes, pages_read: pagesRead, progress_percent: progressPercent } });
      timedEvents.delete(`reading_session_${bookId}`);
    },
    bookmarkCreated: (bookId: string, page?: number) => {
      track({ event: 'bookmark_created', properties: { book_id: bookId, page } });
    },
    highlightCreated: (bookId: string, color: string, textLength: number) => {
      track({ event: 'highlight_created', properties: { book_id: bookId, color, text_length: textLength } });
    },
    noteCreated: (bookId: string, noteLength: number) => {
      track({ event: 'note_created', properties: { book_id: bookId, note_length: noteLength } });
    },
    settingsChanged: (setting: string, value: string | number) => {
      track({ event: 'reader_settings_changed', properties: { setting, value } });
    },
  },

  // Retention funnel
  retention: {
    streakContinued: (streakDay: number) => {
      track({ event: 'streak_continued', properties: { streak_day: streakDay } });
      if ([7, 30, 100, 365].includes(streakDay)) {
        track({ event: 'streak_milestone_reached', properties: { streak_day: streakDay, milestone: streakDay as 7 | 30 | 100 | 365 } });
      }
    },
    streakBroken: (streakLength: number) => {
      track({ event: 'streak_broken', properties: { streak_length: streakLength } });
    },
    dailyGoalAchieved: (minutesRead: number, streakDay: number) => {
      track({ event: 'daily_reading_goal_achieved', properties: { minutes_read: minutesRead, streak_day: streakDay } });
    },
    appOpened: (daysSinceLastOpen?: number) => {
      track({ event: 'app_opened', properties: { days_since_last_open: daysSinceLastOpen } });
    },
  },

  // Viral funnel
  viral: {
    shareInitiated: (bookId: string, shareType: 'book' | 'collection') => {
      track({ event: 'share_initiated', properties: { book_id: bookId, share_type: shareType } });
    },
    shareLinkCreated: (options: { bookId?: string; shareType: 'book' | 'collection'; includeBookmarks: boolean; includeHighlights: boolean; expiresHours: number }) => {
      track({ event: 'share_link_created', properties: { book_id: options.bookId, share_type: options.shareType, include_bookmarks: options.includeBookmarks, include_highlights: options.includeHighlights, expires_hours: options.expiresHours } });
    },
    shareLinkCopied: (shareCode: string) => {
      track({ event: 'share_link_copied', properties: { share_code: shareCode } });
    },
    sharePageViewed: (shareCode: string, shareType: 'book' | 'collection', isAuthenticated: boolean) => {
      track({ event: 'share_page_viewed', properties: { share_code: shareCode, share_type: shareType, is_authenticated: isAuthenticated } });
    },
    sharedBookAdded: (shareCode: string, bookId: string) => {
      track({ event: 'shared_book_added_to_library', properties: { share_code: shareCode, book_id: bookId } });
    },
    shareConvertedToSignup: (shareCode: string) => {
      track({ event: 'share_converted_to_signup', properties: { share_code: shareCode } });
    },
  },
};

// =============================================================================
// FEATURE FLAGS (if using PostHog feature flags)
// =============================================================================

export function isFeatureEnabled(featureKey: string): boolean {
  if (typeof window === 'undefined') return false;
  return posthog.isFeatureEnabled(featureKey) ?? false;
}

export function getFeatureFlag(featureKey: string): string | boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  return posthog.getFeatureFlag(featureKey);
}

// =============================================================================
// A/B TESTING HELPERS
// =============================================================================

export function getExperimentVariant(experimentKey: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const variant = posthog.getFeatureFlag(experimentKey);
  return typeof variant === 'string' ? variant : undefined;
}

// =============================================================================
// DEBUG HELPERS
// =============================================================================

export function enableDebugMode() {
  if (typeof window === 'undefined') return;
  posthog.debug();
}

export function getDistinctId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return posthog.get_distinct_id();
}
