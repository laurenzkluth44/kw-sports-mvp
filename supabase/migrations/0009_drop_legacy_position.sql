-- Bedarf-Profil v2, Schritt 2 von 2 (contract):
-- Erst ausführen, wenn der App-Stand mit attack_positions / defense_positions live ist.
-- Danach kann die alte App nicht mehr gegen diese Datenbank laufen.

drop trigger if exists sync_player_needs_legacy_position on public.player_needs;
drop function if exists public.sync_legacy_player_need_position();

-- Entfernt auch player_needs_filters_idx, der position enthielt.
alter table public.player_needs drop column if exists position;
drop type if exists public.player_need_position;

create index if not exists player_needs_filters_idx on public.player_needs (season, need_type, status, priority);
