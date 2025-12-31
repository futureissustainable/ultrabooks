/**
 * Scroll lock utility with reference counting
 * Prevents conflicts when multiple components try to lock scroll
 */

let lockCount = 0;
let originalOverflow = '';

export function lockScroll() {
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

export function unlockScroll() {
  lockCount--;
  if (lockCount <= 0) {
    lockCount = 0;
    document.body.style.overflow = originalOverflow;
  }
}

/**
 * React hook for scroll locking
 * Automatically manages lock/unlock on mount/unmount
 */
import { useEffect } from 'react';

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isLocked]);
}
