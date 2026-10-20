-- =============================================================================
-- Adrito Ashraf — Portfolio + Booking + Admin
-- PostgreSQL schema for Supabase. Paste the whole file into
-- Supabase Dashboard -> SQL Editor -> New query -> Run.
-- The script is idempotent: running it again will not duplicate data.
-- All timestamps are stored as timestamptz (UTC).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'testimonial_type') then
    create type public.testimonial_type as enum ('text', 'video');
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- admins: which Supabase Auth users are allowed into /admin
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  name       text not null default 'Admin',
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so RLS policies can call it without recursing into admins' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- -----------------------------------------------------------------------------
-- Block public sign-ups at the database level: only emails in signup_allowlist can
-- ever be created in auth.users (the setup script adds the admin email first).
-- -----------------------------------------------------------------------------
create table if not exists public.signup_allowlist (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.enforce_signup_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.signup_allowlist where email = lower(new.email)) then
    raise exception 'Sign-ups are disabled' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Sign-ups are invite-only (admin accounts): only allowlisted emails can create
-- an auth user. Public visitor sign-up is not part of this site.
drop trigger if exists enforce_signup_allowlist on auth.users;
create trigger enforce_signup_allowlist before insert on auth.users
  for each row execute function public.enforce_signup_allowlist();

-- -----------------------------------------------------------------------------
-- site_settings: single row (id = 1) with all public site text
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                smallint primary key default 1 check (id = 1),
  site_name         text not null default 'Adrito',
  owner_name        text not null default 'Adrito Ashraf',
  role              text not null default 'Full Stack Developer',
  tagline           text not null default '',
  hero_intro        text not null default 'I Am Adrito Ashraf',
  hero_line_1       text not null default 'FULL STACK',
  hero_line_2       text not null default 'DEVELOPER',
  header_cta_label  text not null default 'Book a Free 15-Min Call',
  header_cta_href   text not null default '/book',
  nav_links         jsonb not null default '[]'::jsonb,
  marquee_items     jsonb not null default '[]'::jsonb,
  about_heading     jsonb not null default '{}'::jsonb,
  about_text        text not null default '',
  about_stats       jsonb not null default '[]'::jsonb,
  contact_email     text not null default '',
  phone             text not null default '',
  whatsapp          text not null default '',
  address           text not null default '',
  social_links      jsonb not null default '[]'::jsonb,
  footer_text       text not null default '',
  seo_title         text not null default '',
  seo_description   text not null default '',
  og_image          text not null default '',
  default_currency  text not null default 'USD' check (default_currency in ('USD', 'BDT')),
  theme             jsonb not null default '{}'::jsonb,
  updated_at        timestamptz not null default now()
);

-- Section headings (tag pill + orange / dark / grey heading parts + description) per section.
alter table public.site_settings add column if not exists section_texts jsonb not null default '{}'::jsonb;

-- Global SEO / analytics fields.
alter table public.site_settings add column if not exists seo_focus_keyword text not null default '';
alter table public.site_settings add column if not exists ga4_id text not null default '';
alter table public.site_settings add column if not exists search_console_verification text not null default '';

-- -----------------------------------------------------------------------------
-- projects + project_images
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  title_accent      text not null default '',
  slug              text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text not null default '',
  problem           text not null default '',
  solution          text not null default '',
  features          jsonb not null default '[]'::jsonb,
  tech_stack        jsonb not null default '[]'::jsonb,
  tags              jsonb not null default '[]'::jsonb,
  duration          text not null default '',
  role              text not null default '',
  live_url          text not null default '',
  cover_image       text not null default '',
  card_theme        text not null default 'sky' check (card_theme in ('sky', 'holo', 'aurum', 'peach', 'violet')),
  sort_order        integer not null default 0,
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists projects_published_sort_idx on public.projects (is_published, sort_order);

-- Per-project SEO overrides (empty values fall back to the generated metadata).
alter table public.projects add column if not exists seo_title text not null default '';
alter table public.projects add column if not exists seo_description text not null default '';
alter table public.projects add column if not exists focus_keyword text not null default '';
alter table public.projects add column if not exists og_image text not null default '';
alter table public.projects add column if not exists cover_image_alt text not null default '';
alter table public.projects add column if not exists canonical_url text not null default '';
alter table public.projects add column if not exists noindex boolean not null default false;

create table if not exists public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  image_url   text not null,
  caption     text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists project_images_project_sort_idx on public.project_images (project_id, sort_order);

