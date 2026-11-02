-- How a need was filled ("Besetzt – durch wen?"), so KW Sports can track its placements.
--
-- Kept in its own table on purpose: agencies can read player_needs, but must never learn
-- which positions KW Sports filled. Who sees what (covered by supabase/tests/outcomes-access.sql):
--   * KW admins: everything.
--   * Clubs: read and write the outcome of their own needs only.
--   * Agencies, anon: nothing.

create type public.need_fill_source as enum ('kw_sports', 'andere_agentur', 'eigene_suche', 'intern');

create table public.need_outcomes (
  need_id uuid primary key references public.player_needs(id) on delete cascade,
  filled_via public.need_fill_source not null,
  -- Optional: which KW player it was (set by KW, or derived from a single interested match).
  kw_player_id uuid references public.kw_players(id) on delete set null,
  noted_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index need_outcomes_filled_via_idx on public.need_outcomes (filled_via);

create trigger set_need_outcomes_updated_at
before update on public.need_outcomes
for each row execute function public.set_updated_at();

alter table public.need_outcomes enable row level security;
alter table public.need_outcomes force row level security;
revoke all on table public.need_outcomes from anon;

create policy "Admins manage need outcomes"
on public.need_outcomes for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Clubs manage outcomes of their own needs"
on public.need_outcomes for all to authenticated
using (
  public.current_user_role() = 'club'
  and exists (select 1 from public.player_needs n where n.id = need_outcomes.need_id and n.club_id = public.current_user_club_id())
)
with check (
  public.current_user_role() = 'club'
  and exists (select 1 from public.player_needs n where n.id = need_outcomes.need_id and n.club_id = public.current_user_club_id())
  -- Clubs say how it was filled; linking a specific KW player stays with KW.
  and kw_player_id is null
);
