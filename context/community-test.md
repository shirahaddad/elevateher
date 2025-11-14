### Community Test Staging Page

Purpose: Stage and validate Slack community onboarding without exposing it publicly or affecting production signups.

### What’s Included
- New route: `/services/community-test`
  - Files:
    - `app/services/community-test/page.tsx` — duplicated from `app/services/community/page.tsx` with test-specific tweaks.
    - `app/services/community-test/head.tsx` — adds `<meta name="robots" content="noindex, nofollow" />` so the page is not indexed.
- Form behavior:
  - Posts to: `POST /api/community-join`
  - Uses base validation extended on this page to require LinkedIn (non-empty string; no strict URL check).
  - Local additions in the test page:
    - Required LinkedIn field (not URL-enforced).
    - `category` is set to `'community-test'` so entries are easy to filter in admin.
    - Honeypot field `website` remains for spam prevention.
- Visibility:
  - Not included in `app/sitemap.ts` (only `/services/community` is listed).
  - `noindex, nofollow` ensures search engines won’t index it.
  - Shareable via direct URL only: `/services/community-test`.

### Data and Admin
- Persistence: `app/api/community-join/route.ts` inserts `name`, `email`, `mailingList`, `category`, `linkedin` into `public.waitlist`.
- Admin vetting:
  - Dedicated page `/admin/community-test` (A=Approve, R=Reject, V=Revoke if approved, D=Delete).
  - Endpoints under `/api/admin/community-join` (GET list, PATCH actions, DELETE).
  - The old waitlist page excludes `community-test`.
  - Dashboard shows pending counter for community-test.
  - Settings UI at `/admin/settings` manages the Slack invite link (stored in `app_settings.slack_invite_link`).

### How to Promote Test → Production
When the flow is approved:
1. Replace the production page content with the test page:
   - Option A: copy `app/services/community-test/page.tsx` over `app/services/community/page.tsx`.
   - Option B: move/rename the folder or keep both (keeping test as a separate sandbox).
2. Update details in the promoted file:
   - Change the header copy from “Community Test” to “Community”.
   - Set `category` from `'community-test'` to `'community'`.
3. Indexing:
   - Ensure production route (`/services/community`) remains indexed (no `noindex` in its head).
   - Leave `community-test` as `noindex` or remove it entirely once done.
4. Sitemap:
   - `app/sitemap.ts` already includes `/services/community`; no change needed.
5. After promotion:
  - Update the page’s `category` default from `'community-test'` to `'community'`.
  - Admin vetting will continue to work; you can switch the admin page to filter `'community'` later if desired.

### Slack Integration (Future)
- Free Slack workspaces don’t support API-based auto-invite. On approval, we can:
  - Send a workspace invite link by email (immediate). Link is pulled from `app_settings.slack_invite_link` with env fallback `SLACK_INVITE_LINK`.
  - Later (Enterprise Grid), integrate Slack Admin API to programmatically issue invites.

### Email and Vetting Flow (Planned)
Implemented structured vetting workflow.

1) Submission email to admin (Vetting Needed)
- Triggered by a new `community-test` submission.
- Subject: "New Community-Test Submission"
- Body includes: Name, Email, LinkedIn, Mailing list opt-in, Category (`community-test`), and direct link to the admin vetting page with the specific record preselected.

2) Admin decisions
- Approve: sends the candidate an email with a Slack invite link and marks record as `approved` (records reviewer).
- Reject: requires a reason; sends the candidate a respectful decline email with the reason (records reviewer).
- Delete: removes the entry (no email). Available for all statuses.

3) Slack on Approve (Free plan)
- We email a Slack invite link (managed in Settings) rather than using the Slack Admin API (not available on free plan). Candidate must accept the invite.

4) Audit and visibility
- Record who made the decision, when, and the decision reason (for reject/revoke).
- Surface status and metadata in `/admin/community-test`.

5) Post-Approval Revocation (Future)
- Business rule: When an entry is already `approved`, the "reject" path changes semantics to "revoke".
- Behavior:
  - Transition: `approved` → `revoked`
  - Require reason, record reviewer and timestamp
  - No candidate email by default
  - Slack integration (future): remove from workspace/channels instead of emailing
