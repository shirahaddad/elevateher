-- Recreate workshops schema to use BIGSERIAL integer IDs
-- NOTE: This migration DROPS existing tables (test data only) and recreates them with integer PKs.

BEGIN;

-- Drop dependent table first
DROP TABLE IF EXISTS public.workshop_resources CASCADE;
DROP TABLE IF EXISTS public.workshops CASCADE;

-- Ensure enum type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workshop_status') THEN
    CREATE TYPE workshop_status AS ENUM ('NEXT', 'FUTURE', 'PAST');
  END IF;
END
$$;

-- Recreate workshops with BIGSERIAL primary key
CREATE TABLE public.workshops (
  id BIGSERIAL PRIMARY KEY,
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

-- RLS
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

-- Recreate workshop_resources with BIGSERIAL primary key
CREATE TABLE public.workshop_resources (
  id BIGSERIAL PRIMARY KEY,
  workshop_id INTEGER NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workshop_resources_workshop_id ON public.workshop_resources(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_resources_created_at ON public.workshop_resources(created_at DESC);

-- RLS
ALTER TABLE public.workshop_resources ENABLE ROW LEVEL SECURITY;

-- Log migration
INSERT INTO schema_migrations (version, applied_at)
VALUES ('015_recreate_workshops_bigserial', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT;

SELECT 'Recreated workshops and workshop_resources with BIGSERIAL IDs' AS status;

