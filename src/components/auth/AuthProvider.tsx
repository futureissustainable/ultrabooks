'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, isLoading } = useAuthStore();
  const [supabaseReady, setSupabaseReady] = useState<boolean | null>(null);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setSupabaseReady(configured);

    if (configured) {
      initialize();
    }
  }, [initialize]);

  // Still checking configuration
  if (supabaseReady === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="font-ui fs-p-lg uppercase tracking-wide animate-pulse-brutal">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Supabase not configured - show setup instructions
  if (!supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        <div className="max-w-lg w-full border-2 border-[var(--border-primary)] p-6 shadow-[8px_8px_0_var(--border-primary)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[var(--color-accent)] flex items-center justify-center">
              <PixelIcon name="settings" size={28} className="text-white" />
            </div>
            <h1 className="font-display fs-h-lg uppercase">Setup Required</h1>
          </div>

          <p className="font-ui fs-p-lg text-[var(--text-secondary)] mb-6">
            ULTRABOOKS needs Supabase to store your books, reading progress, and sync data across devices.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
              <p className="font-ui fs-p-sm uppercase text-[var(--text-tertiary)] mb-1">Step 1</p>
              <p className="font-ui fs-p-lg">Create a free Supabase project at supabase.com</p>
            </div>

            <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
              <p className="font-ui fs-p-sm uppercase text-[var(--text-tertiary)] mb-1">Step 2</p>
              <p className="font-ui fs-p-lg">Run the SQL schema from <code className="font-mono bg-[var(--bg-tertiary)] px-1">supabase/schema.sql</code></p>
            </div>

            <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
              <p className="font-ui fs-p-sm uppercase text-[var(--text-tertiary)] mb-1">Step 3</p>
              <p className="font-ui fs-p-lg">Add environment variables in Vercel:</p>
              <code className="font-mono fs-p-sm block mt-2 p-2 bg-[var(--bg-tertiary)]">
                NEXT_PUBLIC_SUPABASE_URL<br/>
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
            </div>

            <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
              <p className="font-ui fs-p-sm uppercase text-[var(--text-tertiary)] mb-1">Step 4</p>
              <p className="font-ui fs-p-lg">Create a storage bucket named &quot;books&quot; (public)</p>
            </div>
          </div>

          <p className="font-mono fs-p-sm text-[var(--text-tertiary)]">
            Find these in: Supabase Dashboard → Settings → API
          </p>
        </div>
      </div>
    );
  }

  // Supabase configured, waiting for auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="font-ui fs-p-lg uppercase tracking-wide animate-pulse-brutal">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
