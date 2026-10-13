# Adrito Ashraf: Portfolio, Booking and Admin

Next.js 16 (App Router, TypeScript strict) + Tailwind CSS v4 + Supabase (database, auth, storage),
deployed as a standalone Node.js server on cPanel.

> Status: **Phase 2** (setup, env, Supabase connection, schema, deploy pipeline).
> Admin, public site, booking and 3D arrive in later phases.

## Requirements (your computer)
- Node.js 20.9+ (tested with 24)
- A Supabase project (see `supabase/README.md`)

## 1. Set up Supabase
Follow `supabase/README.md`: import `supabase/schema.sql`, turn off sign-ups, create your admin, copy the keys.

## 2. Configure environment
```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run check:supabase       # verifies tables, RLS, buckets and admin
```

## 3. Build on your computer (never on the server)
```bash
npm run deploy:build
```
This runs `next build` and assembles:
- `deploy/app/`: the self-contained server (`server.js`, `.next/`, `public/`, minimal `node_modules/`)
- `deploy/adrito-portfolio.zip`: the same folder, zipped for upload

Optional local test of the production bundle: `npm start`, then open http://localhost:3000.

> `NEXT_PUBLIC_*` values are baked in at build time. When you change the domain or Supabase
> project, update `.env.local` and rebuild.

## 4a. Deploy to Vercel (recommended)

1. Push the repo to GitHub, then **vercel.com -> Add New -> Project -> Import** the repo.
   No build settings needed — Vercel detects Next.js automatically.
2. **Environment Variables** (Project Settings -> Environment Variables): add every key
   from `.env.example` with real values — the Supabase URL + keys, `STORAGE_*`,
   `CRON_SECRET`, SMTP keys once you have them, and:
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain` (no trailing slash)
   - Never add `SUPABASE_ACCESS_TOKEN`, `ADMIN_EMAIL` or `ADMIN_PASSWORD` — those are
     one-time local setup values.
3. **Deploy.** Then open `https://<project>.vercel.app/api/health` — expect
   `{"ok":true,"db":"up"}`.
4. **Cron:** `vercel.json` already schedules `GET /api/cron/reminders` daily at
   03:00 UTC (9 AM Dhaka). Vercel automatically sends `Authorization: Bearer
   <CRON_SECRET>` — as long as `CRON_SECRET` is set in env vars, it just works.
   Check **Project -> Settings -> Cron Jobs** to see it run.
5. Image optimization (`next/image`) is enabled automatically on Vercel
   (`images.unoptimized` only applies off-Vercel).

### Connecting a Hostinger domain to Vercel
1. Vercel project -> **Settings -> Domains -> Add** -> enter `yourdomain.com` and
   `www.yourdomain.com`.
2. In **Hostinger -> DNS Zone**, set:
   - `A` record: `@` -> `76.76.21.21`
   - `CNAME` record: `www` -> `cname.vercel-dns.com`
   (Delete any existing `A`/`CNAME` records for `@`/`www` that point elsewhere.)
3. SSL is issued automatically by Vercel once DNS resolves (can take up to 24h,
   usually minutes). HSTS activates automatically because `NEXT_PUBLIC_SITE_URL`
   starts with `https://`.
4. In **Supabase -> Authentication -> URL Configuration**, set Site URL to
   `https://yourdomain.com`.

## 4b. Deploy to WebHostBD cPanel (Node.js App)
1. **cPanel -> Setup Node.js App -> Create Application**
   - Node.js version: **22.x** (or 20.x, at least 20.9)
   - Application mode: **Production**
   - Application root: `adrito-portfolio` (a folder in your home directory, **not** inside `public_html`)
   - Application URL: your domain or temporary URL
   - Application startup file: `server.js`
   - Click **Create**, then **Stop App**.
2. **Environment variables** (same page, "Add Variable"): add every key from `.env.example`
   with real values, plus:
   - `NODE_ENV` = `production`
   - `NODE_OPTIONS` = `--max-old-space-size=512` (keeps memory well under the 1 GB limit)
3. **Upload:** cPanel -> **File Manager** -> open `adrito-portfolio/`.
   - Settings (top right) -> tick **Show Hidden Files (dotfiles)**.
   - Delete any sample files cPanel created there (for example `app.js`).
   - **Upload** `deploy/adrito-portfolio.zip`, then right-click it -> **Extract** into `adrito-portfolio/`.
   - Check that `server.js`, `.next/`, `public/`, `node_modules/` and `package.json` are directly inside `adrito-portfolio/`.
   - Delete the zip.
