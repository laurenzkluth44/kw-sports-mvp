-- KW Sports player database + matching of KW players to club needs.
--
-- Who sees what (enforced here, covered by supabase/tests/access.sql):
--   * KW admins: everything.
--   * Clubs: only KW players that KW has released ("freigegeben") for one of the club's
--     own needs, and only while the player is released for clubs. Never the whole database.
--   * Agencies: nothing in this migration (no policies).
-- Clubs answer a suggestion only through respond_to_need_match(), which can change
-- nothing but the answer and the note.

create table public.kw_players (
  id uuid primary key default gen_random_uuid(),
  kind public.need_type not null default 'spieler',
  first_name text not null,
  last_name text not null,
  birth_date date,
  nationality text,
  attack_positions public.attack_position[] not null default '{}',
  defense_positions smallint[] not null default '{}',
  coach_roles text[] not null default '{}',
  handedness text,
  height_cm smallint,
  current_club text,
  current_league text,
  contract_until date,
  available_from date,
  languages text[] not null default '{}',
  player_types text[] not null default '{}',
  league_experience text,
  profile text,
  video_url text,
  photo_path text,
  cv_path text,
  -- A player may only be shown to clubs after agreeing to it.
  consent_at date,
  visible_to_clubs boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kw_players_first_name_valid check (length(trim(first_name)) between 1 and 80),
  constraint kw_players_last_name_valid check (length(trim(last_name)) between 1 and 80),
  constraint kw_players_defense_valid check (defense_positions <@ array[1, 2, 3, 4, 5, 6]::smallint[]),
  constraint kw_players_handedness_valid check (handedness is null or handedness in ('links', 'rechts', 'beidhaendig')),
  constraint kw_players_height_valid check (height_cm is null or height_cm between 140 and 230),
  constraint kw_players_profile_valid check (profile is null or length(profile) <= 2000),
  constraint kw_players_video_valid check (video_url is null or video_url ~ '^https://'),
  constraint kw_players_release_needs_consent check (not visible_to_clubs or consent_at is not null)
);

create index kw_players_attack_positions_idx on public.kw_players using gin (attack_positions);
create index kw_players_visible_idx on public.kw_players (visible_to_clubs);

create trigger set_kw_players_updated_at
before update on public.kw_players
for each row execute function public.set_updated_at();

create type public.need_match_status as enum ('freigegeben', 'interessiert', 'kein_interesse');

create table public.need_matches (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references public.player_needs(id) on delete cascade,
  player_id uuid not null references public.kw_players(id) on delete cascade,
  status public.need_match_status not null default 'freigegeben',
  score smallint not null default 0,
  -- Snapshot of why the engine suggested the player, shown to the club.
  reasons jsonb not null default '[]'::jsonb,
  club_note text,
  released_at timestamptz not null default now(),
  released_by uuid references public.users(id) on delete set null,
  responded_at timestamptz,
  responded_by uuid references public.users(id) on delete set null,
  -- KW-internal: set when KW has followed up on the club's answer (inbox "erledigt").
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint need_matches_unique unique (need_id, player_id),
  constraint need_matches_score_valid check (score between 0 and 100),
  constraint need_matches_note_valid check (club_note is null or length(club_note) <= 1000)
);

create index need_matches_need_id_idx on public.need_matches (need_id);
create index need_matches_player_id_idx on public.need_matches (player_id);
create index need_matches_status_idx on public.need_matches (status);

create trigger set_need_matches_updated_at
before update on public.need_matches
for each row execute function public.set_updated_at();

-- Can the signed-in club user see this KW player? (released for one of the club's needs)
create or replace function public.club_can_see_kw_player(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'club'
    and exists (
      select 1
      from public.need_matches m
      join public.player_needs n on n.id = m.need_id
      join public.kw_players p on p.id = m.player_id
      where m.player_id = target
        and n.club_id = public.current_user_club_id()
        and p.visible_to_clubs
    );
$$;

revoke execute on function public.club_can_see_kw_player(uuid) from public, anon;
grant execute on function public.club_can_see_kw_player(uuid) to authenticated;

alter table public.kw_players enable row level security;
alter table public.kw_players force row level security;
alter table public.need_matches enable row level security;
alter table public.need_matches force row level security;

revoke all on table public.kw_players from anon;
revoke all on table public.need_matches from anon;

create policy "Admins manage KW players"
on public.kw_players for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Clubs see KW players released for their needs"
on public.kw_players for select to authenticated
using (public.club_can_see_kw_player(id));

create policy "Admins manage need matches"
on public.need_matches for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Clubs see matches for their own needs"
on public.need_matches for select to authenticated
using (
  public.current_user_role() = 'club'
  and exists (
    select 1 from public.player_needs n
    join public.kw_players p on p.id = need_matches.player_id
    where n.id = need_matches.need_id
      and n.club_id = public.current_user_club_id()
      and p.visible_to_clubs
  )
);

-- Clubs answer a suggestion. Only status (interested / not interested) and the note change.
create or replace function public.respond_to_need_match(match_id uuid, answer public.need_match_status, note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if answer not in ('interessiert', 'kein_interesse') then
    raise exception 'invalid answer' using errcode = '22023';
  end if;
  if note is not null and length(note) > 1000 then
    raise exception 'note too long' using errcode = '22023';
  end if;

  update public.need_matches m
  set status = answer,
      club_note = nullif(trim(note), ''),
      responded_at = now(),
      responded_by = auth.uid(),
      handled_at = null
  from public.player_needs n, public.kw_players p
  where m.id = match_id
    and n.id = m.need_id
    and p.id = m.player_id
    and p.visible_to_clubs
    and public.current_user_role() = 'club'
    and n.club_id = public.current_user_club_id();

  if not found then
    raise exception 'match not found' using errcode = '42501';
  end if;
end;
$$;

revoke execute on function public.respond_to_need_match(uuid, public.need_match_status, text) from public, anon;
grant execute on function public.respond_to_need_match(uuid, public.need_match_status, text) to authenticated;

-- Private files: photos and CV PDFs under "<player id>/..."; read via short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kw-players', 'kw-players', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins manage KW player files" on storage.objects;
create policy "Admins manage KW player files"
on storage.objects for all to authenticated
using (bucket_id = 'kw-players' and public.is_admin())
with check (bucket_id = 'kw-players' and public.is_admin());

drop policy if exists "Clubs read files of KW players released to them" on storage.objects;
create policy "Clubs read files of KW players released to them"
on storage.objects for select to authenticated
using (
  bucket_id = 'kw-players'
  and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
  and public.club_can_see_kw_player(((storage.foldername(name))[1])::uuid)
);
