alter type public.app_role add value if not exists 'agency';

alter table public.users
add column if not exists agency_name text;

alter table public.users
drop constraint if exists club_users_need_a_club,
drop constraint if exists admins_are_not_bound_to_clubs,
drop constraint if exists non_club_users_are_not_bound_to_clubs,
drop constraint if exists agency_users_need_agency_name,
drop constraint if exists non_agency_users_have_no_agency_name;

alter table public.users
add constraint club_users_need_a_club check (role::text <> 'club' or club_id is not null),
add constraint non_club_users_are_not_bound_to_clubs check (role::text = 'club' or club_id is null),
add constraint agency_users_need_agency_name check (
  role::text <> 'agency' or (agency_name is not null and length(trim(agency_name)) > 0)
),
add constraint non_agency_users_have_no_agency_name check (role::text = 'agency' or agency_name is null);

create or replace function public.is_agency()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role()::text = 'agency', false);
$$;

grant execute on function public.is_agency() to authenticated;

drop policy if exists "Agencies can view clubs" on public.clubs;
create policy "Agencies can view clubs"
on public.clubs
for select
to authenticated
using (public.is_agency());

drop policy if exists "Agencies can view player needs" on public.player_needs;
create policy "Agencies can view player needs"
on public.player_needs
for select
to authenticated
using (public.is_agency());
