BEGIN;

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add column if missing
ALTER TABLE IF EXISTS public.mailing_list_subscribers
  ADD COLUMN IF NOT EXISTS public_id uuid;

-- Backfill any nulls
UPDATE public.mailing_list_subscribers
SET public_id = gen_random_uuid()
WHERE public_id IS NULL;

-- Set default and constraints
ALTER TABLE public.mailing_list_subscribers
  ALTER COLUMN public_id SET DEFAULT gen_random_uuid();

ALTER TABLE public.mailing_list_subscribers
  ALTER COLUMN public_id SET NOT NULL;

-- Unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.mailing_list_subscribers'::regclass
      AND conname = 'mailing_list_subscribers_public_id_key'
  ) THEN
    ALTER TABLE public.mailing_list_subscribers
      ADD CONSTRAINT mailing_list_subscribers_public_id_key UNIQUE (public_id);
  END IF;
END$$;

COMMIT;