4. **Do NOT click "Run NPM Install".** The bundle already contains the exact `node_modules` it needs.
5. Back in **Setup Node.js App**, click **Start App** (or **Restart**).
6. Open `https://your-url/api/health`. It should return `{"ok":true,"db":"up"}`.

## 5. Daily cron job (reminders + keeps Supabase awake)
`/api/cron/reminders` emails clients a reminder for confirmed meetings in the next 36 hours
and runs a tiny database query so the free Supabase project never pauses for inactivity.

1. **cPanel -> Cron Jobs -> Add New Cron Job**
   - Common Settings: **Once Per Day** (for example at 08:00, which is 8 AM Dhaka if the server is in Dhaka time; any time works)
   - Command (one line, replace the URL and the secret with your real `CRON_SECRET`):
     ```
     curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-url/api/cron/reminders > /dev/null 2>&1
     ```
2. Test it once from your computer:
   ```
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-url/api/cron/reminders
   ```
   Expected: `{"ok":true,"db":"up","checked":0,"sent":0,"failed":0}`. Without the header it returns 401.

## 5b. SEO

Built in and automatic:
- `sitemap.xml` and `robots.txt` are generated from the database (projects appear
  automatically; `/admin`, `/manage-booking` and `/api` are excluded).
- Every page has a canonical URL; project pages use their SEO fields when set.
- JSON-LD: `Person` + `WebSite` site-wide, `BreadcrumbList` + `CreativeWork` on
  project pages, `FAQPage` on the home page when FAQs exist.
- `https://` and the apex domain are enforced with 301s once
  `NEXT_PUBLIC_SITE_URL` is `https://adritoashraf.com`; `www.` redirects to apex
  and non-canonical hosts get `X-Robots-Tag: noindex`.
- Admin → **Site Settings → SEO & sharing**: meta title/description, focus
  keyword, OG image, **GA4 Measurement ID** and **Search Console verification**.
- Admin → **Redirects**: add/manage 301s (live within a minute, no redeploy).
- Each project has SEO overrides: meta title/description, focus keyword, OG
  image, cover alt text, canonical URL and a **noindex** switch.

After launch: verify the domain in Google Search Console (paste the token into
Site Settings), submit `/sitemap.xml`, and add the GA4 ID when ready.

## 6. Email (SMTP)
Bookings work without email, but clients will not receive confirmations until SMTP is set.
1. cPanel -> **Email Accounts** -> create `no-reply@yourdomain.com`.
2. Click **Connect Devices** to see the SMTP host/port, then fill `SMTP_*`, `EMAIL_FROM` and
   `ADMIN_NOTIFY_EMAIL` in the cPanel env vars and **Restart** the app.
3. Make a test booking on `/book`; both you and the client address should receive emails.

### Updating the site later
1. On your computer: `npm run deploy:build`.
2. cPanel: **Stop App**, then in `adrito-portfolio/` delete `.next/`, `node_modules/`, `public/`, `server.js` and `package.json`.
3. Upload and extract the new zip, then **Start App**.

### Connecting the domain later
1. Point the domain to the hosting and edit the Node.js App's **Application URL**.
2. Set `NEXT_PUBLIC_SITE_URL=https://your-domain` in `.env.local` **and** in the cPanel env vars.
3. Rebuild and re-upload (step 3 above).
4. Update Supabase **Authentication -> URL Configuration** (see `supabase/README.md`).
5. Enable SSL (cPanel -> SSL/TLS Status -> AutoSSL). HSTS and `upgrade-insecure-requests`
   switch on automatically when `NEXT_PUBLIC_SITE_URL` starts with `https://`.

## Scripts
| Script | What it does |
|---|---|
| `npm run dev` | Local dev server (optional) |
| `npm run typecheck` | Generate route types + `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run deploy:build` | Production build + cPanel bundle in `deploy/` |
| `npm start` | Run the bundled server locally (`deploy/app/server.js`) |
| `npm run check:supabase` | Verify the Supabase schema, RLS, buckets and admin |

## Project structure
```
supabase/            schema.sql (run in Supabase SQL Editor) + README
scripts/             package-standalone.mjs, check-supabase.mjs
public/images/       optimized static images (hero background)
src/app/             routes (public site, /admin, /api)
src/lib/env/         validated env (public vs server-only)
src/lib/supabase/    browser, server (cookie session) and service-role clients
src/lib/storage/     storage abstraction + upload validation (magic bytes, 5 MB)
src/lib/db/          data access helpers
src/types/           database types mirroring schema.sql
```

## Security notes
- `SUPABASE_SERVICE_ROLE_KEY` is read only in `server-only` modules and never sent to the browser.
- RLS is on for every table. The service-role client is used only for trusted server work.
- `.env*` files are git-ignored and stripped from the deploy bundle.
