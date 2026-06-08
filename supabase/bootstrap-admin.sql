insert into public.users (id, name, email, role, club_id)
values (
  '53f6a2c1-1a3a-4955-9a20-8c728c54683c',
  'KW Sports Admin',
  'laurenz.kluth@kwsports.de',
  'admin',
  null
)
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  club_id = excluded.club_id;
