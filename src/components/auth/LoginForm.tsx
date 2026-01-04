'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button, Input } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { funnels } from '@/lib/analytics';

export function LoginForm() {
  const router = useRouter();
  const { user, signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/library');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Track login attempt
    funnels.acquisition.loginStarted('email');

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      funnels.acquisition.loginFailed('email', result.error);
    } else if (result.user) {
      funnels.acquisition.loginCompleted(result.user.id, 'email');
      router.push('/library');
    }
  };

  return (
    <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center">
            <PixelIcon name="log-in" size={20} className="text-[var(--bg-primary)]" />
          </div>
          <div>
            <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1">
              Welcome back
            </p>
            <h1 className="font-display fs-h-sm uppercase leading-none">Sign In</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            fullWidth
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            fullWidth
          />

          {error && (
            <div className="p-4 border-2 border-[var(--text-primary)] bg-[var(--bg-primary)] flex items-start gap-3">
              <PixelIcon name="alert-circle" size={16} className="text-[var(--text-primary)] flex-shrink-0 mt-0.5" />
              <p className="font-ui fs-p-sm text-[var(--text-primary)] uppercase tracking-[0.05em]">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth disabled={isLoading} className="btn-shine">
            <PixelIcon name="arrow-right" size={14} className="mr-2" />
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-[var(--border-primary)] text-center">
          <p className="font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-[0.1em]">
            Don&apos;t have an account?
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 mt-3 font-ui fs-p-lg text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] px-4 py-2 border border-[var(--border-primary)] hover:border-[var(--text-primary)] transition-all"
          >
            <PixelIcon name="user-plus" size={14} />
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
