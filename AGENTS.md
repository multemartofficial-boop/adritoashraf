<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project notes

- Design references live in `../reference/` (read-only). Mockup frames, devices and wallpapers in those images are NOT to be built; every page is full width/height.
- Stack: Next.js 16.3 (App Router, `proxy.ts` replaces `middleware.ts`), Tailwind v4, Supabase via supabase-js over HTTPS only (no direct Postgres), Nodemailer SMTP.
- Database schema: `supabase/schema.sql` (idempotent). Keep `src/types/database.ts` in sync when changing it.
- Service-role client (`src/lib/supabase/admin.ts`) is server-only; every admin action/route must re-check the session even though `proxy.ts` guards `/admin`.
- Deployment target: cPanel Node.js App (1 GB RAM), `output: "standalone"`, built locally. `images.unoptimized` is intentional (no sharp on server).
- New dependencies: pin exact versions published at least 7 days ago.

## Admin patterns
- Pages: `src/app/admin/(dashboard)/<module>/page.tsx`; call `requireAdmin()` and use `session.supabase` (RLS-enforced).
- Server actions: start with `requireAdminAction()`; validate with zod; `revalidatePath` after writes.
- Admin API routes: wrap with `adminRoute()` from `src/lib/auth/origin.ts` (same-origin + session check).
- UI: shadcn-style primitives in `src/components/ui`, shell pieces in `src/components/admin` (Panel, PageHeader, StatsRow, QuickActionCard). Admin uses `font-admin` (Inter) and `admin-*` color tokens.
- Supabase `Database` types must use `type` aliases (not `interface`) or queries infer `never`.
- Forms: zod parsers in `src/lib/validators/content.ts` are shared by client (`useAdminForm`) and server actions (`runAdminForm` / `runAdmin` in `src/lib/admin/run.ts`, which re-check the session and hide internal errors). Call `revalidatePublic()` after content writes.
- Images: browser compresses to WebP (`src/lib/image-compress.ts`) then POSTs to `/api/admin/upload`; replaced/deleted images are removed from storage via `removePublicFilesByUrl`.

## Public site patterns
- Routes in `src/app/(public)`; sections in `src/components/sections`, shared site UI in `src/components/site`.
- Read data only via `src/lib/data/public.ts` (cookie-free anon client → pages stay static/ISR; `revalidatePublic()` refreshes them). Never call `cookies()` in public pages.
- Layout rule: sections are full-width; align content with the `section-x` utility (padding only), no outer frames.
- Design utilities in `globals.css`: `tag-pill`, `text-gradient-lavender`, `text-gradient-peach`, `bg-cta`, `bg-orange-pill`, `glass`, `bg-holo`, `animate-marquee`, `mask-fade-x`.
- Section headings come from `site_settings.section_texts` (editable in Site Settings → Section headings).

## Booking system
- Slot engine `src/lib/booking/slots.ts` (service role; mirrors DB rules: availability windows in admin tz, min notice, blocked dates, daily cap, buffer overlap). Writes go through DB functions `create_booking` / `reschedule_booking`, which are the source of truth for conflicts.
- Public routes: `GET /api/booking/slots`, `POST /api/booking` (multipart; honeypot `website`, `form_started_at` timing, IP 10/h + email 5/day limits), `POST /api/booking/manage` (cancel/reschedule via token), `GET /api/booking/ics?token=`. Mutations require same-origin.
- Manage tokens: raw token only in emails/URLs; DB stores SHA-256 (`src/lib/booking/tokens.ts`). `issueManageToken()` rotates it (reminder emails do this, so older links die).
- Emails: `sendBookingEmail(type, booking, { manageToken })` in `src/lib/email/booking-emails.ts`; templates live in `email_templates` with `{{vars}}` (HTML-escaped). Call inside `after()` so SMTP never blocks the response. `EMAIL_TRANSPORT=log` prints emails to the console (used in `.env.local`).
- Cron: `GET|POST /api/cron/reminders` with `Authorization: Bearer CRON_SECRET` (36h window, claims `reminder_sent_at` before sending; writes `dashboard_state.cron_last_run`).
- Timestamps from Supabase arrive as `+00:00`; normalise with `new Date(x).toISOString()` before comparing/sending to the client.
- Public forms use the `field-public` utility; `/manage-booking` is `force-dynamic`.

## Supabase
- Project ref: `utaiwlvayzigaxaargww`. Apply schema changes with:
  `npx supabase@2.119.0 db query --linked --project-ref utaiwlvayzigaxaargww -f supabase/schema.sql`
  (user is logged in via `supabase login`; schema is idempotent).
- `npm run check:supabase` verifies tables, RLS, buckets, admin.
- In `.env.local`, quote values containing `#` (otherwise treated as a comment).

## Verification
- `npm run typecheck`
- `npm run lint`
- `npm run deploy:build` (needs NEXT_PUBLIC_* env vars at build time)
