BEGIN;

-- Ensure status column exists
ALTER TABLE IF EXISTS public.waitlist
  ADD COLUMN IF NOT EXISTS status text;

-- Backfill NULL statuses to 'pending'
UPDATE public.waitlist
SET status = 'pending'
WHERE status IS NULL;

-- Set default to 'pending' (idempotent)
ALTER TABLE public.waitlist
  ALTER COLUMN status SET DEFAULT 'pending';

-- Optionally enforce NOT NULL (safe since we backfilled)
ALTER TABLE public.waitlist
  ALTER COLUMN status SET NOT NULL;

-- Drop any existing status CHECK constraint if present
DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'public.waitlist'::regclass
    AND contype = 'c'
    AND conname ILIKE 'waitlist_status_check%';

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.waitlist DROP CONSTRAINT %I', cname);
  END IF;
END$$;

-- Add the canonical CHECK constraint including 'revoked'
ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_status_check
  CHECK (status IN ('pending','approved','rejected','delayed','revoked'));

COMMIT;


