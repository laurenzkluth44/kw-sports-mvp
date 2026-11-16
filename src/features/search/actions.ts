"use server";

import { getCurrentProfile } from "@/lib/auth";
import { CLUB_COACH_ROLE_LABELS, CLUB_STATUS_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";
import { ROLE_LABELS } from "@/lib/constants";
import type { CoachRole, PlayerNeedStatus } from "@/types/domain";
import { adminPages, searchCopy } from "./copy";
import { filterShortcuts, rankResults, type SearchItem, type SearchResult } from "./model";

type NeedRow = {
  id: string;
  season: string;
  status: PlayerNeedStatus;
  need_type: string;
  attack_positions: string[] | null;
  coach_role: CoachRole | null;
  clubs: { name: string; league: string | null; city: string | null } | null;
};

const fill = (text: string, value: string) => text.replace("{value}", value);

function needTitle(need: NeedRow, locale: ClubLocale) {
  if (need.need_type === "trainer") return need.coach_role ? CLUB_COACH_ROLE_LABELS[locale][need.coach_role] : "Trainer";
  return (need.attack_positions ?? []).join(" · ") || "–";
}

/**
 * Searches everything the signed-in user may see. All queries run with the user's own session,
 * so row level security decides what comes back: a club only finds its own squad and needs,
 * agencies only needs, KW Sports everything.
 */
export async function globalSearchAction(rawQuery: string): Promise<SearchResult[]> {
  const query = String(rawQuery ?? "").trim().slice(0, 80);
  if (query.length < 2) return [];

  const context = await getCurrentProfile();
  if (!context) return [];
  const { supabase, profile } = context;
  const role = profile.role;
  const locale: ClubLocale = role === "admin" ? "de" : await getClubLocale();
  const t = searchCopy[locale];
  const items: SearchItem[] = [];
  const needsBase = role === "admin" ? "/admin" : role === "agency" ? "/agency" : null;

  // Filter shortcuts ("RR", "2027/28") on the needs list of admin and agencies.
  if (needsBase) {
    for (const shortcut of filterShortcuts(query, needsBase)) {
      items.push({
        group: "filters",
        title: fill(shortcut.kind === "position" ? t.positionFilter : t.seasonFilter, shortcut.value),
        href: shortcut.href,
        keywords: query
      });
    }
  }

  // Pages of the role.
  const pages = role === "admin" ? adminPages : role === "agency" ? t.pages.agency : t.pages.club;
  pages.forEach((page) => items.push({ group: "pages", title: page.title, href: page.href, keywords: page.keywords }));

  // Needs (RLS: admin all, agency the shared ones, club its own). Archived needs are left out.
  const { data: needRows } = await supabase
    .from("player_needs")
    .select("id, season, status, need_type, attack_positions, coach_role, clubs(name, league, city)")
    .neq("status", "archiviert")
    .order("updated_at", { ascending: false })
    .limit(400);
  const needHref = (id: string) => (role === "admin" ? `/admin/needs/${id}` : role === "agency" ? `/agency/needs/${id}` : `/club/needs/${id}`);
  ((needRows ?? []) as unknown as NeedRow[]).forEach((need) => {
    const status = CLUB_STATUS_LABELS[locale][need.status] ?? need.status;
    items.push({
      group: "needs",
      title: role === "club" ? needTitle(need, locale) : `${need.clubs?.name ?? "–"} · ${needTitle(need, locale)}`,
      subtitle: `${need.season} · ${status}`,
      href: needHref(need.id),
      keywords: `${need.clubs?.name ?? ""} ${need.clubs?.city ?? ""} ${need.clubs?.league ?? ""} ${(need.attack_positions ?? []).join(" ")} ${need.season}`
    });
  });

  if (role === "admin" || role === "agency") {
    // Clubs that have needs: open their needs in the list (agencies) or the club page (admin).
    const { data: clubs } = await supabase.from("clubs").select("id, name, league, city").order("name").limit(400);
    (clubs ?? []).forEach((club) =>
      items.push({
        group: role === "admin" ? "clubs" : "filters",
        title: role === "admin" ? club.name : fill(t.clubNeedsFilter, club.name),
        subtitle: [club.league, club.city].filter(Boolean).join(" · "),
        href: role === "admin" ? `/admin/clubs/${club.id}` : `/agency?q=${encodeURIComponent(club.name)}`,
        keywords: `${club.name} ${club.city ?? ""} ${club.league ?? ""}`
      })
    );
  }

  if (role === "admin") {
    const [{ data: players }, { data: users }] = await Promise.all([
      supabase
        .from("kw_players")
        .select("id, kind, first_name, last_name, current_club, current_league, attack_positions, nationality")
        .order("last_name")
        .limit(500),
      supabase.from("users").select("id, name, email, role, club_id, agency_name").order("name").limit(500)
    ]);
    (players ?? []).forEach((player) =>
      items.push({
        group: "players",
        title: `${player.first_name} ${player.last_name}`,
        subtitle: [player.kind === "trainer" ? "Trainer" : (player.attack_positions ?? []).join("/"), player.current_club, player.current_league]
          .filter(Boolean)
          .join(" · "),
        href: `/admin/players/${player.id}/edit`,
        keywords: `${player.current_club ?? ""} ${player.current_league ?? ""} ${(player.attack_positions ?? []).join(" ")} ${player.nationality ?? ""} ${player.kind}`
      })
    );
    (users ?? []).forEach((user) =>
      items.push({
        group: "users",
        title: user.name || user.email,
        subtitle: [ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role, user.agency_name, user.email].filter(Boolean).join(" · "),
        href: user.club_id ? `/admin/clubs/${user.club_id}` : "/admin/users",
        keywords: `${user.email} ${user.agency_name ?? ""}`
      })
    );
  }

  if (role === "club") {
    const [{ data: roster }, { data: matches }] = await Promise.all([
      supabase.from("roster_players").select("id, first_name, last_name, jersey_number, position, contract_until").order("last_name").limit(200),
      supabase
        .from("need_matches")
        .select("id, kw_players(first_name, last_name, current_club)")
        .in("status", ["freigegeben", "interessiert", "kein_interesse"])
        .limit(200)
    ]);
    (roster ?? []).forEach((player) =>
      items.push({
        group: "squad",
        title: `${player.first_name} ${player.last_name}`,
        subtitle: [player.jersey_number ? `#${player.jersey_number}` : null, player.position, player.contract_until?.slice(0, 4)].filter(Boolean).join(" · "),
        href: `/club/squad/${player.id}/edit`,
        keywords: player.position ?? ""
      })
    );
    const seen = new Set<string>();
    ((matches ?? []) as unknown as { kw_players: { first_name: string; last_name: string; current_club: string | null } | null }[]).forEach((match) => {
      const player = match.kw_players;
      if (!player) return;
      const name = `${player.first_name} ${player.last_name}`;
      if (seen.has(name)) return;
      seen.add(name);
      items.push({ group: "suggestions", title: name, subtitle: player.current_club ?? undefined, href: "/club/suggestions" });
    });
  }

  return rankResults(items, query);
}
