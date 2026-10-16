-- =============================================================================
-- CLEANUP: member accounts + webinar members area (one-time migration)
-- =============================================================================
-- Run manually in Supabase SQL Editor (or via `supabase db query -f`).
-- Everything below was created only for the members area — nothing here is
-- used by the original site, the booking system, or the admin login.
--
-- What it drops:
--   TABLES    public.profiles, public.webinars, public.webinar_resources,
--             public.webinar_access
--   TRIGGERS  on_auth_user_created (auth.users), link_access_on_signup,
--             link_access_profile, *_updated_at on the dropped tables (dropped
--             automatically with the tables)
--   FUNCTIONS public.handle_new_profile, public.link_access_on_signup,
--             public.link_access_profile, public.has_admin_role,
--             public.has_webinar_access
--   STORAGE   leftover uploads under the "webinars/" prefix (public + private
--             buckets) — only objects the members area could have created
--   POLICIES  dropped automatically with their tables
--
-- What it KEEPS (deliberately):
--   * auth.users / Supabase Auth — the /admin login uses it. Member accounts
--     that signed up will remain as inert auth users (harmless; delete them in
--     Supabase Dashboard -> Authentication -> Users if you want them gone).
--   * public.admins, public.is_admin(), public.signup_allowlist — admin login.
--   * The signup_allowlist enforcement trigger is RESTORED at the bottom so
--     public sign-ups are blocked again (original invite-only behaviour).
-- =============================================================================

begin;

-- Tables (CASCADE removes their triggers, indexes, policies and FK edges).
drop table if exists public.webinar_access cascade;
drop table if exists public.webinar_resources cascade;
drop table if exists public.webinars cascade;
drop table if exists public.profiles cascade;

-- Triggers that live on tables outside this system.
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists link_access_on_signup on public.profiles;
drop trigger if exists link_access_profile on public.webinar_access;

-- Functions.
drop function if exists public.handle_new_profile();
drop function if exists public.link_access_on_signup();
drop function if exists public.link_access_profile();
drop function if exists public.has_admin_role();
drop function if exists public.has_webinar_access(uuid);

-- Leftover uploaded files (webinar thumbnails + resources) in both buckets.
delete from storage.objects
where name like 'webinars/%';

-- Restore invite-only sign-ups (original behaviour before the members area).
drop trigger if exists enforce_signup_allowlist on auth.users;
create trigger enforce_signup_allowlist before insert on auth.users
  for each row execute function public.enforce_signup_allowlist();

commit;
