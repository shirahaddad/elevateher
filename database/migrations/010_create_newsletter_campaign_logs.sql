BEGIN;

CREATE TABLE IF NOT EXISTS public.newsletter_campaign_logs (
  id bigserial PRIMARY KEY,
  subject text NOT NULL,
  campaign_key text UNIQUE,
  total integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  sent_by text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful index for recent views
CREATE INDEX IF NOT EXISTS newsletter_campaign_logs_created_at_idx
  ON public.newsletter_campaign_logs (created_at DESC);

COMMIT;


