BEGIN;

-- Ensure pgcrypto for gen_random_bytes()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function to generate a 10-char URL-safe alphanumeric ID and avoid collisions
CREATE OR REPLACE FUNCTION public.generate_short_id() RETURNS text AS $$
DECLARE
  v text;
  exists boolean;
BEGIN
  LOOP
    -- Generate random bytes, base64-encode, strip non-alphanumerics, take first 10 chars
    v := substring(regexp_replace(encode(gen_random_bytes(9), 'base64'), '[^A-Za-z0-9]', '', 'g') FROM 1 FOR 10);
    -- Ensure we actually got 10 chars; if not, try again
    IF length(v) = 10 THEN
      SELECT EXISTS(SELECT 1 FROM public.mailing_list_subscribers WHERE public_id = v) INTO exists;
      IF NOT exists THEN
        RETURN v;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Change column type to text (if previously UUID)
ALTER TABLE IF EXISTS public.mailing_list_subscribers
  ALTER COLUMN public_id TYPE text USING public_id::text;

-- Backfill any null/short values with a generated ID
UPDATE public.mailing_list_subscribers
SET public_id = public.generate_short_id()
WHERE public_id IS NULL OR length(public_id) < 10;

-- Set default to generator
ALTER TABLE public.mailing_list_subscribers
  ALTER COLUMN public_id SET DEFAULT public.generate_short_id();

-- Keep NOT NULL and UNIQUE constraints as established previously

COMMIT;