- UI:
  - For `approved` rows, show `Revoke` and `Delete`
  - Revoke prompts for a reason and records an audit entry

### QA Checklist
- Name and email are required; email must be valid.
- LinkedIn is required (non-empty), URL format not enforced.
- Honeypot stays empty; submissions with it filled are rejected.
- Successful submit redirects to `/thank-you`.
- Entry appears in `/admin/community-test` with `category = community-test`.
- Admin vetting email contains deep link that highlights the row.
- Candidate emails are sent on approve (Slack link) and reject (reason).

### Rollback
- Remove `app/services/community-test/` directory to fully disable the test page.

---

### Implementation Tasks (Ordered Checklist)
Use this list to track progress. Items with [x] are complete.

1. [x] Create non-indexed staging page at `/services/community-test`
2. [x] Wire to new endpoint `/api/community-join`
3. [x] Require LinkedIn on the test page; relax to non-empty text
4. [x] Persist LinkedIn on the server (DB column on `waitlist`, API insert)
5. [x] Extend admin list to display LinkedIn (and allow copy)
6. [x] Add/ensure status fields on `waitlist` and CHECK constraint includes `revoked`
7. [x] Send "Vetting Needed" admin email including LinkedIn and deep link
8. [x] Create admin vetting actions (PATCH in `/api/admin/community-join`): approve, reject (requires reason), revoke (requires reason), delete (DELETE)
9. [x] Implement candidate emails:
    - Approve: send Slack invite link email (link from Settings, env fallback)
    - Reject: send decline email with required reason
10. [x] Admin UI for vetting at `/admin/community-test` with A/R/V/D
11. [x] Dashboard pending counter and deep-link row highlight
12. [x] Admin Settings to manage Slack invite link (`/admin/settings`)
13. [ ] Final QA after promotion: e2e approve/reject/revoke/delete flows (emails, status updates)
14. [ ] Promotion: copy `community-test` content into `/services/community`, set `category` to `community`, keep `community-test` as sandbox or remove
15. [ ] Future: integrate Slack removal for revoked entries

Suggested DB migration (high-level):
- Table `waitlist` additions:
  - `linkedin` text
  - `status` text CHECK IN ('pending','approved','rejected','delayed','revoked') DEFAULT 'pending'
  - `reviewed_by_name` text NULL
  - `reviewed_by_email` text NULL
  - `reviewed_at` timestamptz NULL
  - `decision_reason` text NULL
  - `invite_link_sent_at` timestamptz NULL

### Notes and Considerations (Pre‑Promotion)
- Delete is permanent (hard delete). If you need recoverability later, replace with soft-delete (add `deleted_at timestamptz NULL`) and filter it out in queries.
- Revoke records reviewer, timestamp and reason; no candidate email is sent on revoke.
- Categories: keep `community-test` for staging and use `community` for production. Decide whether to migrate test rows to `community` after launch or keep separate.
- Settings source of truth: Slack invite link lives in `app_settings.slack_invite_link` with env fallback `SLACK_INVITE_LINK`. Update via `/admin/settings` (no deploy).
- Deployment envs required: `RESEND_API_KEY`, `ADMIN_EMAIL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_BASE_URL`. Optional fallback: `SLACK_INVITE_LINK`.
- Constraints relied upon: `waitlist.status` is NOT NULL DEFAULT 'pending' with CHECK including 'revoked'; audit fields (`reviewed_by_name`, `reviewed_by_email`, `reviewed_at`, `decision_reason`, `invite_link_sent_at`) are used by vetting logic.
- Endpoints in use:
  - Submit: `POST /api/community-join`
  - Vetting: `GET|PATCH|DELETE /api/admin/community-join`
  - Stats: `GET /api/admin/community-join/stats`
  - Settings: `GET|PUT /api/admin/settings/slack-invite`
  - UI: `/admin/community-test` (A/R/V/D), `/admin/settings`, dashboard pending counter
- Optional backup: If you plan to delete historical records, export a CSV from Supabase first.


