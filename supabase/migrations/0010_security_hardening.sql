-- Security hardening (Supabase security advisor findings + review findings).

-- Trigger helper had a role-mutable search_path.
alter function public.set_updated_at() set search_path = public;

-- The role helpers are needed by RLS policies for signed-in users only.
-- Nobody who is signed out should be able to call them through the API.
revoke execute on function public.current_user_role() from public, anon;
revoke execute on function public.current_user_club_id() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_agency() from public, anon;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_club_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_agency() to authenticated;

-- Trigger functions run as part of the trigger; they never need to be callable via the API.
revoke execute on function public.audit_player_need_changes() from public, anon, authenticated;

-- Deleting an admin account must not delete the notes that admin wrote.
alter table public.admin_notes alter column admin_id drop not null;
alter table public.admin_notes drop constraint if exists admin_notes_admin_id_fkey;
alter table public.admin_notes
  add constraint admin_notes_admin_id_fkey
  foreign key (admin_id) references public.users(id) on delete set null;
