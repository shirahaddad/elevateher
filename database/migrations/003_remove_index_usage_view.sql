-- Remove index usage statistics view
-- This migration drops the public.index_usage_stats view which can trigger
-- SECURITY DEFINER warnings in Supabase and is not used by the application.

DROP VIEW IF EXISTS public.index_usage_stats;

-- Log the migration completion
INSERT INTO schema_migrations (version, applied_at)
VALUES ('003_remove_index_usage_view', NOW())
ON CONFLICT (version) DO NOTHING;

-- Output completion message
SELECT 'Removed public.index_usage_stats view' AS status;


