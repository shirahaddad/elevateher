### Community Test Staging Page

Purpose: Stage and validate Slack community onboarding without exposing it publicly or affecting production signups.

### What’s Included
- New route: `/services/community-test`
  - Files:
    - `app/services/community-test/page.tsx` — duplicated from `app/services/community/page.tsx` with test-specific tweaks.
    - `app/services/community-test/head.tsx` — adds `<meta name="robots" content="noindex, nofollow" />` so the page is not indexed.
- Form behavior:
  - Posts to existing endpoint: `POST /api/submit-workshop-waitlist`
  - Uses base waitlist validation with an extension on this page to require LinkedIn.
  - Local additions in the test page:
    - Required LinkedIn field (validated as a URL).
    - `category` is set to `'community-test'` so entries are easy to filter in admin.
    - Honeypot field `website` remains for spam prevention.
- Visibility:
  - Not included in `app/sitemap.ts` (only `/services/community` is listed).
  - `noindex, nofollow` ensures search engines won’t index it.
  - Shareable via direct URL only: `/services/community-test`.

### Data and Admin
- Current persistence in `app/api/submit-workshop-waitlist/route.ts` stores:
  - `name`, `email`, `mailingList`, `category` into the `waitlist` table.
- LinkedIn is validated on the client in the test page but is not yet persisted or emailed.
  - Optional next step to persist: add `linkedin` column to `waitlist`, update the API insert, update `types/waitlist.ts`, and include LinkedIn in admin list and email (`lib/email.ts`).
- Admin filtering:
  - Use the `category` filter in `/admin/waitlist` to view only `community-test` submissions.

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
5. If persisting LinkedIn:
   - Run migration to add `linkedin` to `waitlist`, update API and emails, then promote the page.

### Slack Integration (Future)
- Free Slack workspaces don’t support API-based auto-invite. On approval, we can:
  - Send a workspace invite link by email (immediate).
  - Later (Enterprise Grid), integrate Slack Admin API to programmatically issue invites.

### Email and Vetting Flow (Planned)
We will move from a simple "waitlist" notification to a structured vetting workflow.

1) Submission email to admin (Vetting Needed)
- Triggered by a new `community-test` submission.
- Subject: "Community Vetting Needed — {name}"
- Body includes: Name, Email, LinkedIn, Mailing list opt-in, Category (`community-test`), and direct link to the admin vetting page with the specific record preselected.

2) Admin decisions
- Approve: sends the candidate an email with a Slack invite link and marks record as `approved`.
- Reject: requires a reason; sends the candidate a thoughtfully worded decline email with the reason and suggested next steps (e.g., email Shira).
- Delay: no email to candidate; marks record as `delayed` and flags for Shira follow-up.

3) Slack on Approve (Free plan)
- We will email a Slack invite link (configurable env var) rather than using the Slack Admin API (not available on free plan). Candidate must accept the invite.

4) Audit and visibility
- Record who made the decision, when, and the decision reason (for reject).
- Surface status and metadata in `/admin/waitlist` with filters for `community-test`.

5) Post-Approval Revocation (Future)
- Business rule: When an entry is already `approved`, the "reject" path changes semantics to "revoke".
- Behavior:
  - Transition: `approved` → `revoked`
  - Require reason, record reviewer and timestamp
  - No candidate email by default
  - Slack integration (future): remove from workspace/channels instead of emailing
- UI:
  - For `approved` rows, hide Reject/Delay; show a `Revoke` button instead
  - Revoke prompts for a reason and records an audit entry

### QA Checklist
- Name and email are required; email must be valid.
- LinkedIn is required and must be a valid URL.
- Honeypot stays empty; submissions with it filled are rejected.
- Successful submit redirects to `/thank-you`.
- Entry appears in `/admin/waitlist` with `category = community-test`.

### Rollback
- Remove `app/services/community-test/` directory to fully disable the test page.

---

### Implementation Tasks (Ordered Checklist)
Use this list to track progress. Items with [x] are complete.

1. [x] Create non-indexed staging page at `/services/community-test`
2. [x] Duplicate community page UI and wire to existing endpoint
3. [x] Require LinkedIn on the test page; validate as URL
4. [ ] Persist LinkedIn on the server (DB column on `waitlist`, API insert)
5. [ ] Extend admin list to display LinkedIn (and allow copy)
6. [ ] Add status fields to `waitlist`: `status` (pending|approved|rejected|delayed), `reviewed_by`, `reviewed_at`, `decision_reason`, `invite_link_sent_at`
7. [ ] Update `/api/submit-workshop-waitlist` to send "Vetting Needed" admin email (new template) including LinkedIn and a deep link to vet the entry
8. [ ] Create admin vetting actions (PATCH in `/api/admin/waitlist`): approve, reject (requires reason), delay
9. [ ] Implement candidate emails:
    - Approve: send Slack invite link email (env `SLACK_INVITE_LINK`)
    - Reject: send decline email with required reason and suggested next steps
    - Delay: no candidate email; optional notification to Shira
10. [ ] Update `/admin/waitlist` UI: decision buttons, reason modal for reject, filters by status/category, and audit trail display
11. [ ] Analytics/Logging: track decisions and email sends; surface basic counts on `/admin/dashboard`
12. [ ] Security review: restrict vetting actions to authenticated admins; validate inputs server-side
13. [ ] Final QA: e2e test of approve/reject/delay flows (emails, status updates, filters)
14. [ ] Promotion: copy `community-test` content into `/services/community`, set `category` to `community`, keep `community-test` as sandbox or remove
15. [ ] Add revoke flow for approved entries (status `revoked`, require reason, no email)
16. [ ] Future: integrate Slack removal for revoked entries

Suggested DB migration (high-level):
- Table `waitlist` additions:
  - `linkedin` text
  - `status` text CHECK IN ('pending','approved','rejected','delayed','revoked') DEFAULT 'pending'
  - `reviewed_by` uuid NULL
  - `reviewed_at` timestamptz NULL
  - `decision_reason` text NULL
  - `invite_link_sent_at` timestamptz NULL


