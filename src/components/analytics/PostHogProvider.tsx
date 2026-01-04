'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackPageView, identifyUser, funnels } from '@/lib/analytics';
import { useAuthStore } from '@/lib/stores/auth-store';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const initialized = useRef(false);
  const lastPathname = useRef<string>('');

  // Initialize PostHog once on mount
  useEffect(() => {
    if (!initialized.current) {
      initAnalytics();
      initialized.current = true;

      // Track initial page load with UTM params
      const utmSource = searchParams.get('utm_source') || undefined;
      const utmMedium = searchParams.get('utm_medium') || undefined;
      const utmCampaign = searchParams.get('utm_campaign') || undefined;

      if (pathname === '/') {
        funnels.acquisition.landingViewed({
          source: utmSource,
          medium: utmMedium,
          campaign: utmCampaign,
        });
      }
    }
  }, [pathname, searchParams]);

  // Track page views on route change
  useEffect(() => {
    if (pathname && pathname !== lastPathname.current) {
      trackPageView(pathname);
      lastPathname.current = pathname;
    }
  }, [pathname]);

  // Identify user when they log in
  useEffect(() => {
    if (user?.id) {
      identifyUser(user.id, {
        email: user.email || undefined,
      });
    }
  }, [user?.id, user?.email]);

  return <>{children}</>;
}
