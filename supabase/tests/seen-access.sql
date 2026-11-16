-- "Gesehen" marker for KW suggestions (migration 0016). One transaction, rolled back.
\set ON_ERROR_STOP 1
begin;

insert into public.clubs (id, name, league, city) values
  ('a0000000-0000-0000-0000-00000000000a', 'Test Club A', '1. Bundesliga', 'Kiel'),
  ('b0000000-0000-0000-0000-00000000000b', 'Test Club B', '2. Bundesliga', 'Minden');
insert into auth.users (id, email) values
  ('a1000000-0000-0000-0000-000000000001', 'a1@test.local'),
  ('b1000000-0000-0000-0000-000000000001', 'b1@test.local'),
  ('c1000000-0000-0000-0000-000000000001', 'agency@test.local');
insert into public.users (id, club_id, name, email, role, agency_name) values
  ('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', 'Club A', 'a1@test.local', 'club', null),
  ('b1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b', 'Club B', 'b1@test.local', 'club', null),
  ('c1000000-0000-0000-0000-000000000001', null, 'Agent', 'agency@test.local', 'agency', 'Test Agency');
insert into public.player_needs (id, club_id, season, attack_positions, needed_from_date, status) values
  ('ab000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', '2027/28', '{RR}', '2027-07-01', 'offen');
insert into public.kw_players (id, first_name, last_name, attack_positions, consent_at, visible_to_clubs) values
  ('f1000000-0000-0000-0000-000000000001', 'Paul', 'Suggested', '{RR}', '2026-01-01', true);
insert into public.need_matches (id, need_id, player_id, score) values
  ('e1000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 90);

-- Club B and the agency can't mark club A's suggestion.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select public.mark_need_matches_seen(array['e1000000-0000-0000-0000-000000000001']::uuid[]);
select set_config('request.jwt.claims', '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select public.mark_need_matches_seen(array['e1000000-0000-0000-0000-000000000001']::uuid[]);
reset role;
do $$ begin
  if (select seen_at from public.need_matches where id = 'e1000000-0000-0000-0000-000000000001') is not null then
    raise exception 'FAIL another club or an agency could mark the suggestion as seen';
  end if;
end $$;

-- Club A marks it; a second call keeps the first time.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select public.mark_need_matches_seen(array['e1000000-0000-0000-0000-000000000001']::uuid[]);
reset role;
create temp table first_seen as select seen_at from public.need_matches where id = 'e1000000-0000-0000-0000-000000000001';
do $$ begin
  if (select seen_at from first_seen) is null then raise exception 'FAIL club A could not mark its suggestion as seen'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select pg_sleep(0.01);
select public.mark_need_matches_seen(array['e1000000-0000-0000-0000-000000000001']::uuid[]);
reset role;
do $$ begin
  if (select seen_at from public.need_matches where id = 'e1000000-0000-0000-0000-000000000001') <> (select seen_at from first_seen) then
    raise exception 'FAIL seen_at changed on the second visit';
  end if;
end $$;

rollback;
