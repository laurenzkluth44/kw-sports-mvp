-- Access tests: prove who can see and change what.
-- Runs in one transaction and rolls back, so it leaves no data behind.
-- Any failed check raises an exception and stops the run (ON_ERROR_STOP).
--
--   CI:     psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/access.sql   (real Supabase stack)
--   Local:  scripts/test-db-local.sh                                          (plain Postgres + stub)

\set ON_ERROR_STOP 1
begin;

-- ---------------------------------------------------------------- fixtures (as postgres, bypasses RLS)
insert into public.clubs (id, name, league, city) values
  ('a0000000-0000-0000-0000-00000000000a', 'Test Club A', '1. Bundesliga', 'Kiel'),
  ('b0000000-0000-0000-0000-00000000000b', 'Test Club B', '2. Bundesliga', 'Minden');

insert into auth.users (id, email) values
  ('a1000000-0000-0000-0000-000000000001', 'a1@test.local'),
  ('a2000000-0000-0000-0000-000000000002', 'a2@test.local'),
  ('b1000000-0000-0000-0000-000000000001', 'b1@test.local'),
  ('c1000000-0000-0000-0000-000000000001', 'agency@test.local'),
  ('d1000000-0000-0000-0000-000000000001', 'admin@test.local');

insert into public.users (id, club_id, name, email, role, agency_name) values
  ('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', 'Club A One', 'a1@test.local', 'club', null),
  ('a2000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-00000000000a', 'Club A Two', 'a2@test.local', 'club', null),
  ('b1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b', 'Club B One', 'b1@test.local', 'club', null),
  ('c1000000-0000-0000-0000-000000000001', null, 'Agent', 'agency@test.local', 'agency', 'Test Agency'),
  ('d1000000-0000-0000-0000-000000000001', null, 'Admin', 'admin@test.local', 'admin', null);

insert into public.roster_players (id, club_id, first_name, last_name, position, contract_until) values
  ('aa000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', 'Anna', 'Alpha', 'RL', '2027-06-30'),
  ('aa000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-00000000000a', 'Ben', 'Beta', 'TW', '2028-06-30'),
  ('bb000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b', 'Carl', 'Gamma', 'KM', '2027-06-30');

insert into public.player_needs (id, club_id, season, attack_positions, needed_from_date) values
  ('ab000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', '2027/28', '{RR}', '2027-07-01');

insert into public.admin_notes (id, player_need_id, admin_id, body) values
  ('ad000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Test note');

-- ---------------------------------------------------------------- club A user 1
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.roster_players;
  if n <> 2 then raise exception 'FAIL club A should see exactly its 2 roster players, saw %', n; end if;

  select count(*) into n from public.roster_players where club_id = 'b0000000-0000-0000-0000-00000000000b';
  if n <> 0 then raise exception 'FAIL club A can see club B roster'; end if;

  -- add own player
  insert into public.roster_players (club_id, first_name, last_name, position, contract_until)
  values ('a0000000-0000-0000-0000-00000000000a', 'Dora', 'Delta', 'RA', '2029-06-30');

  -- add a player to club B -> must be rejected
  begin
    insert into public.roster_players (club_id, first_name, last_name, position, contract_until)
    values ('b0000000-0000-0000-0000-00000000000b', 'Evil', 'Insert', 'RA', '2029-06-30');
    raise exception 'FAIL club A could insert into club B roster';
  exception when insufficient_privilege then null;
  end;

  -- change club B player -> silently matches nothing
  update public.roster_players set last_name = 'Hacked' where id = 'bb000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL club A could update club B player'; end if;

  -- delete club B player -> silently matches nothing
  delete from public.roster_players where id = 'bb000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL club A could delete club B player'; end if;

  -- move own player to club B -> must be rejected
  begin
    update public.roster_players set club_id = 'b0000000-0000-0000-0000-00000000000b'
    where id = 'aa000000-0000-0000-0000-000000000001';
    raise exception 'FAIL club A could move a player to club B';
  exception when insufficient_privilege then null;
  end;

  -- edit own player works
  update public.roster_players set jersey_number = 7 where id = 'aa000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL club A could not edit its own player'; end if;

  -- data rules
  begin
    insert into public.roster_players (club_id, first_name, last_name, position, secondary_positions, contract_until)
    values ('a0000000-0000-0000-0000-00000000000a', 'Same', 'Twice', 'RL', '{RL}', '2029-06-30');
    raise exception 'FAIL main position also allowed as secondary position';
  exception when check_violation then null;
  end;

  begin
    insert into public.roster_players (club_id, first_name, last_name, position, defense_positions, contract_until)
    values ('a0000000-0000-0000-0000-00000000000a', 'Bad', 'Defense', 'RL', '{7}', '2029-06-30');
    raise exception 'FAIL defense position 7 accepted';
  exception when check_violation then null;
  end;

  -- club users cannot read the user table beyond themselves
  select count(*) into n from public.users;
  if n <> 1 then raise exception 'FAIL club user can see % user rows', n; end if;
