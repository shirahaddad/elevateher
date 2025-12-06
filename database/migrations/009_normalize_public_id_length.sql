BEGIN;

-- Normalize any non-10-char IDs to a new short ID
UPDATE public.mailing_list_subscribers
SET public_id = public.generate_short_id()
WHERE length(public_id) <> 10;

-- Enforce length = 10 going forward
ALTER TABLE public.mailing_list_subscribers
  DROP CONSTRAINT IF EXISTS mailing_list_subscribers_public_id_len_chk;

ALTER TABLE public.mailing_list_subscribers
  ADD CONSTRAINT mailing_list_subscribers_public_id_len_chk
  CHECK (length(public_id) = 10);

COMMIT;


