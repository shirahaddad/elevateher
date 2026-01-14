-- Workshops Tables Migration (Part 2/2)
-- Create workshop_resources table and indexes

-- ============================================================================
-- WORKSHOP RESOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workshop_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workshop_resources_workshop_id ON public.workshop_resources(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_resources_created_at ON public.workshop_resources(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS public.workshop_resources ENABLE ROW LEVEL SECURITY;

-- (Optional) Note: Policies are intentionally omitted.
-- Admin endpoints use the service role (bypasses RLS).
-- Public access to actual files is via S3 presigned URLs.

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================
INSERT INTO schema_migrations (version, applied_at)
VALUES ('014_create_workshop_resources', NOW())
ON CONFLICT (version) DO NOTHING;

SELECT 'Workshop resources table created successfully' AS status;

