'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button, Input } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

export function SignupForm() {
  const router = useRouter();
  const { user, signUp, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/library');
    }
  }, [user, router]);

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
      <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center">
              <PixelIcon name="check" size={20} className="text-[var(--bg-primary)]" />
            </div>
            <div>
              <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1">
                Almost done
              </p>
              <h1 className="font-display fs-h-sm uppercase leading-none">Check Email</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] mb-6">
            <div className="flex items-start gap-3">
              <PixelIcon name="mail" size={16} className="text-[var(--text-secondary)] flex-shrink-0 mt-0.5" />
              <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed">
                We&apos;ve sent you a confirmation email. Please check your inbox and click the
                link to verify your account.
              </p>
            </div>
          </div>

          <Link href="/login">
            <Button fullWidth className="btn-shine">
              <PixelIcon name="arrow-right" size={14} className="mr-2" />
              Continue to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center">
            <PixelIcon name="user-plus" size={20} className="text-[var(--bg-primary)]" />
          </div>
          <div>
            <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1">
              Get started free
            </p>
            <h1 className="font-display fs-h-sm uppercase leading-none">Create Account</h1>
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
            placeholder="At least 6 characters"
            required
            fullWidth
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Features */}
        <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2">
              <PixelIcon name="check" size={12} className="text-[var(--text-secondary)]" />
              <span className="font-ui fs-p-sm text-[var(--text-tertiary)]">Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <PixelIcon name="check" size={12} className="text-[var(--text-secondary)]" />
              <span className="font-ui fs-p-sm text-[var(--text-tertiary)]">Cloud sync</span>
            </div>
            <div className="flex items-center gap-2">
              <PixelIcon name="check" size={12} className="text-[var(--text-secondary)]" />
              <span className="font-ui fs-p-sm text-[var(--text-tertiary)]">All formats</span>
            </div>
            <div className="flex items-center gap-2">
              <PixelIcon name="check" size={12} className="text-[var(--text-secondary)]" />
              <span className="font-ui fs-p-sm text-[var(--text-tertiary)]">No ads</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-[0.1em]">
              Already have an account?
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-3 font-ui fs-p-lg text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] px-4 py-2 border border-[var(--border-primary)] hover:border-[var(--text-primary)] transition-all"
            >
              <PixelIcon name="log-in" size={14} />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
