-- Analytics Tables Migration
-- Create tables for custom analytics tracking

-- ============================================================================
-- ANALYTICS EVENTS TABLE
-- ============================================================================

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
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100)
);

-- ============================================================================
-- PAGE VIEWS TABLE (Optimized for fast queries)
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_url TEXT NOT NULL,
  page_title TEXT,
  session_id VARCHAR(255),
  user_agent TEXT,
  referrer TEXT,
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),
  duration_seconds INTEGER, -- Time spent on page
  scroll_depth INTEGER -- Max scroll percentage
);

-- ============================================================================
-- ANALYTICS SESSIONS TABLE
-- ============================================================================

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
  country VARCHAR(2),
  city VARCHAR(100),
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100)
);

-- ============================================================================
-- ANALYTICS INDEXES
-- ============================================================================

-- Analytics Events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_url ON analytics_events(page_url);

-- Page Views indexes
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_date_page ON page_views(DATE(created_at), page_url);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at ON analytics_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_utm_source ON analytics_sessions(utm_source);

-- ============================================================================
-- ANALYTICS VIEWS FOR REPORTING
-- ============================================================================

-- Daily page view stats
CREATE OR REPLACE VIEW daily_page_stats AS
SELECT 
    DATE(created_at) as date,
    page_url,
    COUNT(*) as page_views,
    COUNT(DISTINCT session_id) as unique_visitors
FROM page_views
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at), page_url
ORDER BY date DESC, page_views DESC;

-- Top pages by views
CREATE OR REPLACE VIEW top_pages AS
SELECT 
    page_url,
    page_title,
    COUNT(*) as total_views,
    COUNT(DISTINCT session_id) as unique_visitors,
    AVG(duration_seconds) as avg_duration,
    AVG(scroll_depth) as avg_scroll_depth
FROM page_views
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY page_url, page_title
ORDER BY total_views DESC
LIMIT 50;

-- Traffic sources
CREATE OR REPLACE VIEW traffic_sources AS
SELECT 
    COALESCE(utm_source, 'direct') as source,
    COALESCE(utm_medium, 'none') as medium,
    COALESCE(utm_campaign, 'none') as campaign,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(*) as total_page_views
FROM analytics_sessions s
LEFT JOIN page_views pv ON s.session_id = pv.session_id
WHERE s.created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source, utm_medium, utm_campaign
ORDER BY sessions DESC;

-- Form submission analytics
CREATE OR REPLACE VIEW form_submission_stats AS
SELECT 
    (metadata->>'form_name')::text as form_name,
    COUNT(*) as submissions,
    COUNT(DISTINCT session_id) as unique_submitters,
    DATE(created_at) as date
FROM analytics_events
WHERE event_type = 'form_submission'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY (metadata->>'form_name')::text, DATE(created_at)
ORDER BY date DESC, submissions DESC;

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================

-- Log the migration completion
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('002_create_analytics_tables', NOW())
ON CONFLICT (version) DO NOTHING;

-- Output completion message
SELECT 'Analytics tables created successfully!' as status;