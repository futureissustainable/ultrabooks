'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Input } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

export default function ClubsPage() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1">
        <div className="container-page py-10 md:py-14">
          {/* Page Header */}
          <div className="mb-8 md:mb-10 pb-6 border-b border-[var(--border-primary)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center flex-shrink-0">
                <PixelIcon name="users" size={24} className="text-[var(--bg-primary)]" />
              </div>
              <div>
                <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2">
                  Coming Soon
                </p>
                <h1 className="font-display text-[28px] md:text-[36px] uppercase leading-[0.9]">
                  Book Clubs
                </h1>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] mb-8">
            <div className="p-8 md:p-12 text-center">
              <p className="font-ui fs-p-lg text-[var(--text-secondary)] max-w-lg mx-auto mb-10 leading-relaxed">
                Read together with friends. Share progress, discuss chapters, and stay accountable with group reading goals.
              </p>

              {/* Features Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)] mb-10 max-w-2xl mx-auto">
                <div className="bg-[var(--bg-primary)] p-6 text-center group hover:bg-[var(--bg-tertiary)] transition-colors">
                  <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 group-hover:border-[var(--text-primary)] transition-colors">
                    <PixelIcon name="share" size={20} className="text-[var(--text-secondary)]" />
                  </div>
                  <h3 className="font-ui fs-p-sm uppercase tracking-[0.1em] mb-2">
                    Shared Progress
                  </h3>
                  <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">
                    See where everyone is in the book
                  </p>
                </div>
                <div className="bg-[var(--bg-primary)] p-6 text-center group hover:bg-[var(--bg-tertiary)] transition-colors">
                  <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 group-hover:border-[var(--text-primary)] transition-colors">
                    <PixelIcon name="message-circle" size={20} className="text-[var(--text-secondary)]" />
                  </div>
                  <h3 className="font-ui fs-p-sm uppercase tracking-[0.1em] mb-2">
                    Discussions
                  </h3>
                  <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">
                    Comment and discuss passages
                  </p>
                </div>
                <div className="bg-[var(--bg-primary)] p-6 text-center group hover:bg-[var(--bg-tertiary)] transition-colors">
                  <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4 group-hover:border-[var(--text-primary)] transition-colors">
                    <PixelIcon name="calendar" size={20} className="text-[var(--text-secondary)]" />
                  </div>
                  <h3 className="font-ui fs-p-sm uppercase tracking-[0.1em] mb-2">
                    Reading Pace
                  </h3>
                  <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">
                    Set group reading schedules
                  </p>
                </div>
              </div>

              {/* Email Signup */}
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                  <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-4">
                    Get notified when Book Clubs launches
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit" className="w-full sm:w-auto btn-shine">
                      <PixelIcon name="bell" size={12} className="mr-2" />
                      Notify Me
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="max-w-md mx-auto p-4 border-2 border-[var(--text-primary)] bg-[var(--bg-primary)]">
                  <div className="flex items-center gap-3 justify-center">
                    <PixelIcon name="check" size={18} className="text-[var(--text-primary)]" />
                    <span className="font-ui fs-p-sm uppercase tracking-[0.1em]">
                      You&apos;ll be notified when we launch!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)]">
            <div className="bg-[var(--bg-secondary)] p-6 md:p-8 group hover:bg-[var(--bg-tertiary)] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-[var(--border-primary)] flex items-center justify-center group-hover:border-[var(--text-primary)] transition-colors">
                  <PixelIcon name="link" size={16} className="text-[var(--text-secondary)]" />
                </div>
                <h2 className="font-ui fs-p-lg uppercase tracking-[0.05em]">
                  Invite Friends
                </h2>
              </div>
              <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed">
                Create a club and share an invite link. Anyone with the link can join and start reading together.
              </p>
            </div>
            <div className="bg-[var(--bg-secondary)] p-6 md:p-8 group hover:bg-[var(--bg-tertiary)] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-[var(--border-primary)] flex items-center justify-center group-hover:border-[var(--text-primary)] transition-colors">
                  <PixelIcon name="fire" size={16} className="text-[var(--text-secondary)]" />
                </div>
                <h2 className="font-ui fs-p-lg uppercase tracking-[0.05em]">
                  Group Streaks
                </h2>
              </div>
              <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed">
                Keep each other accountable with group reading streaks. See who&apos;s reading and who needs encouragement.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
