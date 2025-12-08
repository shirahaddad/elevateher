BEGIN;

ALTER TABLE public.newsletter_archive
  ADD CONSTRAINT newsletter_archive_campaign_id_key UNIQUE (campaign_id);

COMMIT;

