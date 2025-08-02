// Analytics utilities for tracking page views and events

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

// Google Analytics tracking functions
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: url,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track form submissions
export const trackFormSubmission = (formName: string, source?: string) => {
  trackEvent('form_submit', 'engagement', formName);
  
  // Also track in our custom analytics
  trackCustomEvent('form_submission', {
    form_name: formName,
    source: source,
  });
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('click', 'engagement', `${buttonName}_${location}`);
  
  // Also track in our custom analytics
  trackCustomEvent('button_click', {
    button_name: buttonName,
    location: location,
  });
};

// Custom analytics for our database
export interface AnalyticsEvent {
  event_type: string;
  page_url?: string;
  page_title?: string;
  user_agent?: string;
  referrer?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}

// Track custom events in our database
export const trackCustomEvent = async (eventType: string, metadata?: Record<string, unknown>) => {
  try {
    const event: AnalyticsEvent = {
      event_type: eventType,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      page_title: typeof window !== 'undefined' ? document.title : undefined,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      session_id: getSessionId(),
      metadata: metadata,
    };

    console.log('📊 Sending analytics event:', eventType, event.page_url);
    
    // Send to our analytics API
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Analytics event tracked:', result);
    
  } catch (error) {
    console.warn('❌ Failed to track custom event:', error);
  }
};

// Track page views in our database
export const trackCustomPageView = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('📊 Custom analytics: Tracking page view');
    await trackCustomEvent('page_view', {
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    });
    console.log('✅ Custom analytics: Page view tracked successfully');
  } catch (error) {
    console.error('❌ Custom analytics error:', error);
  }
};

// Get or generate session ID
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Analytics data fetching functions for admin dashboard
export interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: Array<{ page: string; views: number }>;
  formSubmissions: Array<{ form: string; count: number }>;
  recentActivity: Array<{ event_type: string; created_at: string; page_url: string }>;
  dailyStats: Array<{ date: string; page_views: number; unique_visitors: number }>;
}

export const getAnalyticsData = async (days: number = 30): Promise<AnalyticsData> => {
  const response = await fetch(`/api/analytics/dashboard?days=${days}`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }
  return response.json();
};