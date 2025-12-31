'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useReaderStore } from '@/lib/stores/reader-store';
import { useBookStore } from '@/lib/stores/book-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Input, Select, Slider, Toggle } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, updateProfile, signOut } = useAuthStore();
  const { settings, updateSettings, syncSettings, loadSettings } = useReaderStore();
  const { books, fetchBooks } = useBookStore();
  const { theme, setTheme } = useThemeStore();
  const {
    enabled: notificationsEnabled,
    dailyReminder,
    reminderTime,
    permission,
    isSupported: notificationsSupported,
    setEnabled: setNotificationsEnabled,
    setDailyReminder,
    setReminderTime,
    requestPermission,
  } = useNotificationStore();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleEnableNotifications = async () => {
    if (permission === 'granted') {
      setNotificationsEnabled(!notificationsEnabled);
    } else {
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
      }
    }
  };

  useEffect(() => {
    loadSettings();
    fetchBooks();
  }, [loadSettings, fetchBooks]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  const handleProfileSave = async () => {
    setIsSaving(true);
    await updateProfile({ display_name: displayName || null });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReaderSettingChange = (key: string, value: string | number) => {
    updateSettings({ [key]: value });
    syncSettings();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);

    try {
      const supabase = createClient();

      const [bookmarksRes, highlightsRes, progressRes, settingsRes] = await Promise.all([
        supabase.from('bookmarks').select('*').eq('user_id', user.id),
        supabase.from('highlights').select('*').eq('user_id', user.id),
        supabase.from('reading_progress').select('*').eq('user_id', user.id),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          email: user.email,
          displayName: profile?.display_name,
        },
        books: books.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          fileType: book.file_type,
          fileSize: book.file_size,
          createdAt: book.created_at,
        })),
        bookmarks: bookmarksRes.data || [],
        highlights: highlightsRes.data || [],
        readingProgress: progressRes.data || [],
        settings: settingsRes.data || settings,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ultrabooks-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch {
      // Export failed
    } finally {
      setIsExporting(false);
    }
  };

  const fontOptions = [
    { value: 'Georgia', label: 'Georgia (Serif)' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Arial', label: 'Arial (Sans)' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New (Mono)' },
  ];

  const readerThemeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'sepia', label: 'Sepia' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1">
        <div className="container-narrow py-10 md:py-14">
          {/* Page Header */}
          <div className="mb-8 md:mb-10 pb-6 border-b border-[var(--border-primary)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center flex-shrink-0">
                <PixelIcon name="settings" size={24} className="text-[var(--bg-primary)]" />
              </div>
              <div>
                <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2">
                  Preferences
                </p>
                <h1 className="font-display text-[28px] md:text-[36px] uppercase leading-[0.9]">
                  Settings
                </h1>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 px-5 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <div className="w-8 h-8 border border-[var(--border-primary)] flex items-center justify-center">
                  <PixelIcon name="user" size={14} className="text-[var(--text-secondary)]" />
                </div>
                <span className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                  Account
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)] block mb-2">
                    Email
                  </label>
                  <p className="font-mono fs-p-lg text-[var(--text-primary)]">{user?.email}</p>
                </div>

                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  fullWidth
                />

                <div className="flex items-center gap-3">
                  <Button onClick={handleProfileSave} disabled={isSaving} size="sm">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {saveSuccess && (
                    <span className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-primary)] flex items-center gap-2">
                      <PixelIcon name="check" size={12} />
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 px-5 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <div className="w-8 h-8 border border-[var(--border-primary)] flex items-center justify-center">
                  <PixelIcon name="sun" size={14} className="text-[var(--text-secondary)]" />
                </div>
                <span className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                  Appearance
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-ui fs-p-lg mb-1">Dark Mode</p>
                    <p className="font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-[0.05em]">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <Toggle
                    checked={theme === 'dark'}
                    onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            {notificationsSupported && (
              <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3 px-5 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                  <div className="w-8 h-8 border border-[var(--border-primary)] flex items-center justify-center">
                    <PixelIcon name="bell" size={14} className="text-[var(--text-secondary)]" />
                  </div>
                  <span className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                    Notifications
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-ui fs-p-lg mb-1">Enable Notifications</p>
                      <p className="font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-[0.05em]">
                        {permission === 'denied'
                          ? 'Notifications blocked in browser'
                          : 'Get reminders to keep your streak'}
                      </p>
                    </div>
                    <Toggle
                      checked={notificationsEnabled && permission === 'granted'}
                      onChange={handleEnableNotifications}
                      disabled={permission === 'denied'}
                    />
                  </div>

                  {notificationsEnabled && permission === 'granted' && (
                    <>
                      <div className="h-px bg-[var(--border-primary)]" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-ui fs-p-lg mb-1">Daily Reminder</p>
                          <p className="font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-[0.05em]">
                            Remind me to read if I haven&apos;t today
                          </p>
                        </div>
                        <Toggle
                          checked={dailyReminder}
                          onChange={setDailyReminder}
                        />
                      </div>

                      {dailyReminder && (
                        <div>
                          <label className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)] block mb-2">
                            Reminder Time
                          </label>
                          <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full max-w-[180px] px-4 py-3 font-mono fs-p-lg bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Reader Settings */}
            <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 px-5 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <div className="w-8 h-8 border border-[var(--border-primary)] flex items-center justify-center">
                  <PixelIcon name="book" size={14} className="text-[var(--text-secondary)]" />
                </div>
                <span className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                  Reader
                </span>
              </div>

              <div className="p-6 space-y-6">
                <Select
                  label="Reader Theme"
                  options={readerThemeOptions}
                  value={settings.theme}
                  onChange={(e) => handleReaderSettingChange('theme', e.target.value)}
                  fullWidth
                />

                <Select
                  label="Font Family"
                  options={fontOptions}
                  value={settings.fontFamily}
                  onChange={(e) => handleReaderSettingChange('fontFamily', e.target.value)}
                  fullWidth
                />

                <Slider
                  label="Font Size"
                  min={12}
                  max={32}
                  step={1}
                  value={settings.fontSize}
                  onChange={(e) => handleReaderSettingChange('fontSize', Number(e.target.value))}
                  showValue
                  fullWidth
                />

                <Slider
                  label="Line Height"
                  min={1.2}
                  max={2.5}
                  step={0.1}
                  value={settings.lineHeight}
                  onChange={(e) => handleReaderSettingChange('lineHeight', Number(e.target.value))}
                  showValue
                  fullWidth
                />

                <Slider
                  label="Margins"
                  min={0}
                  max={100}
                  step={5}
                  value={settings.margins}
                  onChange={(e) => handleReaderSettingChange('margins', Number(e.target.value))}
                  showValue
                  fullWidth
                />

                <div className="flex items-center gap-2 pt-2">
                  <PixelIcon name="refresh" size={12} className="text-[var(--text-tertiary)]" />
                  <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                    Settings sync across all devices
                  </p>
                </div>
              </div>
            </div>

            {/* Data & Export */}
            <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 px-5 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <div className="w-8 h-8 border border-[var(--border-primary)] flex items-center justify-center">
                  <PixelIcon name="download" size={14} className="text-[var(--text-secondary)]" />
                </div>
                <span className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                  Data
                </span>
              </div>

              <div className="p-6 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)]">
                  <div className="p-4 bg-[var(--bg-primary)] text-center">
                    <p className="font-display text-[24px] md:text-[28px] mb-1">{books.length}</p>
                    <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Books</p>
                  </div>
                  <div className="p-4 bg-[var(--bg-primary)] text-center">
                    <p className="font-display text-[24px] md:text-[28px] mb-1">-</p>
                    <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Bookmarks</p>
                  </div>
                  <div className="p-4 bg-[var(--bg-primary)] text-center">
                    <p className="font-display text-[24px] md:text-[28px] mb-1">-</p>
                    <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Highlights</p>
                  </div>
                </div>

                {/* Cloud Sync */}
                <div className="flex items-center justify-between p-4 border border-[var(--border-primary)] bg-[var(--bg-primary)]">
                  <div className="flex items-center gap-3">
                    <PixelIcon name="cloud" size={16} className="text-[var(--text-secondary)]" />
                    <div>
                      <p className="font-ui fs-p-lg">Cloud Sync</p>
                      <p className="font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-[0.05em]">
                        Data syncs automatically
                      </p>
                    </div>
                  </div>
                  <span className="font-mono fs-p-sm px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg-primary)]">
                    ACTIVE
                  </span>
                </div>

                {/* Export */}
                <div className="p-4 border border-[var(--border-primary)] bg-[var(--bg-primary)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-ui fs-p-lg mb-1">Export Data</p>
                      <p className="font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-[0.05em]">
                        Download all your data as JSON
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {exportSuccess && (
                        <span className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-primary)] flex items-center gap-1">
                          <PixelIcon name="check" size={12} />
                          Done
                        </span>
                      )}
                      <Button variant="secondary" size="sm" onClick={handleExportData} disabled={isExporting}>
                        <PixelIcon name="download" size={12} className="mr-2" />
                        {isExporting ? 'Exporting...' : 'Export'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <div className="border-2 border-[var(--text-primary)] bg-[var(--bg-secondary)]">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PixelIcon name="log-out" size={18} className="text-[var(--text-secondary)]" />
                  <div>
                    <p className="font-ui fs-p-lg">Sign Out</p>
                    <p className="font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-[0.05em]">
                      You can sign back in anytime
                    </p>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
