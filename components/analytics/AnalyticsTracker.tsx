'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackCustomPageView, trackPageView } from '@/lib/analytics';
import { Suspense } from 'react';

// Client-side analytics tracker component implementation
function AnalyticsTrackerImplementation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view on route changes
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track with Google Analytics
    trackPageView(url);
    
    // Track with our custom analytics
    trackCustomPageView();
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}

// Wrapper component with Suspense boundary
export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerImplementation />
    </Suspense>
  );
}

// Hook for tracking events in components
export const useAnalytics = () => {
  return {
    trackEvent: (action: string, category: string, label?: string, value?: number) => {
      if (typeof window !== 'undefined') {
        import('@/lib/analytics').then(({ trackEvent }) => {
          trackEvent(action, category, label, value);
        });
      }
    },
    trackFormSubmission: (formName: string, source?: string) => {
      if (typeof window !== 'undefined') {
        import('@/lib/analytics').then(({ trackFormSubmission }) => {
          trackFormSubmission(formName, source);
        });
      }
    },
    trackButtonClick: (buttonName: string, location: string) => {
      if (typeof window !== 'undefined') {
        import('@/lib/analytics').then(({ trackButtonClick }) => {
          trackButtonClick(buttonName, location);
        });
      }
    },
  };
};