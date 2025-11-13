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

### QA Checklist
- Name and email are required; email must be valid.
- LinkedIn is required and must be a valid URL.
- Honeypot stays empty; submissions with it filled are rejected.
- Successful submit redirects to `/thank-you`.
- Entry appears in `/admin/waitlist` with `category = community-test`.

### Rollback
- Remove `app/services/community-test/` directory to fully disable the test page.


