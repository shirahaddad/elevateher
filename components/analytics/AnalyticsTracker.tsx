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
    try {
      // Track page view on route changes
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      
      console.log('📊 Analytics: Tracking page view for:', url);
      
      // Track with Google Analytics
      trackPageView(url);
      
      // Track with our custom analytics
      trackCustomPageView();
    } catch (error) {
      console.error('❌ Analytics tracking error:', error);
    }
  }, [pathname, searchParams]);

  // Add a marker so we can check if component is loaded
  return <div data-analytics-tracker="true" style={{ display: 'none' }} />;
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