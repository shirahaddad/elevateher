BEGIN;

CREATE TABLE IF NOT EXISTS public.newsletter_archive (
  id bigserial PRIMARY KEY,
  campaign_id bigint NOT NULL REFERENCES public.newsletter_campaign_logs(id) ON DELETE CASCADE,
  subject text NOT NULL,
  html_template text NOT NULL,
  html_sanitized text,
  slug text UNIQUE,
  is_public boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_archive_published_idx
  ON public.newsletter_archive (is_public DESC, published_at DESC);

COMMIT;

