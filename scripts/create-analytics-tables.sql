-- Simple SQL script to create analytics tables manually
-- Run this in your Supabase SQL editor if the automated script doesn't work

-- Analytics Events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  page_url TEXT,
  page_title TEXT,
  user_agent TEXT,
  referrer TEXT,
  session_id VARCHAR(255),
  metadata JSONB,
  ip_address INET
);

-- Page Views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_url TEXT NOT NULL,
  page_title TEXT,
  session_id VARCHAR(255),
  user_agent TEXT,
  referrer TEXT,
  ip_address INET,
  duration_seconds INTEGER,
  scroll_depth INTEGER
);

-- Analytics Sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_page TEXT,
  last_page TEXT,
  page_count INTEGER DEFAULT 1,
  total_duration_seconds INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at ON analytics_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);

-- Create helper functions
CREATE OR REPLACE FUNCTION get_top_pages(days_back integer DEFAULT 30)
RETURNS TABLE(page text, views bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    page_url::text as page,
    COUNT(*)::bigint as views
  FROM page_views
  WHERE created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY page_url
  ORDER BY views DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_daily_stats(days_back integer DEFAULT 30)
RETURNS TABLE(date date, page_views bigint, unique_visitors bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(*)::bigint as page_views,
    COUNT(DISTINCT session_id)::bigint as unique_visitors
  FROM page_views
  WHERE created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;