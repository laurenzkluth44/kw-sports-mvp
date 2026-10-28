-- Internal squad roster per club.
--
-- Privacy promise: a club's roster is visible ONLY to that club's own users.
-- There is deliberately no policy for admins or agencies, and no audit trigger
-- (audit_logs are readable by admins, so roster data must never be copied there).
-- The service role (server-side admin client) bypasses RLS; the app never uses it
-- for roster data. Club deletion cascades to its roster.

create table public.roster_players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  jersey_number smallint,
  position public.attack_position not null,
  secondary_positions public.attack_position[] not null default '{}',
  defense_positions smallint[] not null default '{}',
  contract_until date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roster_players_first_name_valid check (length(trim(first_name)) between 1 and 80),
  constraint roster_players_last_name_valid check (length(trim(last_name)) between 1 and 80),
  constraint roster_players_jersey_valid check (jersey_number is null or jersey_number between 0 and 99),
  constraint roster_players_secondary_not_main check (not (position = any (secondary_positions))),
  constraint roster_players_defense_valid check (defense_positions <@ array[1, 2, 3, 4, 5, 6]::smallint[]),
  constraint roster_players_contract_valid check (contract_until between date '2000-01-01' and date '2100-12-31'),
  constraint roster_players_notes_valid check (notes is null or length(notes) <= 2000)
);

create index roster_players_club_id_idx on public.roster_players (club_id);

create trigger set_roster_players_updated_at
before update on public.roster_players
for each row execute function public.set_updated_at();

alter table public.roster_players enable row level security;
alter table public.roster_players force row level security;

revoke all on table public.roster_players from anon;

create policy "Club users can view own roster"
on public.roster_players
for select
to authenticated
using (public.current_user_role() = 'club' and club_id = public.current_user_club_id());

create policy "Club users can add to own roster"
on public.roster_players
for insert
to authenticated
with check (public.current_user_role() = 'club' and club_id = public.current_user_club_id());

create policy "Club users can update own roster"
on public.roster_players
for update
to authenticated
using (public.current_user_role() = 'club' and club_id = public.current_user_club_id())
with check (public.current_user_role() = 'club' and club_id = public.current_user_club_id());

create policy "Club users can delete from own roster"
on public.roster_players
for delete
to authenticated
using (public.current_user_role() = 'club' and club_id = public.current_user_club_id());
