# Supabase setup

Everything the site stores lives in one Supabase project: the database (PostgreSQL), the
admin login (Supabase Auth) and uploaded images (Supabase Storage). The website talks to it
only over HTTPS with `@supabase/supabase-js`, so shared hosting that blocks port 5432 is fine.

## Fast path (automated)
After creating the project (step 1), fill `.env.local` (including the 3 one-time setup lines) and run:
```bash
npm run setup:supabase   # imports schema, disables sign-ups, creates your admin, generates CRON_SECRET
npm run check:supabase   # verifies everything
```
Then delete `SUPABASE_ACCESS_TOKEN`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env.local`.
Steps 2–4 below are the manual alternative.

## 1. Create the project
1. Go to https://supabase.com, sign in, then click **New project**.
2. Region: **Southeast Asia (Singapore)** is closest to Bangladesh.
3. Save the database password somewhere safe (the site itself never uses it).

## 2. Import the schema
1. Dashboard -> **SQL Editor** -> **New query**.
2. Paste the entire contents of `supabase/schema.sql` and click **Run**.
3. You should see "Success. No rows returned". The script is safe to run again later.

## 3. Lock down sign-ups (important)
Dashboard -> **Authentication** -> **Sign In / Providers** -> **Email**:
- Turn **OFF** "Allow new users to sign up".
- Keep "Confirm email" on.

Only users listed in the `admins` table can use `/admin`. Even so, public sign-ups should stay off.

## 4. Create your admin account
1. **Authentication** -> **Users** -> **Add user** -> **Create new user**.
   Enter your email and a strong password, then tick **Auto Confirm User**.
2. **SQL Editor**, run (with your email):
   ```sql
   insert into public.admins (user_id, email, name)
   select id, email, 'Adrito Ashraf' from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```

## 5. Copy the API keys
**Project Settings** -> **API**:
| Supabase value | Env variable |
|---|---|
| Project URL | `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` (server only, never share) |

## 6. Verify
From `main website/`, after filling in `.env.local`:
```bash
npm run check:supabase
```
It checks every table, the RLS rules, the storage buckets and that an admin exists.

## Auth URL settings (when the domain is ready)
**Authentication** -> **URL Configuration**: set **Site URL** to your live URL
(for example `https://adrito.dev`) and add it to **Redirect URLs**.

---

## What each table does
| Table | Purpose | Public access |
|---|---|---|
| `admins` | Supabase Auth users allowed into `/admin` | none |
| `site_settings` | Single row: name, role, hero/header text, nav, socials, SEO, default currency | read |
| `projects` | Portfolio items (problem, solution, features, tech stack, cover, card theme) | read if published |
| `project_images` | Screenshot gallery per project | read if project published |
| `services` | Services with USD and BDT starting prices, includes, timeline | read if published |
| `process_steps` | "How I Work" steps | read if published |
| `testimonials` | Text or video testimonials | read if published |
| `faqs` | FAQ accordion | read if published |
| `availability_rules` | Weekly windows (local time in `booking_settings.timezone`) | none (server computes slots) |
| `blocked_dates` | Days off | none |
| `booking_settings` | Slot length, buffer, max/day, notice, days ahead, timezone, default Meet link, auto-confirm | none |
| `bookings` | Client intake answers + meeting time (UTC) + status | none (server inserts) |
| `email_templates` | Editable email subjects/bodies with `{{variables}}` | none |
| `dashboard_state` | Small admin flags (quick setup dismissed, last cron run) | none |
| `rate_limits` | Spam/abuse counters used by the server | none |

## Safety built into the database
- **No double booking:** a partial unique index on `bookings(start_time_utc) where status <> 'cancelled'`,
  plus an exclusion constraint that blocks any overlapping active bookings.
- **`create_booking()` function:** runs atomically and locks the day. It rejects blocked dates,
  full days and slots inside the buffer. Only the server (service role) can call it.
- **Row Level Security** is on for every table. Visitors can only read published content.
  Only admins can write.
- **Storage:** `site-media` is public (images only, 5 MB). `booking-attachments` is private
  (images and PDF, 5 MB) and only readable by admins through short-lived signed URLs.
- **Manage links:** only a SHA-256 hash of each client's manage token is stored.
