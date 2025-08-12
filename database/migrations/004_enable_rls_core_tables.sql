-- Enable Row Level Security (RLS) on internal tables
-- These tables are only accessed by server-side code using the Supabase service role
-- No public (anon/authenticated) policies are created; service role bypasses RLS

-- Enable RLS (if the table exists)
ALTER TABLE IF EXISTS public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Record migration before enabling RLS on schema_migrations to avoid policy conflicts
INSERT INTO schema_migrations (version, applied_at)
VALUES ('004_enable_rls_core_tables', NOW())
ON CONFLICT (version) DO NOTHING;

-- Finally, enable RLS on the migrations table as well
ALTER TABLE IF EXISTS public.schema_migrations ENABLE ROW LEVEL SECURITY;

-- Completion message
SELECT 'RLS enabled for waitlist, analytics_events, page_views, analytics_sessions, and schema_migrations' AS status;


