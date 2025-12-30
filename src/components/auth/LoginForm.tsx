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
    <div className="w-full max-w-md border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--text-primary)] flex items-center justify-center">
            <PixelIcon name="user" size={20} className="text-[var(--bg-primary)]" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide text-[var(--text-secondary)]">
              Welcome back
            </p>
            <h1 className="font-[family-name:var(--font-display)] fs-h-sm uppercase">Login</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
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
            <div className="p-3 border border-[var(--text-primary)] bg-[var(--bg-primary)]">
              <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-primary)]">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
          <p className="font-[family-name:var(--font-ui)] fs-p-lg text-center text-[var(--text-secondary)]">
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
