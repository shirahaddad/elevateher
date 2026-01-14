-- Add resource kind and value fields; make s3_key nullable

BEGIN;

-- Create enum type for resource kind
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_kind') THEN
    CREATE TYPE resource_kind AS ENUM ('FILE', 'URL', 'TEXT');
  END IF;
END
$$;

-- Add columns if not exist
ALTER TABLE public.workshop_resources
  ADD COLUMN IF NOT EXISTS kind resource_kind NOT NULL DEFAULT 'FILE',
  ADD COLUMN IF NOT EXISTS value TEXT NULL;

-- Make s3_key nullable (for URL/TEXT kinds)
ALTER TABLE public.workshop_resources
  ALTER COLUMN s3_key DROP NOT NULL;

-- Backfill existing rows to kind=FILE where null
UPDATE public.workshop_resources
SET kind = 'FILE'
WHERE kind IS NULL;

-- Log migration
INSERT INTO schema_migrations (version, applied_at)
VALUES ('016_alter_workshop_resources_add_kind', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT;

SELECT 'Altered workshop_resources: added kind/value, s3_key nullable' AS status;

