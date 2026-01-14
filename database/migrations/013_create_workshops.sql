-- Workshops Tables Migration (Part 1/2)
-- Create base table for workshops with status enum and indexes

-- ============================================================================
-- ENUM TYPE: workshop_status
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workshop_status') THEN
    CREATE TYPE workshop_status AS ENUM ('NEXT', 'FUTURE', 'PAST');
  END IF;
END
$$;

-- ============================================================================
-- WORKSHOPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  content_md TEXT,
  start_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  registration_url TEXT,
  status workshop_status NOT NULL DEFAULT 'FUTURE',
  hero_image_key TEXT,
  resource_password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_workshops_slug ON public.workshops(slug);
CREATE INDEX IF NOT EXISTS idx_workshops_status ON public.workshops(status);
CREATE INDEX IF NOT EXISTS idx_workshops_start_at ON public.workshops(start_at DESC);
CREATE INDEX IF NOT EXISTS idx_workshops_created_at ON public.workshops(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS public.workshops ENABLE ROW LEVEL SECURITY;

-- (Optional) Note: Policies are intentionally omitted.
-- Admin endpoints use the service role (bypasses RLS).
-- Public pages fetch server-side.

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================
INSERT INTO schema_migrations (version, applied_at)
VALUES ('013_create_workshops', NOW())
ON CONFLICT (version) DO NOTHING;

SELECT 'Workshops table created successfully' AS status;

