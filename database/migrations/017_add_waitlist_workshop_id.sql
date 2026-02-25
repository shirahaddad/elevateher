-- Add workshop_id to waitlist for event-specific registrations
-- and enforce unique (workshop_id, email) when workshop_id is set.
-- Application must insert lowercased email for workshop registrations.

BEGIN;

-- Add column
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS workshop_id BIGINT NULL REFERENCES public.workshops(id) ON DELETE SET NULL;

-- Index for filtering by event
CREATE INDEX IF NOT EXISTS idx_waitlist_workshop_id ON public.waitlist(workshop_id);

-- Prevent duplicate registrations per workshop (email normalized to lowercase in app)
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_workshop_email
  ON public.waitlist(workshop_id, email)
  WHERE workshop_id IS NOT NULL;

INSERT INTO schema_migrations (version, applied_at)
VALUES ('017_add_waitlist_workshop_id', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT;

SELECT 'Waitlist workshop_id column and unique index created' AS status;
