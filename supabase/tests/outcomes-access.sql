-- Access tests for need outcomes ("Besetzt – durch wen?", migration 0014).
-- Same conventions as the other access tests: one transaction, rolled back; any failure raises.

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
  ('ab000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', '2027/28', '{RR}', '2027-07-01', 'besetzt'),
  ('bb000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b', '2027/28', '{RR}', '2027-07-01', 'besetzt');

insert into public.kw_players (id, first_name, last_name, attack_positions) values
  ('f1000000-0000-0000-0000-000000000001', 'Paul', 'One', '{RR}');

insert into public.need_outcomes (need_id, filled_via) values
  ('bb000000-0000-0000-0000-000000000001', 'kw_sports');

-- ---------------------------------------------------------------- club A
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  insert into public.need_outcomes (need_id, filled_via) values ('ab000000-0000-0000-0000-000000000001', 'eigene_suche');
  update public.need_outcomes set filled_via = 'kw_sports' where need_id = 'ab000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL club A cannot update its own outcome'; end if;

  select count(*) into n from public.need_outcomes;
  if n <> 1 then raise exception 'FAIL club A should only see its own outcome, saw %', n; end if;

  begin
    insert into public.need_outcomes (need_id, filled_via) values ('bb000000-0000-0000-0000-000000000001', 'intern');
    raise exception 'FAIL club A could write an outcome for club B';
  exception when insufficient_privilege or unique_violation then null;
  end;

  update public.need_outcomes set filled_via = 'intern' where need_id = 'bb000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL club A could change club B outcome'; end if;

  begin
    update public.need_outcomes set kw_player_id = 'f1000000-0000-0000-0000-000000000001' where need_id = 'ab000000-0000-0000-0000-000000000001';
    raise exception 'FAIL club A could link a KW player';
  exception when insufficient_privilege then null;
  end;

  delete from public.need_outcomes where need_id = 'ab000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL club A cannot clear its own outcome when reopening a need'; end if;
end
$$;

reset role;

-- ---------------------------------------------------------------- agency: nothing
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.need_outcomes;
  if n <> 0 then raise exception 'FAIL agency can see % outcomes', n; end if;
  begin
    insert into public.need_outcomes (need_id, filled_via) values ('ab000000-0000-0000-0000-000000000001', 'andere_agentur');
    raise exception 'FAIL agency could write an outcome';
  exception when insufficient_privilege then null;
  end;
end
$$;

reset role;

-- ---------------------------------------------------------------- admin: everything
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"d1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.need_outcomes;
  if n <> 1 then raise exception 'FAIL admin should see all outcomes, saw %', n; end if;
  update public.need_outcomes set kw_player_id = 'f1000000-0000-0000-0000-000000000001' where need_id = 'bb000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL admin cannot link the KW player'; end if;
end
$$;

reset role;

-- ---------------------------------------------------------------- anon: nothing
set local role anon;
do $$
begin
  perform 1 from public.need_outcomes;
  raise exception 'FAIL anon can read outcomes';
exception when insufficient_privilege then null;
end
$$;
reset role;

do $$ begin raise notice 'ALL OUTCOME ACCESS TESTS PASSED'; end $$;
rollback;
