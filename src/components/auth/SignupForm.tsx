'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button, Input } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

export function SignupForm() {
  const { signUp, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await signUp(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--text-primary)] flex items-center justify-center">
              <PixelIcon name="check" size={20} className="text-[var(--bg-primary)]" />
            </div>
            <div>
              <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide text-[var(--text-secondary)]">
                Almost done
              </p>
              <h1 className="font-[family-name:var(--font-display)] fs-h-sm uppercase">Check Email</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)] mb-6 leading-relaxed">
            We&apos;ve sent you a confirmation email. Please check your inbox and click the
            link to verify your account.
          </p>

          <Link href="/login">
            <Button fullWidth>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--text-primary)] flex items-center justify-center">
            <PixelIcon name="plus" size={20} className="text-[var(--bg-primary)]" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide text-[var(--text-secondary)]">
              Get started
            </p>
            <h1 className="font-[family-name:var(--font-display)] fs-h-sm uppercase">Sign Up</h1>
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
            placeholder="At least 6 characters"
            required
            fullWidth
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            fullWidth
          />

          {error && (
            <div className="p-3 border border-[var(--text-primary)] bg-[var(--bg-primary)]">
              <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-primary)]">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
          <p className="font-[family-name:var(--font-ui)] fs-p-lg text-center text-[var(--text-secondary)]">
            Have an account?{' '}
            <Link href="/login" className="text-[var(--text-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
