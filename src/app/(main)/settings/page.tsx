'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useReaderStore } from '@/lib/stores/reader-store';
import { useBookStore } from '@/lib/stores/book-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Input, Select, Slider, Toggle } from '@/components/ui';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, updateProfile, signOut } = useAuthStore();
  const { settings, updateSettings, syncSettings, loadSettings } = useReaderStore();
  const { books, fetchBooks } = useBookStore();
  const { theme, setTheme } = useThemeStore();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
    } catch (error) {
      console.error('Export failed:', error);
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
        <div className="container-narrow py-10 md:py-16">
          <div className="mb-10 pb-6 border-b border-[var(--border-primary)]">
            <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-3">
              Preferences
            </p>
            <h1 className="font-[family-name:var(--font-display)] fs-h-lg uppercase">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--text-secondary)]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                  Account
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)] block mb-2">
                    Email
                  </label>
                  <p className="font-[family-name:var(--font-mono)] fs-p-lg">{user?.email}</p>
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
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  {saveSuccess && (
                    <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-primary)]">
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--text-secondary)]">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                </svg>
                <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                  Appearance
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] mb-1">Dark Mode</p>
                    <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)]">
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

            {/* Reader Settings */}
            <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--text-secondary)]">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
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

                <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                  Settings sync across all devices
                </p>
              </div>
            </div>

            {/* Data & Export */}
            <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--text-secondary)]">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                  Data
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 border border-[var(--border-primary)] bg-[var(--bg-primary)]">
                  <div>
                    <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] mb-1">Cloud Sync</p>
                    <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)]">
                      Data syncs automatically
                    </p>
                  </div>
                  <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-primary)] px-2 py-1 border border-[var(--text-primary)]">
                    Active
                  </span>
                </div>

                <div className="p-4 border border-[var(--border-primary)] bg-[var(--bg-primary)]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] mb-1">Export Data</p>
                      <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)]">
                        Download all your data as JSON
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleExportData} disabled={isExporting}>
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)]">
                  <div className="p-4 bg-[var(--bg-primary)] text-center">
                    <p className="font-[family-name:var(--font-display)] fs-h-sm">{books.length}</p>
                    <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">Books</p>
                  </div>
                  <div className="p-4 bg-[var(--bg-primary)] text-center">
                    <p className="font-[family-name:var(--font-display)] fs-h-sm">-</p>
                    <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">Bookmarks</p>
                  </div>
                  <div className="p-4 bg-[var(--bg-primary)] text-center">
                    <p className="font-[family-name:var(--font-display)] fs-h-sm">-</p>
                    <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">Highlights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <div className="border border-[var(--text-primary)] bg-[var(--bg-secondary)]">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] mb-1">Sign Out</p>
                  <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)]">
                    You can sign back in anytime
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={handleSignOut}>
                  Exit
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
