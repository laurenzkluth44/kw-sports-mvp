-- "Gesehen": when a club first opened a KW suggestion. Lets KW Sports follow up before the club answers.
alter table public.need_matches add column if not exists seen_at timestamptz;

-- Clubs can't update need_matches directly; this marks the suggestions of their own needs as seen.
-- Only sets the first time (seen_at stays when the club opens the page again).
create or replace function public.mark_need_matches_seen(match_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() <> 'club' then
    return;
  end if;

  update public.need_matches m
  set seen_at = now()
  from public.player_needs n, public.kw_players p
  where m.id = any(match_ids)
    and m.seen_at is null
    and n.id = m.need_id
    and p.id = m.player_id
    and p.visible_to_clubs
    and n.club_id = public.current_user_club_id();
end;
$$;

revoke execute on function public.mark_need_matches_seen(uuid[]) from public, anon;
grant execute on function public.mark_need_matches_seen(uuid[]) to authenticated;