end
$$;

reset role;

-- ---------------------------------------------------------------- club A user 2 sees the same roster (all club users see everything)
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a2000000-0000-0000-0000-000000000002","role":"authenticated"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.roster_players;
  if n <> 3 then raise exception 'FAIL second club A user should see all 3 club A players, saw %', n; end if;
end
$$;

reset role;

-- ---------------------------------------------------------------- club B user
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.roster_players;
  if n <> 1 then raise exception 'FAIL club B should see only its 1 player, saw %', n; end if;

  select count(*) into n from public.roster_players where last_name = 'Hacked';
  if n <> 0 then raise exception 'FAIL club B player was modified by club A'; end if;
end
$$;

reset role;

-- ---------------------------------------------------------------- agency user: no roster access at all
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.roster_players;
  if n <> 0 then raise exception 'FAIL agency can see % roster players', n; end if;

  begin
    insert into public.roster_players (club_id, first_name, last_name, position, contract_until)
    values ('a0000000-0000-0000-0000-00000000000a', 'Agency', 'Insert', 'RA', '2029-06-30');
    raise exception 'FAIL agency could insert roster player';
  exception when insufficient_privilege then null;
  end;

  -- agencies still see all needs (unchanged behaviour)
  select count(*) into n from public.player_needs;
  if n < 1 then raise exception 'FAIL agency lost access to player needs'; end if;

  select count(*) into n from public.player_need_confidential;
  if n <> 0 then raise exception 'FAIL agency can see confidential notes'; end if;
end
$$;

reset role;

-- ---------------------------------------------------------------- KW admin: no roster access either (privacy promise)
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"d1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.roster_players;
  if n <> 0 then raise exception 'FAIL admin can see % roster players', n; end if;

  update public.roster_players set last_name = 'Admin' where club_id = 'a0000000-0000-0000-0000-00000000000a';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL admin could update roster players'; end if;

  begin
    insert into public.roster_players (club_id, first_name, last_name, position, contract_until)
    values ('a0000000-0000-0000-0000-00000000000a', 'Admin', 'Insert', 'RA', '2029-06-30');
    raise exception 'FAIL admin could insert roster player';
  exception when insufficient_privilege then null;
  end;

  -- admins keep full access to needs
  select count(*) into n from public.player_needs where club_id = 'a0000000-0000-0000-0000-00000000000a';
  if n <> 1 then raise exception 'FAIL admin lost access to player needs'; end if;
end
$$;

reset role;

-- ---------------------------------------------------------------- signed out (anon)
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare n integer;
begin
  begin
    select count(*) into n from public.roster_players;
    if n <> 0 then raise exception 'FAIL anon can see roster players'; end if;
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.is_admin();
    raise exception 'FAIL anon can call is_admin()';
  exception when insufficient_privilege then null;
  end;
end
$$;

reset role;

-- ---------------------------------------------------------------- schema rules (as postgres)
do $$
declare n integer;
begin
  -- seasons: any valid future season works, malformed ones do not
  insert into public.player_needs (club_id, season, attack_positions, needed_from_date)
  values ('a0000000-0000-0000-0000-00000000000a', '2031/32', '{LA}', '2031-07-01');

  begin
    insert into public.player_needs (club_id, season, attack_positions, needed_from_date)
    values ('a0000000-0000-0000-0000-00000000000a', '2026/28', '{LA}', '2026-07-01');
    raise exception 'FAIL invalid season 2026/28 accepted';
  exception when check_violation then null;
  end;

  -- deleting an admin keeps that admin's notes
  delete from public.users where id = 'd1000000-0000-0000-0000-000000000001';
  select count(*) into n from public.admin_notes where id = 'ad000000-0000-0000-0000-000000000001' and admin_id is null;
  if n <> 1 then raise exception 'FAIL admin note was deleted together with the admin'; end if;

  -- deleting a club removes its roster (the app deletes the club's users first, as here)
  delete from public.users where club_id = 'b0000000-0000-0000-0000-00000000000b';
  delete from public.clubs where id = 'b0000000-0000-0000-0000-00000000000b';
  select count(*) into n from public.roster_players where club_id = 'b0000000-0000-0000-0000-00000000000b';
  if n <> 0 then raise exception 'FAIL roster survived club deletion'; end if;

  -- roster changes must never be copied into the admin-readable audit log
  select count(*) into n from public.audit_logs where action like 'roster%' or new_data ? 'contract_until' or old_data ? 'contract_until';
  if n <> 0 then raise exception 'FAIL roster data found in audit_logs'; end if;
end
$$;

select 'ALL ACCESS TESTS PASSED' as result;

rollback;
