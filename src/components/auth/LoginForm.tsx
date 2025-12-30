'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button, Input } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

export function LoginForm() {
  const router = useRouter();
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/library');
    }
  };

  return (
    <div className="w-full max-w-md border border-[var(--border-primary)] bg-[var(--bg-window)] shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
      {/* Window Titlebar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-titlebar)] border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          <PixelIcon name="user" size={14} className="text-[var(--text-secondary)]" />
          <span className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.05em] text-[var(--text-secondary)]">
            Login
          </span>
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 border border-[var(--border-primary)]"></div>
          <div className="w-3 h-3 border border-[var(--border-primary)]"></div>
          <div className="w-3 h-3 border border-[var(--border-primary)]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center">
            <PixelIcon name="user" size={24} className="text-[var(--bg-primary)]" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-1">
              Welcome back
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl uppercase">Login</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
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
            placeholder="Enter your password"
            required
            fullWidth
          />

          {error && (
            <div className="p-3 border border-[var(--text-primary)] bg-[var(--bg-secondary)]">
              <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.02em] text-[var(--text-primary)]">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border-primary)]">
          <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.02em] text-center text-[var(--text-secondary)]">
            No account?{' '}
            <Link href="/signup" className="text-[var(--text-primary)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
