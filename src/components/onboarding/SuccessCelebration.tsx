'use client';

import { useEffect, useState, useCallback } from 'react';
import { create } from 'zustand';
import { clsx } from 'clsx';

/**
 * Success Celebration System
 *
 * Psychology principles:
 * - Variable Rewards: Unexpected celebrations create dopamine
 * - Peak-End Rule: End positive experiences with celebration
 * - Social reinforcement: Visual feedback validates actions
 */

// Celebration types
export type CelebrationType =
  | 'milestone'
  | 'first_book'
  | 'first_highlight'
  | 'streak'
  | 'upload_complete';

interface CelebrationConfig {
  emoji: string;
  title: string;
  subtitle?: string;
  duration?: number;
}

const celebrationConfigs: Record<CelebrationType, CelebrationConfig> = {
  milestone: {
    emoji: '🎯',
    title: 'Milestone Complete!',
    duration: 2500,
  },
  first_book: {
    emoji: '📚',
    title: 'Your Library Begins!',
    subtitle: 'First book added successfully',
    duration: 3000,
  },
  first_highlight: {
    emoji: '✨',
    title: 'First Highlight!',
    subtitle: 'Save your favorite passages',
    duration: 2500,
  },
  streak: {
    emoji: '🔥',
    title: 'Streak Extended!',
    duration: 2000,
  },
  upload_complete: {
    emoji: '✅',
    title: 'Upload Complete!',
    duration: 2000,
  },
};

// Celebration store for global access
interface CelebrationState {
  isVisible: boolean;
  type: CelebrationType | null;
  celebrate: (type: CelebrationType) => void;
  hide: () => void;
}

export const useCelebrationStore = create<CelebrationState>((set) => ({
  isVisible: false,
  type: null,
  celebrate: (type) => set({ isVisible: true, type }),
  hide: () => set({ isVisible: false, type: null }),
}));

// Simple confetti particle
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
}

const COLORS = [
  'var(--text-primary)',
  'var(--accent-primary)',
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
];

export function SuccessCelebration() {
  const { isVisible, type, hide } = useCelebrationStore();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isExiting, setIsExiting] = useState(false);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 40,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        angle: (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.5,
        velocity: 3 + Math.random() * 4,
      });
    }
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (isVisible && type) {
      createParticles();
      setIsExiting(false);

      const config = celebrationConfigs[type];
      const duration = config.duration || 2500;

      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, duration - 300);

      const hideTimer = setTimeout(() => {
        hide();
        setParticles([]);
      }, duration);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isVisible, type, hide, createParticles]);

  if (!isVisible || !type) return null;

  const config = celebrationConfigs[type];

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-confetti"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              transform: `rotate(${particle.angle * 57}deg)`,
              '--confetti-angle': `${particle.angle}rad`,
              '--confetti-velocity': particle.velocity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Toast */}
      <div
        className={clsx(
          'bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[5px]',
          'px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          'flex items-center gap-4',
          isExiting ? 'animate-toast-exit' : 'animate-toast-enter'
        )}
      >
        <span className="text-3xl">{config.emoji}</span>
        <div>
          <p className="font-display fs-h-sm uppercase tracking-tight">
            {config.title}
          </p>
          {config.subtitle && (
            <p className="font-ui fs-p-sm text-[var(--text-secondary)] mt-0.5">
              {config.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Convenience hook
export function useCelebrate() {
  const celebrate = useCelebrationStore((s) => s.celebrate);
  return celebrate;
}
