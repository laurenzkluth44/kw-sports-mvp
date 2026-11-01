-- Access tests for the KW player database and need matches (migration 0013).
-- Same conventions as access.sql: one transaction, rolled back; any failure raises.

\set ON_ERROR_STOP 1
begin;

-- ---------------------------------------------------------------- fixtures
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

insert into public.player_needs (id, club_id, season, attack_positions, needed_from_date) values
  ('ab000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', '2027/28', '{RR}', '2027-07-01'),
  ('bb000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b', '2027/28', '{RR}', '2027-07-01');

-- P1 released + matched to club A, P2 matched to club A but not released for clubs, P3 released + matched to club B
insert into public.kw_players (id, first_name, last_name, attack_positions, consent_at, visible_to_clubs, cv_path) values
  ('f1000000-0000-0000-0000-000000000001', 'Paul', 'One', '{RR}', '2026-10-01', true, 'f1000000-0000-0000-0000-000000000001/cv.pdf'),
  ('f2000000-0000-0000-0000-000000000002', 'Piet', 'Two', '{RR}', null, false, null),
  ('f3000000-0000-0000-0000-000000000003', 'Pit', 'Three', '{RR}', '2026-10-01', true, null);

insert into public.need_matches (id, need_id, player_id, score, handled_at) values
  ('e1000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 90, now()),
  ('e2000000-0000-0000-0000-000000000002', 'ab000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000002', 80, null),
  ('e3000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000001', 'f3000000-0000-0000-0000-000000000003', 70, null);

-- ---------------------------------------------------------------- club A
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer; s public.need_match_status;
begin
  select count(*) into n from public.kw_players;
  if n <> 1 then raise exception 'FAIL club A should see exactly 1 KW player (released for its need), saw %', n; end if;

  select count(*) into n from public.kw_players where id = 'f1000000-0000-0000-0000-000000000001';
  if n <> 1 then raise exception 'FAIL club A cannot see the player released to it'; end if;

  select count(*) into n from public.need_matches;
  if n <> 1 then raise exception 'FAIL club A should see exactly 1 match, saw %', n; end if;

  if not public.club_can_see_kw_player('f1000000-0000-0000-0000-000000000001') then raise exception 'FAIL storage check denies club A its own player'; end if;
  if public.club_can_see_kw_player('f3000000-0000-0000-0000-000000000003') then raise exception 'FAIL storage check lets club A see club B player'; end if;
  if public.club_can_see_kw_player('f2000000-0000-0000-0000-000000000002') then raise exception 'FAIL storage check lets club A see an unreleased player'; end if;

  -- clubs cannot create or edit matches directly
  begin
    insert into public.need_matches (need_id, player_id) values ('ab000000-0000-0000-0000-000000000001', 'f3000000-0000-0000-0000-000000000003');
    raise exception 'FAIL club A could create a match';
  exception when insufficient_privilege then null;
  end;

  update public.need_matches set score = 100 where id = 'e1000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL club A could edit a match directly'; end if;

  update public.kw_players set last_name = 'Hacked';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL club A could edit KW players'; end if;

  -- answering works through the function only
  perform public.respond_to_need_match('e1000000-0000-0000-0000-000000000001', 'interessiert', 'Bitte melden');
  select status into s from public.need_matches where id = 'e1000000-0000-0000-0000-000000000001';
  if s <> 'interessiert' then raise exception 'FAIL club A answer not stored'; end if;
  if exists (select 1 from public.need_matches where id = 'e1000000-0000-0000-0000-000000000001' and handled_at is not null) then
    raise exception 'FAIL a new club answer must reopen the item in the KW inbox';
  end if;

  begin
    perform public.respond_to_need_match('e3000000-0000-0000-0000-000000000003', 'interessiert', null);
    raise exception 'FAIL club A could answer club B match';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.respond_to_need_match('e2000000-0000-0000-0000-000000000002', 'interessiert', null);
    raise exception 'FAIL club A could answer a match of an unreleased player';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.respond_to_need_match('e1000000-0000-0000-0000-000000000001', 'freigegeben', null);
    raise exception 'FAIL club A could set the status back to released';
  exception when invalid_parameter_value then null;
  end;
end
$$;

reset role;

-- ---------------------------------------------------------------- club B
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.kw_players;
  if n <> 1 then raise exception 'FAIL club B should see exactly its 1 released player, saw %', n; end if;
  select count(*) into n from public.kw_players where id = 'f3000000-0000-0000-0000-000000000003';
  if n <> 1 then raise exception 'FAIL club B cannot see its released player'; end if;
  select count(*) into n from public.need_matches where club_note is not null;
  if n <> 0 then raise exception 'FAIL club B can see club A notes'; end if;
end
$$;

reset role;

-- ---------------------------------------------------------------- agency: nothing
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.kw_players;
  if n <> 0 then raise exception 'FAIL agency can see % KW players', n; end if;
  select count(*) into n from public.need_matches;
  if n <> 0 then raise exception 'FAIL agency can see % matches', n; end if;
  begin
    perform public.respond_to_need_match('e1000000-0000-0000-0000-000000000001', 'kein_interesse', null);
    raise exception 'FAIL agency could answer a match';
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
  select count(*) into n from public.kw_players;
  if n <> 3 then raise exception 'FAIL admin should see all 3 KW players, saw %', n; end if;
  select count(*) into n from public.need_matches;
  if n <> 3 then raise exception 'FAIL admin should see all 3 matches, saw %', n; end if;
  insert into public.need_matches (need_id, player_id) values ('bb000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001');
end
$$;

reset role;

-- ---------------------------------------------------------------- anon
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
begin
  begin
    perform 1 from public.kw_players;
    raise exception 'FAIL anon can read kw_players';
  exception when insufficient_privilege then null;
  end;
end
$$;

reset role;

-- ---------------------------------------------------------------- data rules
do $$
begin
  begin
    insert into public.kw_players (first_name, last_name, visible_to_clubs) values ('No', 'Consent', true);
    raise exception 'FAIL player released to clubs without consent';
  exception when check_violation then null;
  end;

  begin
    insert into public.kw_players (first_name, last_name, video_url) values ('Bad', 'Link', 'javascript:alert(1)');
    raise exception 'FAIL non-https video link accepted';
  exception when check_violation then null;
  end;
end
$$;

select 'ALL MATCHING ACCESS TESTS PASSED' as result;

rollback;
