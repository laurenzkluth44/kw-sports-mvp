-- Seasons were a fixed enum ending at 2028/29, so every new season needed a migration.
-- Store them as text in the "2026/27" format instead; the app offers a rolling window.

alter table public.player_needs alter column season type text using season::text;
drop type if exists public.season_label;

alter table public.player_needs
  add constraint player_needs_season_format check (
    season ~ '^[0-9]{4}/[0-9]{2}$'
    and substring(season from 6 for 2)::integer = (substring(season from 1 for 4)::integer + 1) % 100
  );
