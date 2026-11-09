-- Game statistics for KW players, filled by the weekly match-day update (one row per game)
-- or by hand (one summary row covering several games, e.g. "season so far").
-- The app adds them up per season and competition and shows them on the player card.

create table if not exists public.kw_player_games (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.kw_players(id) on delete cascade,
  competition text not null check (char_length(competition) between 1 and 60),
  game_date date not null,
  -- Label like "17.10. Coburg – Dormagen" or "Saison bis 08.11.".
  game text check (game is null or char_length(game) <= 120),
  -- Number of games this row covers (1 for a single game, more for a summary row).
  games smallint not null default 1 check (games between 1 and 99),
  goals smallint check (goals >= 0),
  shots smallint check (shots >= 0),
  seven_goals smallint check (seven_goals >= 0),
  assists smallint check (assists >= 0),
  steals smallint check (steals >= 0),
  blocks smallint check (blocks >= 0),
  turnovers smallint check (turnovers >= 0),
  two_min smallint check (two_min >= 0),
  -- Handball Performance Index: average over the games of this row.
  hpi numeric(5, 1),
  saves smallint check (saves >= 0),
  goals_against smallint check (goals_against >= 0),
  source text check (source is null or char_length(source) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (player_id, competition, game_date)
);

create index if not exists kw_player_games_player_date_idx on public.kw_player_games (player_id, game_date desc);

create trigger set_kw_player_games_updated_at
before update on public.kw_player_games
for each row execute function public.set_updated_at();

alter table public.kw_player_games enable row level security;

-- KW Sports manages the numbers; a club sees them only for players suggested to it (same rule as the profile).
create policy "Admins manage KW player games"
on public.kw_player_games for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Clubs read games of players suggested to them"
on public.kw_player_games for select to authenticated
using (public.club_can_see_kw_player(player_id));

revoke all on public.kw_player_games from anon;
