BEGIN;

CREATE TABLE IF NOT EXISTS public.mailing_list_subscribers (
  email text PRIMARY KEY,
  name text,
  status text NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed','unsubscribed')),
  subscribed_at timestamptz,
  unsubscribed_at timestamptz,
  last_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lowercase email trigger to normalize input
CREATE OR REPLACE FUNCTION public.normalize_email_lower() RETURNS trigger AS $$
BEGIN
  NEW.email := lower(NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_email_lower ON public.mailing_list_subscribers;
CREATE TRIGGER trg_normalize_email_lower
BEFORE INSERT OR UPDATE ON public.mailing_list_subscribers
FOR EACH ROW EXECUTE FUNCTION public.normalize_email_lower();

-- Maintain updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_updated_at ON public.mailing_list_subscribers;
CREATE TRIGGER trg_touch_updated_at
BEFORE UPDATE ON public.mailing_list_subscribers
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

COMMIT;


