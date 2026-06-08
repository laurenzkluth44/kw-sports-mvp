delete from public.clubs as clubs
where clubs.id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000007'
)
and not exists (
  select 1
  from public.users
  where users.club_id = clubs.id
)
and not exists (
  select 1
  from public.player_needs
  where player_needs.club_id = clubs.id
);
