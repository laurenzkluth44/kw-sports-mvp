-- Bedarf-Profil v2 (Feedback-Runde 1), Schritt 1 von 2 (expand):
-- * Bedarf kann ein Spieler oder ein Trainer sein
-- * Mehrere Angriffspositionen + Abwehrpositionen 1-6 statt einer Position
--   (Universalspieler / Abwehrspezialist entfallen)
-- * Vorgefertigte Spielertypen, anvisierte Rolle und Sprachkenntnisse
-- * Vertrauliche Info pro Bedarf, nur für KW Sports Admins und den eigenen Verein
-- * Anzahl Agenturen für Club- und Admin-Dashboard
--
-- Rückwärtskompatibel: Die alte Spalte position bleibt bis 0009 bestehen und wird per
-- Trigger mit den neuen Spalten synchron gehalten. Die bisher deployte App läuft damit
-- weiter, bis der neue App-Stand live ist. Danach 0009 ausführen.

create type public.need_type as enum ('spieler', 'trainer');
create type public.attack_position as enum ('TW', 'LA', 'RL', 'RM', 'RR', 'RA', 'KM');

alter table public.player_needs
add column if not exists need_type public.need_type not null default 'spieler',
add column if not exists attack_positions public.attack_position[] not null default '{}',
add column if not exists defense_positions smallint[] not null default '{}',
add column if not exists coach_role text,
add column if not exists player_types text[] not null default '{}',
add column if not exists target_roles text[] not null default '{}',
add column if not exists languages text[] not null default '{}';

-- Die neue App schreibt position nicht mehr.
alter table public.player_needs alter column position drop not null;

alter table public.player_needs
add constraint player_needs_defense_positions_valid check (
  defense_positions <@ array[1, 2, 3, 4, 5, 6]::smallint[]
),
add constraint player_needs_coach_role_only_for_coaches check (
  need_type = 'trainer' or coach_role is null
);

-- Bestehende Einzelpositionen übernehmen. Universalspieler und Abwehrspezialist haben
-- keine eindeutige Position und bleiben leer, damit sie im UI zur Pflege auffallen;
-- Abwehrspezialisten behalten die Info als Spielertyp "abwehrstark".
-- Trigger aus, damit updated_at und Audit Log die Datenübernahme nicht als Nutzeränderung zeigen.
alter table public.player_needs disable trigger user;

update public.player_needs
set attack_positions = array[position::text]::public.attack_position[]
where position::text in ('TW', 'LA', 'RL', 'RM', 'RR', 'RA', 'KM');

update public.player_needs
set player_types = array['abwehrstark']
where position::text = 'Abwehrspezialist';

alter table public.player_needs enable trigger user;

-- Übergang: alte und neue App schreiben parallel. Hat sich position geändert, kommt der
-- Schreibzugriff von der alten App, sonst werden position aus den neuen Spalten abgeleitet.
create or replace function public.sync_legacy_player_need_position()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (tg_op = 'INSERT' and new.position is not null)
     or (tg_op = 'UPDATE' and new.position is distinct from old.position) then
    if new.position::text in ('TW', 'LA', 'RL', 'RM', 'RR', 'RA', 'KM') then
      new.attack_positions := array[new.position::text]::public.attack_position[];
    elsif new.position::text = 'Abwehrspezialist' and not ('abwehrstark' = any (new.player_types)) then
      new.player_types := new.player_types || 'abwehrstark';
    end if;
  elsif tg_op = 'INSERT'
     or new.attack_positions is distinct from old.attack_positions
     or new.defense_positions is distinct from old.defense_positions
     or new.need_type is distinct from old.need_type then
    new.position := case
      when new.need_type = 'trainer' then null
      when cardinality(new.attack_positions) > 0 then new.attack_positions[1]::text::public.player_need_position
      when cardinality(new.defense_positions) > 0 then 'Abwehrspezialist'::public.player_need_position
      else null
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_player_needs_legacy_position on public.player_needs;
create trigger sync_player_needs_legacy_position
before insert or update on public.player_needs
for each row execute function public.sync_legacy_player_need_position();

create index if not exists player_needs_attack_positions_idx on public.player_needs using gin (attack_positions);
create index if not exists player_needs_defense_positions_idx on public.player_needs using gin (defense_positions);

-- Vertrauliche Info: eigene Tabelle, weil RLS nur Zeilen und keine Spalten schützt.
-- Agency User haben keine Policy und sehen daher nichts.
create table if not exists public.player_need_confidential (
  player_need_id uuid primary key references public.player_needs(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_need_confidential_note_not_empty check (length(trim(note)) > 0)
);

drop trigger if exists set_player_need_confidential_updated_at on public.player_need_confidential;
create trigger set_player_need_confidential_updated_at
before update on public.player_need_confidential
for each row execute function public.set_updated_at();

alter table public.player_need_confidential enable row level security;
alter table public.player_need_confidential force row level security;

drop policy if exists "Admins can manage confidential need info" on public.player_need_confidential;
create policy "Admins can manage confidential need info"
on public.player_need_confidential
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Club users can manage own confidential need info" on public.player_need_confidential;
create policy "Club users can manage own confidential need info"
on public.player_need_confidential
for all
to authenticated
using (
  exists (
    select 1
    from public.player_needs need
    where need.id = player_need_id
      and need.club_id = public.current_user_club_id()
  )
)
with check (
  exists (
    select 1
    from public.player_needs need
    where need.id = player_need_id
      and need.club_id = public.current_user_club_id()
  )
);

-- Clubs dürfen public.users nicht lesen; die Anzahl der Agenturen gibt es nur aggregiert.
create or replace function public.agency_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct lower(trim(agency_name)))::integer
  from public.users
  where role::text = 'agency';
$$;

revoke execute on function public.agency_count() from public, anon;
grant execute on function public.agency_count() to authenticated;