-- -----------------------------------------------------------------------------
-- services (prices in both USD and BDT)
-- -----------------------------------------------------------------------------
create table if not exists public.services (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description    text not null default '',
  includes       jsonb not null default '[]'::jsonb,
  timeline       text not null default '',
  price_usd      numeric(12, 2) not null default 0 check (price_usd >= 0),
  price_bdt      numeric(12, 2) not null default 0 check (price_bdt >= 0),
  icon           text not null default 'code',
  sort_order     integer not null default 0,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists services_published_sort_idx on public.services (is_published, sort_order);

-- -----------------------------------------------------------------------------
-- process_steps ("How I Work")
-- -----------------------------------------------------------------------------
create table if not exists public.process_steps (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null default '',
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists process_steps_published_sort_idx on public.process_steps (is_published, sort_order);

-- -----------------------------------------------------------------------------
-- testimonials (text or video)
-- -----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  type          public.testimonial_type not null default 'text',
  client_name   text not null,
  client_role   text not null default '',
  avatar_url    text not null default '',
  content       text not null default '',
  rating        smallint not null default 5 check (rating between 1 and 5),
  video_url     text not null default '',
  poster_url    text not null default '',
  result        text not null default '',
  company_logo_url text not null default '',
  link_url      text not null default '',
  screenshot_url text not null default '',
  sort_order    integer not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint testimonials_video_needs_url check (type <> 'video' or video_url <> '')
);
create index if not exists testimonials_published_sort_idx on public.testimonials (is_published, sort_order);
alter table public.testimonials add column if not exists result text not null default '';
alter table public.testimonials add column if not exists company_logo_url text not null default '';
alter table public.testimonials add column if not exists link_url text not null default '';
alter table public.testimonials add column if not exists screenshot_url text not null default '';

-- -----------------------------------------------------------------------------
-- faqs
-- -----------------------------------------------------------------------------
create table if not exists public.faqs (
  id            uuid primary key default gen_random_uuid(),
  question      text not null,
  answer        text not null default '',
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists faqs_published_sort_idx on public.faqs (is_published, sort_order);

-- -----------------------------------------------------------------------------
-- Availability. start_time / end_time are LOCAL times in booking_settings.timezone.
-- weekday: 0 = Sunday ... 6 = Saturday. Multiple windows per weekday are allowed.
-- -----------------------------------------------------------------------------
create table if not exists public.availability_rules (
  id          uuid primary key default gen_random_uuid(),
  weekday     smallint not null check (weekday between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint availability_rules_range check (end_time > start_time)
);
create index if not exists availability_rules_weekday_idx on public.availability_rules (weekday) where is_active;

create table if not exists public.blocked_dates (
  id          uuid primary key default gen_random_uuid(),
  date        date not null unique,
  reason      text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.booking_settings (
  id                     smallint primary key default 1 check (id = 1),
  slot_duration_minutes  integer not null default 30 check (slot_duration_minutes between 10 and 240),
  buffer_minutes         integer not null default 15 check (buffer_minutes between 0 and 240),
  max_bookings_per_day   integer not null default 4 check (max_bookings_per_day between 1 and 50),
  min_notice_hours       integer not null default 12 check (min_notice_hours between 0 and 720),
  max_days_ahead         integer not null default 30 check (max_days_ahead between 1 and 365),
  cancel_notice_hours    integer not null default 12 check (cancel_notice_hours between 0 and 720),
  timezone               text not null default 'Asia/Dhaka',
  meeting_link_default   text not null default '',
  auto_confirm           boolean not null default false,
  updated_at             timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- bookings
-- manage_token_hash stores SHA-256 of the client's private manage token; the raw
-- token only ever exists in the client's email link.
-- -----------------------------------------------------------------------------
create table if not exists public.bookings (
  id                   uuid primary key default gen_random_uuid(),
  reference_code       text not null unique,
  client_name          text not null,
  email                text not null,
  phone                text not null default '',
  service_id           uuid references public.services (id) on delete set null,
  project_type         text not null check (project_type in ('website', 'saas', 'erp', 'hr', 'other')),
  budget_range         text not null default '',
  timeline_needed      text not null default '',
  project_description  text not null,
  reference_links      jsonb not null default '[]'::jsonb,
  attachment_path      text not null default '',
  client_timezone      text not null default 'Asia/Dhaka',
  start_time_utc       timestamptz not null,
  end_time_utc         timestamptz not null,
  status               public.booking_status not null default 'pending',
  meeting_link         text not null default '',
  admin_notes          text not null default '',
  manage_token_hash    text not null unique,
  reminder_sent_at     timestamptz,
  cancelled_at         timestamptz,
  cancelled_by         text check (cancelled_by in ('client', 'admin')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint bookings_time_range check (end_time_utc > start_time_utc)
);

-- DOUBLE BOOKING PROTECTION: only one non-cancelled booking may start at a given instant.
create unique index if not exists bookings_active_slot_uidx
  on public.bookings (start_time_utc)
  where status <> 'cancelled';

-- Extra safety: no two non-cancelled bookings may overlap, even if slot length changes later.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_no_overlap') then
    alter table public.bookings
      add constraint bookings_no_overlap
      exclude using gist (tstzrange(start_time_utc, end_time_utc, '[)') with &&)
      where (status <> 'cancelled');
  end if;
end;
$$;

create index if not exists bookings_status_start_idx on public.bookings (status, start_time_utc);
create index if not exists bookings_start_idx on public.bookings (start_time_utc);
create index if not exists bookings_service_idx on public.bookings (service_id);
create index if not exists bookings_email_idx on public.bookings (lower(email));
create index if not exists bookings_reminder_idx on public.bookings (start_time_utc)
  where status = 'confirmed' and reminder_sent_at is null;

-- -----------------------------------------------------------------------------
-- email_templates (variables like {{client_name}})
-- -----------------------------------------------------------------------------
create table if not exists public.email_templates (
  id          uuid primary key default gen_random_uuid(),
  type        text not null unique check (type in (
                'booking_received_client',
                'booking_confirmed_client',
                'booking_admin_notification',
                'reminder_client',
                'cancelled_client',
                'cancelled_admin',
                'rescheduled_client',
                'rescheduled_admin'
              )),
  subject     text not null,
  body_html   text not null,
  body_text   text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- dashboard_state (e.g. quick setup dismissed, last cron heartbeat)
-- -----------------------------------------------------------------------------
-- 301 redirects managed from the admin. Paths only ("/old" -> "/new" or full https URL).
create table if not exists public.redirects (
  id          uuid primary key default gen_random_uuid(),
  from_path   text not null unique check (from_path ~ '^/[^?#]*$' and length(from_path) > 1),
  to_path     text not null check (to_path ~ '^/' or to_path ~* '^https?://'),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- about_me — single-row "About Me" section (after Hero, before Results).
create table if not exists public.about_me (
  id                   smallint primary key default 1 check (id = 1),
  is_visible           boolean not null default true,
  tag                  text not null default 'About Me',
  heading              jsonb not null default '{}'::jsonb,
  bio_1                text not null default '',
  bio_2                text not null default '',
  full_name            text not null default '',
  role                 text not null default '',
  location             text not null default '',
  experience_years     text not null default '',
  email                text not null default '',
  availability_enabled boolean not null default true,
  availability_text    text not null default 'Available for projects',
  experience_badge     text not null default '',
  skills               jsonb not null default '[]'::jsonb,
  social_links         jsonb not null default '[]'::jsonb,
  primary_cta_label    text not null default 'Book a Free 15-Min Call',
  primary_cta_href     text not null default '/book',
  cv_url               text not null default '',
  image_url            text not null default '',
  updated_at           timestamptz not null default now()
);

-- Seed the About Me row from the existing site settings (name, role, location,
-- email, social links, tech list) so it starts with real data, not placeholders.
insert into public.about_me
  (id, heading, bio_1, bio_2, experience_years, experience_badge, image_url)
select
  1,
  '{"accent":"Hi, I''m Adrito,","strong":"A Full Stack Developer","muted":"Who Builds Real Products."}'::jsonb,
  'I''m Adrito, a full stack developer who builds websites, SaaS products and business software for real businesses. I work with a modern AI-assisted workflow: I plan the architecture, direct AI tools, review and test every piece, and ship production-ready systems.',
  'This lets me deliver in weeks what usually takes months, without cutting corners on quality. Every project comes with full source code, clear handover, and support after launch.',
  '4+',
  '4+ Years Experience',
  '/uploads/profile.webp'
on conflict (id) do nothing;

update public.about_me a
set full_name    = coalesce(nullif(a.full_name, ''), s.owner_name),
    role         = coalesce(nullif(a.role, ''), s.role),
    location     = coalesce(nullif(a.location, ''), s.address),
    email        = coalesce(nullif(a.email, ''), s.contact_email),
    skills       = case when a.skills = '[]'::jsonb then s.marquee_items else a.skills end,
    social_links = case when a.social_links = '[]'::jsonb then s.social_links else a.social_links end
from public.site_settings s
where s.id = 1 and a.id = 1;

-- Editable quote card shown inside the Results section (falls back to the
-- featured testimonial when empty).
alter table public.site_settings add column if not exists about_quote text not null default '';
alter table public.site_settings add column if not exists about_quote_author text not null default '';

create table if not exists public.dashboard_state (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- rate_limits (fixed window counter, used by server via service role only)
-- -----------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key           text primary key,
  window_start  timestamptz not null default now(),
  count         integer not null default 0
);

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case
                  when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
                  else r.count + 1
                end,
        window_start = case
                  when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
                  else r.window_start
                end
  returning count into v_count;

  delete from public.rate_limits where window_start < now() - interval '1 day';

  return v_count <= p_limit;
end;
$$;

-- -----------------------------------------------------------------------------
-- create_booking: atomic insert called by the server (service role) AFTER the
-- server has recomputed and validated the slot. Serialises bookings for the same
-- local day, enforces blocked dates + max bookings per day, and lets the unique
-- index / exclusion constraint reject double bookings (SQLSTATE 23505 / 23P01).
-- -----------------------------------------------------------------------------
create or replace function public.create_booking(p jsonb)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.booking_settings;
  v_start    timestamptz := (p ->> 'start_time_utc')::timestamptz;
  v_end      timestamptz := (p ->> 'end_time_utc')::timestamptz;
  v_day      date;
  v_count    integer;
  v_row      public.bookings;
begin
  select * into v_settings from public.booking_settings where id = 1;
  v_day := (v_start at time zone v_settings.timezone)::date;

  perform pg_advisory_xact_lock(hashtext('booking-day:' || v_day::text));

  if exists (select 1 from public.blocked_dates where date = v_day) then
    raise exception 'DATE_BLOCKED' using errcode = 'P0001';
  end if;

  select count(*) into v_count
  from public.bookings
  where status <> 'cancelled'
    and (start_time_utc at time zone v_settings.timezone)::date = v_day;

  if v_count >= v_settings.max_bookings_per_day then
    raise exception 'DAY_FULL' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.bookings
    where status <> 'cancelled'
      and tstzrange(start_time_utc - make_interval(mins => v_settings.buffer_minutes),
                    end_time_utc + make_interval(mins => v_settings.buffer_minutes), '[)')
          && tstzrange(v_start, v_end, '[)')
  ) then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end if;

  insert into public.bookings (
    reference_code, client_name, email, phone, service_id, project_type, budget_range,
    timeline_needed, project_description, reference_links, attachment_path, client_timezone,
    start_time_utc, end_time_utc, status, meeting_link, manage_token_hash
  ) values (
    p ->> 'reference_code',
    p ->> 'client_name',
    p ->> 'email',
    coalesce(p ->> 'phone', ''),
    nullif(p ->> 'service_id', '')::uuid,
    p ->> 'project_type',
    coalesce(p ->> 'budget_range', ''),
    coalesce(p ->> 'timeline_needed', ''),
    p ->> 'project_description',
    coalesce(p -> 'reference_links', '[]'::jsonb),
    coalesce(p ->> 'attachment_path', ''),
    coalesce(p ->> 'client_timezone', v_settings.timezone),
    v_start,
    v_end,
    case when v_settings.auto_confirm then 'confirmed'::public.booking_status else 'pending'::public.booking_status end,
    v_settings.meeting_link_default,
    p ->> 'manage_token_hash'
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- Only the server (service_role) may call these functions.
revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.create_booking(jsonb) from public, anon, authenticated;
-- -----------------------------------------------------------------------------
-- reschedule_booking: atomically move a pending/confirmed booking to a new slot.
-- Same guards as create_booking (blocked day, daily cap, buffer overlap) while
-- excluding the booking itself, and clears reminder_sent_at so the client gets
-- a fresh reminder for the new time.
-- -----------------------------------------------------------------------------
create or replace function public.reschedule_booking(p_booking_id uuid, p_start timestamptz, p_end timestamptz)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.booking_settings;
  v_booking  public.bookings;
  v_day      date;
  v_count    integer;
begin
  select * into v_settings from public.booking_settings where id = 1;

  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_booking.status not in ('pending', 'confirmed') then
    raise exception 'NOT_ACTIVE' using errcode = 'P0001';
  end if;

  v_day := (p_start at time zone v_settings.timezone)::date;
  perform pg_advisory_xact_lock(hashtext('booking-day:' || v_day::text));

  if exists (select 1 from public.blocked_dates where date = v_day) then
    raise exception 'DATE_BLOCKED' using errcode = 'P0001';
  end if;

  select count(*) into v_count
  from public.bookings
  where status <> 'cancelled'
    and id <> p_booking_id
    and (start_time_utc at time zone v_settings.timezone)::date = v_day;

  if v_count >= v_settings.max_bookings_per_day then
    raise exception 'DAY_FULL' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.bookings
    where status <> 'cancelled'
      and id <> p_booking_id
      and tstzrange(start_time_utc - make_interval(mins => v_settings.buffer_minutes),
                    end_time_utc + make_interval(mins => v_settings.buffer_minutes), '[)')
          && tstzrange(p_start, p_end, '[)')
  ) then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end if;

  update public.bookings
  set start_time_utc = p_start,
      end_time_utc = p_end,
      reminder_sent_at = null
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- Only the server (service_role) may call these functions.
revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.create_booking(jsonb) from public, anon, authenticated;
revoke all on function public.reschedule_booking(uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
grant execute on function public.create_booking(jsonb) to service_role;
grant execute on function public.reschedule_booking(uuid, timestamptz, timestamptz) to service_role;

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'projects', 'project_images', 'services', 'process_steps', 'testimonials',
    'faqs', 'availability_rules', 'blocked_dates', 'booking_settings', 'bookings',
    'email_templates', 'dashboard_state', 'redirects', 'about_me'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
--   * Public (anon) can only READ published content + site settings.
--   * Bookings are inserted only by the server (service_role bypasses RLS).
--   * Only admins (rows in public.admins) can write anything.
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'admins', 'site_settings', 'projects', 'project_images', 'services', 'process_steps',
    'testimonials', 'faqs', 'availability_rules', 'blocked_dates', 'booking_settings',
    'bookings', 'email_templates', 'dashboard_state', 'rate_limits', 'signup_allowlist',
    'redirects', 'about_me'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

-- Published content: public read, admin full access.
do $$
declare
  t text;
begin
  foreach t in array array['projects', 'services', 'process_steps', 'testimonials', 'faqs']
  loop
    execute format('drop policy if exists "public read published" on public.%I', t);
    execute format(
      'create policy "public read published" on public.%I for select to anon, authenticated using (is_published or public.is_admin())',
      t
    );
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format(
      'create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t
    );
  end loop;
end;
$$;

-- project_images follow their project's published flag.
drop policy if exists "public read published" on public.project_images;
create policy "public read published" on public.project_images
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.projects p where p.id = project_id and p.is_published)
  );
drop policy if exists "admin write" on public.project_images;
create policy "admin write" on public.project_images
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- site_settings: public read, admin write.
drop policy if exists "public read" on public.site_settings;
create policy "public read" on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists "admin write" on public.site_settings;
create policy "admin write" on public.site_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Admin-only tables (no public access at all; server uses service_role where needed).
do $$
declare
  t text;
begin
  foreach t in array array[
    'availability_rules', 'blocked_dates', 'booking_settings', 'bookings',
    'email_templates', 'dashboard_state'
  ]
  loop
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format(
      'create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t
    );
  end loop;
end;
$$;

-- redirects: anyone may read active rules (the proxy looks them up per request),
-- only admins can write them.
drop policy if exists "public read active" on public.redirects;
create policy "public read active" on public.redirects
  for select to anon, authenticated using (is_active or public.is_admin());
drop policy if exists "admin write" on public.redirects;
create policy "admin write" on public.redirects
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- about_me: public read, admin write (same shape as site_settings).
drop policy if exists "public read" on public.about_me;
create policy "public read" on public.about_me
  for select to anon, authenticated using (true);
drop policy if exists "admin write" on public.about_me;
create policy "admin write" on public.about_me
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- admins: an admin can read only their own row. Rows are added manually via SQL.
drop policy if exists "self read" on public.admins;
create policy "self read" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- rate_limits / signup_allowlist: no policies -> only service_role can touch them.
revoke all on public.rate_limits from anon, authenticated;
revoke all on public.signup_allowlist from anon, authenticated;

-- -----------------------------------------------------------------------------
-- STORAGE
--   site-media           : public bucket for site images (images only, 5 MB)
--   booking-attachments  : private bucket for client uploads (images/PDF, 5 MB)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-media', 'site-media', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'application/pdf']),
  ('booking-attachments', 'booking-attachments', false, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site-media public read" on storage.objects;
create policy "site-media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-media');

drop policy if exists "site-media admin insert" on storage.objects;
create policy "site-media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site-media admin update" on storage.objects;
create policy "site-media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site-media admin delete" on storage.objects;
create policy "site-media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "booking-attachments admin read" on storage.objects;
create policy "booking-attachments admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'booking-attachments' and public.is_admin());

drop policy if exists "booking-attachments admin delete" on storage.objects;
create policy "booking-attachments admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'booking-attachments' and public.is_admin());

-- =============================================================================
-- SEED DATA (safe to re-run)
-- =============================================================================

insert into public.site_settings (
  id, site_name, owner_name, role, tagline, hero_intro, hero_line_1, hero_line_2,
  header_cta_label, header_cta_href, nav_links, marquee_items, about_heading, about_text,
  about_stats, contact_email, address, social_links, footer_text, seo_title, seo_description,
  default_currency
) values (
  1,
  'Adrito',
  'Adrito Ashraf',
  'Full Stack Developer',
  'Delivered in weeks. Websites, ERP and HR systems built around how your business actually works — fixed price, full source code, free 15-minute call to start.',
  'Full Stack Developer',
  'WEBSITES &',
  'SOFTWARE',
  'Book a Free 15-Min Call',
  '/book',
  '[{"label":"Home","href":"#home"},{"label":"About","href":"#about"},{"label":"Portfolio","href":"#portfolio"},{"label":"Services","href":"#services"},{"label":"Testimonials","href":"#testimonials"}]'::jsonb,
  '["Next.js","React","TypeScript","Node.js","PostgreSQL","Supabase","Tailwind CSS","Three.js"]'::jsonb,
  '{"accent":"Build The Idea,","strong":"Ship The Product. I Design And Develop Websites, SaaS And Business Software That Deliver","muted":"Real Results For Real Businesses."}'::jsonb,
  'From a single landing page to a complete ERP, I handle design, development and deployment end to end.',
  '[{"value":"4+","label":"Production systems delivered for real businesses."},{"value":"100%","label":"Projects delivered with full source code and handover."},{"value":"3X","label":"Faster internal workflows after replacing manual work."}]'::jsonb,
  '',
  'Dhaka, Bangladesh',
  '[{"platform":"github","url":""},{"platform":"linkedin","url":""},{"platform":"facebook","url":""},{"platform":"x","url":""}]'::jsonb,
  'Freelance full stack developer building websites, SaaS and business software.',
  'Adrito Ashraf — Full Stack Developer',
  'Freelance full stack developer from Bangladesh building websites, SaaS, ERP and HR systems. Book a meeting to discuss your project.',
  'USD'
)
on conflict (id) do nothing;

update public.site_settings
set section_texts = '{
  "portfolio":    {"tag":"Portfolio","accent":"","strong":"","muted":"","description":"Selected work for real businesses."},
  "services":     {"tag":"Services","accent":"Websites, SaaS,","strong":"ERP And HR Systems Built Around How Your Business","muted":"Actually Works.","description":"Every project starts with a short meeting so I understand your goals before quoting."},
  "process":      {"tag":"How I Work","accent":"From First Call","strong":"To Launch In Five","muted":"Clear Steps.","description":""},
  "testimonials": {"tag":"Trusted Feedback","accent":"Real Clients,","strong":"Real Results. Here Is What They Say About","muted":"Working Together.","description":""},
  "booking":      {"tag":"Book a Call","accent":"Book A 15 Min Call,","strong":"Tell Me About Your Project And","muted":"Get A Clear Plan.","description":"Fill in a short form and pick a time that suits you. I prepare before we talk, so the call is focused on your project."},
  "faq":          {"tag":"Frequently Asked Questions","accent":"Questions?","strong":"Here Are The Answers Clients","muted":"Usually Need.","description":""}
}'::jsonb
where id = 1 and section_texts = '{}'::jsonb;

insert into public.booking_settings (
  id, slot_duration_minutes, buffer_minutes, max_bookings_per_day, min_notice_hours,
  max_days_ahead, cancel_notice_hours, timezone, meeting_link_default, auto_confirm
) values (1, 30, 15, 4, 12, 30, 12, 'Asia/Dhaka', 'https://meet.google.com/your-meet-link', false)
on conflict (id) do nothing;

-- Default availability: Sunday - Thursday, 10:00-13:00 and 16:00-20:00 (Asia/Dhaka).
insert into public.availability_rules (weekday, start_time, end_time, is_active)
select d.weekday, w.start_time, w.end_time, true
from (values (0), (1), (2), (3), (4)) as d(weekday)
cross join (values ('10:00'::time, '13:00'::time), ('16:00'::time, '20:00'::time)) as w(start_time, end_time)
where not exists (select 1 from public.availability_rules);

insert into public.projects (
  title, title_accent, slug, short_description, problem, solution, features, tech_stack, tags,
  duration, role, card_theme, sort_order, is_published
) values
(
  'Cycle Shop', 'Platform', 'cycle-shop-platform',
  'E-commerce store for bicycles and parts with online servicing bookings and a full management dashboard.',
  'The shop sold only in person and managed repair bookings over phone calls and a paper diary, which caused double bookings and lost sales.',
  'A storefront with cart and checkout, a servicing booking flow with time slots, and an admin dashboard for products, orders, stock and repair jobs.',
  '["Product catalog with variants","Cart and checkout","Servicing booking with time slots","Order and stock management","Admin dashboard with sales reports"]'::jsonb,
  '["Next.js","TypeScript","Tailwind CSS","PostgreSQL"]'::jsonb,
  '["E-commerce","Booking","Dashboard","Inventory"]'::jsonb,
  '2 months', 'Full stack developer', 'sky', 1, true
),
(
  'HR Management', 'Software', 'hr-management-software',
  'Complete HR system covering employees, attendance, leave, payroll and reports.',
  'Employee records, attendance and payroll lived in scattered files and notebooks, making monthly payroll slow and error-prone.',
  'A central HR platform with role-based access, attendance tracking, leave approvals and automated payroll calculation.',
  '["Employee profiles and documents","Attendance and shift tracking","Leave requests and approvals","Payroll with payslips","Role-based access control"]'::jsonb,
  '["React","Node.js","TypeScript","PostgreSQL"]'::jsonb,
  '["HRM","Payroll","Attendance","Reports"]'::jsonb,
  '3 months', 'Full stack developer', 'holo', 2, true
),
(
  'ERP', 'Software', 'erp-software',
  'ERP for purchasing, inventory, sales and accounting in one connected system.',
  'Separate tools for sales, purchasing and accounts meant data was re-entered many times and reports never matched.',
  'A modular ERP where purchases, stock, sales and ledgers share one database, with real-time dashboards for management.',
  '["Purchase and supplier management","Multi-warehouse inventory","Sales, invoices and returns","Accounting ledgers","Management dashboards"]'::jsonb,
  '["Next.js","Node.js","TypeScript","PostgreSQL"]'::jsonb,
  '["ERP","Inventory","Accounting","Analytics"]'::jsonb,
  '4 months', 'Full stack developer', 'aurum', 3, true
),
(
  'Engineering & Construction', 'Website', 'engineering-construction-website',
  'Corporate website for an engineering and construction company with projects showcase and enquiry forms.',
  'The company had no professional online presence to show completed projects to new clients and tender partners.',
  'A fast, SEO-friendly corporate site with a filterable project portfolio, service pages and lead-capture forms.',
  '["Project portfolio with galleries","Service pages","Enquiry and quote forms","SEO and performance optimized","Content managed by admin"]'::jsonb,
  '["Next.js","Tailwind CSS","TypeScript"]'::jsonb,
  '["Corporate","Portfolio","SEO","Lead Capture"]'::jsonb,
  '1 month', 'Full stack developer', 'peach', 4, true
)
on conflict (slug) do nothing;

insert into public.services (
  title, slug, description, includes, timeline, price_usd, price_bdt, icon, sort_order, is_published
) values
(
  'Website Development', 'website-development',
  'Fast, responsive and SEO-ready websites for businesses, portfolios and companies.',
  '["Custom responsive design","Admin panel to edit content","SEO and performance setup","Contact or booking forms","Deployment and handover"]'::jsonb,
  '2 - 4 weeks', 300, 35000, 'globe', 1, true
),
(
  'SaaS Development', 'saas-development',
  'Subscription software products from MVP to production, built to scale.',
  '["Product planning and MVP scope","User accounts and roles","Billing and subscriptions","Admin dashboard","Cloud deployment"]'::jsonb,
  '6 - 12 weeks', 1500, 175000, 'layers', 2, true
),
(
  'ERP & HR Systems', 'erp-hr-systems',
  'Business software for inventory, accounting, HR, attendance and payroll.',
  '["Requirement analysis","Custom modules for your workflow","Role-based access","Reports and dashboards","Training and support"]'::jsonb,
  '8 - 16 weeks', 2000, 230000, 'building', 3, true
),
(
  'Custom Software', 'custom-software',
  'Anything else your business needs: integrations, internal tools and automation.',
  '["Discovery call","Technical proposal","Iterative development","Testing and QA","Maintenance options"]'::jsonb,
  'Depends on scope', 500, 60000, 'code', 4, true
)
on conflict (slug) do nothing;

insert into public.process_steps (title, description, sort_order, is_published)
select v.title, v.description, v.sort_order, true
from (values
  ('Discovery', 'You fill in the booking form and we meet to understand your goals, users and budget.', 1),
  ('Proposal', 'I send a clear scope, timeline and fixed price so you know exactly what you get.', 2),
  ('Design', 'I design the key screens and get your feedback before writing production code.', 3),
  ('Development', 'I build in small milestones with regular demos so you can see progress every week.', 4),
  ('Launch & Support', 'I deploy, hand over the source code and stay available for fixes and improvements.', 5)
) as v(title, description, sort_order)
where not exists (select 1 from public.process_steps);

insert into public.faqs (question, answer, sort_order, is_published)
select v.question, v.answer, v.sort_order, true
from (values
  ('What kind of projects do you take?', 'Websites, SaaS products, ERP and HR systems, and custom business software. If you are not sure, book a call and we will figure it out together.', 1),
  ('How much does a project cost?', 'Each service shows a starting price. The final price depends on scope, which we agree on before any work starts.', 2),
  ('How long does a project take?', 'A website usually takes 2 to 4 weeks. SaaS and ERP systems take longer. You get a timeline in the proposal.', 3),
  ('Do I get the source code?', 'Yes. You receive the full source code, deployment access and documentation at handover.', 4),
  ('What happens in the meeting?', 'I first understand your project, then explain a solution and timeline, and finally discuss pricing.', 5),
  ('Do you use AI tools while building?', 'Yes. I use AI coding agents to speed up development, but I own the planning, architecture, testing and delivery. You get faster turnaround, a tested product, and full source code — and I''m accountable for the result.', 6),
  ('What if I need changes after launch?', 'Every project includes a support window after launch for fixes. Bigger changes or new features are quoted separately — always with a fixed price agreed before work starts.', 7),
  ('Can we talk in Bangla?', 'Yes. Calls, messages and documentation can be in Bangla or English — whichever is easier for you.', 8)
) as v(question, answer, sort_order)
where not exists (select 1 from public.faqs);

insert into public.faqs (question, answer, sort_order, is_published)
select v.question, v.answer, v.sort_order, true
from (values
  ('What if I need changes after launch?', 'Every project includes a support window after launch for fixes. Bigger changes or new features are quoted separately — always with a fixed price agreed before work starts.', 90),
  ('Can we talk in Bangla?', 'Yes. Calls, messages and documentation can be in Bangla or English — whichever is easier for you.', 91)
) as v(question, answer, sort_order)
where not exists (select 1 from public.faqs f where f.question = v.question);

insert into public.dashboard_state (key, value)
values ('quick_setup', '{"dismissed": false}'::jsonb)
on conflict (key) do nothing;

-- Email templates. Available variables:
-- {{client_name}} {{client_email}} {{client_phone}} {{reference_code}} {{service}}
-- {{project_type}} {{budget_range}} {{timeline_needed}} {{project_description}}
-- {{reference_links}} {{date_client}} {{time_client}} {{client_timezone}}
-- {{date_admin}} {{time_admin}} {{admin_timezone}} {{meeting_link}} {{manage_link}}
-- {{owner_name}} {{site_url}}
insert into public.email_templates (type, subject, body_html, body_text) values
(
  'booking_received_client',
  'We received your booking request ({{reference_code}})',
  '<p>Hi {{client_name}},</p><p>Thanks for booking a meeting. I have received your request for <strong>{{date_client}} at {{time_client}}</strong> ({{client_timezone}}). I will confirm it shortly.</p><p><strong>Agenda</strong></p><ol><li>I understand your project</li><li>Solution and timeline</li><li>Pricing</li></ol><p>Reference: <strong>{{reference_code}}</strong></p><p>Need to change something? <a href="{{manage_link}}">Manage your booking</a></p><p>{{owner_name}}</p>',
  'Hi {{client_name}},

Thanks for booking a meeting. I have received your request for {{date_client}} at {{time_client}} ({{client_timezone}}). I will confirm it shortly.

Agenda
1. I understand your project
2. Solution and timeline
3. Pricing

Reference: {{reference_code}}
Manage your booking: {{manage_link}}

{{owner_name}}'
),
(
  'booking_confirmed_client',
  'Your meeting is confirmed: {{date_client}} at {{time_client}}',
  '<p>Hi {{client_name}},</p><p>Your meeting is confirmed for <strong>{{date_client}} at {{time_client}}</strong> ({{client_timezone}}).</p><p>Google Meet: <a href="{{meeting_link}}">{{meeting_link}}</a></p><p><strong>Agenda</strong></p><ol><li>I understand your project</li><li>Solution and timeline</li><li>Pricing</li></ol><p>Reference: <strong>{{reference_code}}</strong></p><p><a href="{{manage_link}}">Reschedule or cancel</a></p><p>See you soon,<br>{{owner_name}}</p>',
  'Hi {{client_name}},

Your meeting is confirmed for {{date_client}} at {{time_client}} ({{client_timezone}}).

Google Meet: {{meeting_link}}

Agenda
1. I understand your project
2. Solution and timeline
3. Pricing

Reference: {{reference_code}}
Reschedule or cancel: {{manage_link}}

See you soon,
{{owner_name}}'
),
(
  'booking_admin_notification',
  'New booking: {{client_name}} — {{service}} ({{date_admin}} {{time_admin}})',
  '<h2>New booking {{reference_code}}</h2><p><strong>When:</strong> {{date_admin}} {{time_admin}} ({{admin_timezone}}) — client: {{date_client}} {{time_client}} ({{client_timezone}})</p><p><strong>Name:</strong> {{client_name}}<br><strong>Email:</strong> {{client_email}}<br><strong>Phone/WhatsApp:</strong> {{client_phone}}</p><p><strong>Service:</strong> {{service}}<br><strong>Project type:</strong> {{project_type}}<br><strong>Budget:</strong> {{budget_range}}<br><strong>Needed by:</strong> {{timeline_needed}}</p><p><strong>Description:</strong><br>{{project_description}}</p><p><strong>References:</strong><br>{{reference_links}}</p><p><a href="{{site_url}}/admin/bookings">Open in admin</a></p>',
  'New booking {{reference_code}}

When: {{date_admin}} {{time_admin}} ({{admin_timezone}}) / client: {{date_client}} {{time_client}} ({{client_timezone}})

Name: {{client_name}}
Email: {{client_email}}
Phone/WhatsApp: {{client_phone}}

Service: {{service}}
Project type: {{project_type}}
Budget: {{budget_range}}
Needed by: {{timeline_needed}}

Description:
{{project_description}}

References:
{{reference_links}}

Open in admin: {{site_url}}/admin/bookings'
),
(
  'reminder_client',
  'Reminder: our meeting is tomorrow at {{time_client}}',
  '<p>Hi {{client_name}},</p><p>This is a reminder that our meeting is on <strong>{{date_client}} at {{time_client}}</strong> ({{client_timezone}}).</p><p>Google Meet: <a href="{{meeting_link}}">{{meeting_link}}</a></p><p><strong>Agenda</strong></p><ol><li>I understand your project</li><li>Solution and timeline</li><li>Pricing</li></ol><p><a href="{{manage_link}}">Reschedule or cancel</a></p><p>{{owner_name}}</p>',
  'Hi {{client_name}},

This is a reminder that our meeting is on {{date_client}} at {{time_client}} ({{client_timezone}}).

Google Meet: {{meeting_link}}

Agenda
1. I understand your project
2. Solution and timeline
3. Pricing

Reschedule or cancel: {{manage_link}}

{{owner_name}}'
),
(
  'cancelled_client',
  'Your meeting has been cancelled ({{reference_code}})',
  '<p>Hi {{client_name}},</p><p>Your meeting on <strong>{{date_client}} at {{time_client}}</strong> ({{client_timezone}}) has been cancelled.</p><p>You can book a new time any time at <a href="{{site_url}}/book">{{site_url}}/book</a>.</p><p>{{owner_name}}</p>',
  'Hi {{client_name}},

Your meeting on {{date_client}} at {{time_client}} ({{client_timezone}}) has been cancelled.

You can book a new time at {{site_url}}/book

{{owner_name}}'
),
(
  'cancelled_admin',
  'Booking cancelled: {{client_name}} ({{reference_code}})',
  '<p>The booking <strong>{{reference_code}}</strong> with {{client_name}} on {{date_admin}} {{time_admin}} ({{admin_timezone}}) was cancelled.</p>',
  'The booking {{reference_code}} with {{client_name}} on {{date_admin}} {{time_admin}} ({{admin_timezone}}) was cancelled.'
),
(
  'rescheduled_client',
  'Your meeting has moved to {{date_client}} at {{time_client}}',
  '<p>Hi {{client_name}},</p><p>Your meeting is now on <strong>{{date_client}} at {{time_client}}</strong> ({{client_timezone}}).</p><p>Google Meet: <a href="{{meeting_link}}">{{meeting_link}}</a></p><p><a href="{{manage_link}}">Manage your booking</a></p><p>{{owner_name}}</p>',
  'Hi {{client_name}},

Your meeting is now on {{date_client}} at {{time_client}} ({{client_timezone}}).

Google Meet: {{meeting_link}}
Manage your booking: {{manage_link}}

{{owner_name}}'
),
(
  'rescheduled_admin',
  'Booking rescheduled: {{client_name}} ({{reference_code}})',
  '<p>The booking <strong>{{reference_code}}</strong> with {{client_name}} moved to {{date_admin}} {{time_admin}} ({{admin_timezone}}).</p>',
  'The booking {{reference_code}} with {{client_name}} moved to {{date_admin}} {{time_admin}} ({{admin_timezone}}).'
)
on conflict (type) do nothing;

-- =============================================================================
-- AFTER RUNNING THIS FILE: make yourself an admin (or just run `npm run setup:supabase`).
-- 1. Allow your email (lowercase):
--      insert into public.signup_allowlist (email) values ('you@example.com') on conflict do nothing;
-- 2. Supabase Dashboard -> Authentication -> Users -> "Add user" (email + password,
--    tick "Auto Confirm User").
-- 3. Run (replace the email):
--
--    insert into public.admins (user_id, email, name)
--    select id, email, 'Adrito Ashraf' from auth.users where email = 'you@example.com'
--    on conflict (user_id) do nothing;
-- =============================================================================

-- =============================================================================
-- LANDING PAGES (free gift lead magnets)
-- =============================================================================

-- landing_pages: reusable lead-magnet pages served at /<slug>. Only the
-- "free_gift" type exists today; more types can be added later.
create table if not exists public.landing_pages (
  id            uuid primary key default gen_random_uuid(),
  type          text not null default 'free_gift' check (type in ('free_gift')),
  internal_name text not null default '',
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status        text not null default 'draft' check (status in ('draft','published')),
  pill_text     text not null default 'Free Gift',
  heading       jsonb not null default '{}'::jsonb,          -- {accent, strong, muted}
  subheadline   text not null default '',
  bullets       text[] not null default '{}',
  audience_line text not null default '',
  cover_image   text not null default '',
  cover_tag     text not null default '100% Free',
  cta_label     text not null default '',
  privacy_line  text not null default '',
  form_embed    text not null default '',                    -- pasted Reach embed code / form id
  gift_type     text not null default 'pdf' check (gift_type in ('pdf','link','video')),
  gift_file     text not null default '',                    -- private storage path
  gift_url      text not null default '',                    -- external link (Drive/YouTube/Notion)
  thank_you_title text not null default '',
  thank_you_text  text not null default '',
  next_step_label text not null default '',
  next_step_href  text not null default '',
  seo_title       text not null default '',
  seo_description text not null default '',
  og_image      text not null default '',
  view_count      bigint not null default 0,
  thankyou_count  bigint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists landing_pages_status_idx on public.landing_pages (status, slug);

-- landing_page_events: one row per tracked visit (view / thank-you hit) with
-- the visitor's campaign attribution copied from their utm_* cookies.
create table if not exists public.landing_page_events (
  id           uuid primary key default gen_random_uuid(),
  page_id      uuid not null references public.landing_pages (id) on delete cascade,
  kind         text not null check (kind in ('view','thankyou')),
  utm_source   text not null default '',
  utm_medium   text not null default '',
  utm_campaign text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists landing_page_events_page_idx on public.landing_page_events (page_id, kind);
create index if not exists landing_page_events_source_idx on public.landing_page_events (utm_source);

-- Atomic counter bump, called from /api/lp/track (service role).
create or replace function public.increment_lp_counter(p_slug text, p_kind text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_kind = 'view' then
    update public.landing_pages set view_count = view_count + 1
    where slug = p_slug and status = 'published';
  elsif p_kind = 'thankyou' then
    update public.landing_pages set thankyou_count = thankyou_count + 1
    where slug = p_slug and status = 'published';
  end if;
end $$;

alter table public.landing_pages enable row level security;
alter table public.landing_page_events enable row level security;

drop policy if exists "landing_pages public read" on public.landing_pages;
create policy "landing_pages public read" on public.landing_pages
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists "landing_pages admin write" on public.landing_pages;
create policy "landing_pages admin write" on public.landing_pages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "landing_page_events admin read" on public.landing_page_events;
create policy "landing_page_events admin read" on public.landing_page_events
  for select to authenticated
  using (public.is_admin());

drop trigger if exists landing_pages_updated_at on public.landing_pages;
create trigger landing_pages_updated_at before update on public.landing_pages
  for each row execute function public.set_updated_at();

-- =============================================================================
-- CONTACTS (leads)
--   * source = 'form'   -> submitted through a gift-page signup form (/api/lp/subscribe, service role)
--   * source = 'manual' -> added by the admin from /admin/contacts
-- =============================================================================
create table if not exists public.contacts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default '',
  email        text not null unique check (email = lower(email)),
  phone        text not null default '',
  source       text not null default 'manual' check (source in ('form','manual')),
  page_id      uuid references public.landing_pages (id) on delete set null,
  page_slug    text not null default '',                    -- kept even if the page is deleted
  utm_source   text not null default '',
  utm_medium   text not null default '',
  utm_campaign text not null default '',
  notes        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists contacts_source_idx on public.contacts (source, created_at desc);
create index if not exists contacts_page_idx on public.contacts (page_id);

alter table public.contacts enable row level security;

drop policy if exists "contacts admin all" on public.contacts;
create policy "contacts admin all" on public.contacts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists contacts_updated_at on public.contacts;
create trigger contacts_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();
