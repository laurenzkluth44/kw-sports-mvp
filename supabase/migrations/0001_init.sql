create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.app_role as enum ('admin', 'club', 'agency');
create type public.club_league as enum (
  '1. Bundesliga',
  '2. Bundesliga',
  '3. Liga',
  '3. Liga Nord-West',
  '3. Liga Nord-Ost',
  '3. Liga Süd-West',
  '3. Liga Süd',
  'Starligue',
  'Håndboldligaen',
  'Liga ASOBAL',
  'Quickline Handball League',
  'Andere'
);
create type public.season_label as enum ('2025/26', '2026/27', '2027/28', '2028/29');
create type public.player_need_position as enum (
  'TW',
  'LA',
  'RA',
  'RL',
  'RR',
  'RM',
  'KM',
  'Abwehrspezialist',
  'Universalspieler'
);
create type public.player_need_priority as enum ('hoch', 'mittel', 'niedrig');
create type public.player_need_status as enum ('offen', 'in_gespraechen', 'besetzt', 'archiviert');

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'Deutschland',
  league public.club_league not null,
  city text not null,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clubs_name_not_empty check (length(trim(name)) > 0),
  constraint clubs_city_not_empty check (length(trim(city)) > 0)
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete set null,
  name text not null,
  email citext not null unique,
  role public.app_role not null,
  agency_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_name_not_empty check (length(trim(name)) > 0),
  constraint club_users_need_a_club check (role <> 'club' or club_id is not null),
  constraint non_club_users_are_not_bound_to_clubs check (role = 'club' or club_id is null),
  constraint agency_users_need_agency_name check (
    role <> 'agency' or (agency_name is not null and length(trim(agency_name)) > 0)
  ),
  constraint non_agency_users_have_no_agency_name check (role = 'agency' or agency_name is null)
);

create table public.player_needs (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  season public.season_label not null,
  position public.player_need_position not null,
  needed_from_date date not null,
  priority public.player_need_priority not null default 'mittel',
  status public.player_need_status not null default 'offen',
  description text,
  age_min integer,
  age_max integer,
  height_min integer,
  nationality_preference text,
  league_experience text,
  player_type text,
  contract_status_preference text,
  budget_amount numeric(12, 2),
  budget_currency text,
  budget_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_needs_age_min_valid check (age_min is null or age_min between 15 and 60),
  constraint player_needs_age_max_valid check (age_max is null or age_max between 15 and 60),
  constraint player_needs_age_range_valid check (age_min is null or age_max is null or age_min <= age_max),
  constraint player_needs_height_valid check (height_min is null or height_min between 140 and 230),
  constraint player_needs_budget_valid check (budget_amount is null or budget_amount >= 0),
  constraint player_needs_budget_currency_valid check (
    budget_currency is null or budget_currency ~ '^[A-Z]{3}$'
  )
);

create index clubs_name_idx on public.clubs using gin (to_tsvector('simple', name));
create index clubs_country_idx on public.clubs (country);
create index clubs_league_idx on public.clubs (league);
create index users_club_id_idx on public.users (club_id);
create index player_needs_club_id_idx on public.player_needs (club_id);
create index player_needs_filters_idx on public.player_needs (season, position, status, priority);
create index player_needs_needed_from_date_idx on public.player_needs (needed_from_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_clubs_updated_at
before update on public.clubs
for each row execute function public.set_updated_at();

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_player_needs_updated_at
before update on public.player_needs
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.current_user_club_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select club_id from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_agency()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'agency', false);
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_club_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_agency() to authenticated;

alter table public.clubs enable row level security;
alter table public.users enable row level security;
alter table public.player_needs enable row level security;

alter table public.clubs force row level security;
alter table public.users force row level security;
alter table public.player_needs force row level security;

create policy "Admins can manage clubs"
on public.clubs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Club users can view own club"
on public.clubs
for select
to authenticated
using (id = public.current_user_club_id());

create policy "Agencies can view clubs"
on public.clubs
for select
to authenticated
using (public.is_agency());

create policy "Admins can manage users"
on public.users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view own profile"
on public.users
for select
to authenticated
using (id = auth.uid());

create policy "Admins can manage player needs"
on public.player_needs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Club users can view own player needs"
on public.player_needs
for select
to authenticated
using (club_id = public.current_user_club_id());

create policy "Agencies can view player needs"
on public.player_needs
for select
to authenticated
using (public.is_agency());

create policy "Club users can create own player needs"
on public.player_needs
for insert
to authenticated
with check (club_id = public.current_user_club_id());

create policy "Club users can update own player needs"
on public.player_needs
for update
to authenticated
using (club_id = public.current_user_club_id())
with check (club_id = public.current_user_club_id());
