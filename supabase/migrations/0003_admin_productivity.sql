alter table public.player_needs
add column if not exists status_note text,
add column if not exists closed_at timestamptz,
add column if not exists last_confirmed_at timestamptz not null default now();

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  player_need_id uuid not null references public.player_needs(id) on delete cascade,
  admin_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_notes_body_not_empty check (length(trim(body)) > 0)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  club_id uuid references public.clubs(id) on delete set null,
  player_need_id uuid references public.player_needs(id) on delete set null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_notes_player_need_id_idx on public.admin_notes (player_need_id);
create index if not exists audit_logs_player_need_id_idx on public.audit_logs (player_need_id);
create index if not exists audit_logs_club_id_idx on public.audit_logs (club_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists player_needs_last_confirmed_at_idx on public.player_needs (last_confirmed_at);

drop trigger if exists set_admin_notes_updated_at on public.admin_notes;
create trigger set_admin_notes_updated_at
before update on public.admin_notes
for each row execute function public.set_updated_at();

create or replace function public.audit_player_need_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_logs (actor_id, club_id, player_need_id, action, old_data, new_data)
    values (auth.uid(), new.club_id, new.id, 'player_need.created', null, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_logs (actor_id, club_id, player_need_id, action, old_data, new_data)
    values (auth.uid(), new.club_id, new.id, 'player_need.updated', to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_logs (actor_id, club_id, player_need_id, action, old_data, new_data)
    values (auth.uid(), old.club_id, old.id, 'player_need.deleted', to_jsonb(old), null);
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists audit_player_needs_changes on public.player_needs;
create trigger audit_player_needs_changes
after insert or update or delete on public.player_needs
for each row execute function public.audit_player_need_changes();

alter table public.admin_notes enable row level security;
alter table public.audit_logs enable row level security;

alter table public.admin_notes force row level security;
alter table public.audit_logs no force row level security;

drop policy if exists "Admins can manage admin notes" on public.admin_notes;
create policy "Admins can manage admin notes"
on public.admin_notes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can view audit logs" on public.audit_logs;
create policy "Admins can view audit logs"
on public.audit_logs
for select
to authenticated
using (public.is_admin());
