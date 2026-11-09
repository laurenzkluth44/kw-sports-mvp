-- Access tests for KW player game statistics (migration 0015).
-- One transaction, rolled back; any failure raises.

\set ON_ERROR_STOP 1
begin;

insert into public.clubs (id, name, league, city) values
  ('a0000000-0000-0000-0000-00000000000a', 'Test Club A', '1. Bundesliga', 'Kiel'),
  ('b0000000-0000-0000-0000-00000000000b', 'Test Club B', '2. Bundesliga', 'Minden');

insert into auth.users (id, email) values
  ('a1000000-0000-0000-0000-000000000001', 'a1@test.local'),
  ('b1000000-0000-0000-0000-000000000001', 'b1@test.local'),
  ('c1000000-0000-0000-0000-000000000001', 'agency@test.local'),
  ('d1000000-0000-0000-0000-000000000001', 'admin@test.local');

insert into public.users (id, club_id, name, email, role, agency_name) values
  ('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', 'Club A', 'a1@test.local', 'club', null),
  ('b1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b', 'Club B', 'b1@test.local', 'club', null),
  ('c1000000-0000-0000-0000-000000000001', null, 'Agent', 'agency@test.local', 'agency', 'Test Agency'),
  ('d1000000-0000-0000-0000-000000000001', null, 'Admin', 'admin@test.local', 'admin', null);

insert into public.player_needs (id, club_id, season, attack_positions, needed_from_date, status) values
  ('ab000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', '2027/28', '{RR}', '2027-07-01', 'offen');

insert into public.kw_players (id, first_name, last_name, attack_positions, consent_at, visible_to_clubs) values
  ('f1000000-0000-0000-0000-000000000001', 'Paul', 'Suggested', '{RR}', '2026-01-01', true),
  ('f2000000-0000-0000-0000-000000000001', 'Max', 'Other', '{RR}', '2026-01-01', true);

insert into public.need_matches (need_id, player_id, score) values
  ('ab000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 90);

insert into public.kw_player_games (player_id, competition, game_date, goals, shots) values
  ('f1000000-0000-0000-0000-000000000001', '2. HBL', '2026-10-17', 6, 9),
  ('f2000000-0000-0000-0000-000000000001', '2. HBL', '2026-10-17', 3, 5);

-- ---------------------------------------------------------------- club A: only the suggested player
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
declare n integer;
begin
  select count(*) into n from public.kw_player_games;
  if n <> 1 then raise exception 'FAIL club A should see 1 game row (suggested player), saw %', n; end if;
  begin
    insert into public.kw_player_games (player_id, competition, game_date, goals) values ('f1000000-0000-0000-0000-000000000001', '2. HBL', '2026-10-24', 20);
    raise exception 'FAIL club A could write statistics';
  exception when insufficient_privilege then null;
  end;
  update public.kw_player_games set goals = 20;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL club A could change statistics'; end if;
end
$$;
reset role;

-- ---------------------------------------------------------------- club B and agency: nothing
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
declare n integer;
begin
  select count(*) into n from public.kw_player_games;
  if n <> 0 then raise exception 'FAIL club B can see % game rows', n; end if;
end
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
declare n integer;
begin
  select count(*) into n from public.kw_player_games;
  if n <> 0 then raise exception 'FAIL agency can see % game rows', n; end if;
end
$$;
reset role;

-- ---------------------------------------------------------------- admin: everything, upsert works
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"d1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
declare n integer;
begin
  insert into public.kw_player_games (player_id, competition, game_date, goals, shots) values
    ('f1000000-0000-0000-0000-000000000001', '2. HBL', '2026-10-17', 7, 10)
  on conflict (player_id, competition, game_date) do update set goals = excluded.goals, shots = excluded.shots;
  select goals into n from public.kw_player_games where player_id = 'f1000000-0000-0000-0000-000000000001';
  if n <> 7 then raise exception 'FAIL admin upsert did not update the game'; end if;
  select count(*) into n from public.kw_player_games;
  if n <> 2 then raise exception 'FAIL admin should see 2 rows, saw %', n; end if;
end
$$;
reset role;

-- Deleting a player removes his statistics.
delete from public.kw_players where id = 'f2000000-0000-0000-0000-000000000001';
do $$
declare n integer;
begin
  select count(*) into n from public.kw_player_games where player_id = 'f2000000-0000-0000-0000-000000000001';
  if n <> 0 then raise exception 'FAIL statistics survive player deletion'; end if;
end
$$;

rollback;
