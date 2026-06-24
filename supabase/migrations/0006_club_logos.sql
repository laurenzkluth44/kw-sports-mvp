-- Club logos: store an optional logo per club and a public bucket to hold the files.

alter table public.clubs add column if not exists logo_path text;

-- Public bucket so logos can be shown via a plain CDN URL (e.g. on the invite/set-password page).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'club-logos',
  'club-logos',
  true,
  2097152, -- 2 MB
  array['image/webp', 'image/png', 'image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read logos (bucket is public); only admins may write.
drop policy if exists "Public read club logos" on storage.objects;
create policy "Public read club logos"
on storage.objects
for select
to public
using (bucket_id = 'club-logos');

drop policy if exists "Admins manage club logos" on storage.objects;
create policy "Admins manage club logos"
on storage.objects
for all
to authenticated
using (bucket_id = 'club-logos' and public.is_admin())
with check (bucket_id = 'club-logos' and public.is_admin());
