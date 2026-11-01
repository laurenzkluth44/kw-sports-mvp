import { Flash, flashKind } from "@/components/ui/flash";
import { guideCopy } from "@/lib/guide-i18n";
import { CheckCircle2, Plus } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { planningSeasons } from "@/features/squad/squad-model";
import { confirmClubNeedsAction } from "@/features/player-needs/actions";
import { clubCopy } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";
import { requireClubUser } from "@/lib/auth";
import { cockpitCopy, format } from "@/lib/cockpit-i18n";
import { ClubCockpit } from "@/features/club/cockpit";
import { ClubNeedCard, NewNeedTile } from "@/features/club/club-need-card";
import { clubNeedCopy } from "@/lib/club-need-i18n";
import type { PlayerNeed, RosterPlayer } from "@/types/domain";

export default async function ClubDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; done?: string; confirm?: string }>;
}) {
  const { supabase, profile } = await requireClubUser();
  const locale = await getClubLocale();
  const t = clubCopy[locale].dashboard;
  const params = await searchParams;
  const flash = guideCopy[locale].flash;
  const doneKind = flashKind(params.done);

  // All in parallel. Access rules keep squad, needs and KW suggestions to this club.
  const [{ data: needs }, { data: agencyCount }, { data: rosterRows }, { data: matchRows }] = await Promise.all([
    supabase
      .from("player_needs")
      .select("*")
      .eq("club_id", profile.club_id!)
      .neq("status", "archiviert")
      .order("needed_from_date", { ascending: true }),
    supabase.rpc("agency_count"),
    supabase.from("roster_players").select("*").eq("club_id", profile.club_id!),
    supabase.from("need_matches").select("need_id, status")
  ]);
  const roster = (rosterRows ?? []) as RosterPlayer[];
  const planningSeason = planningSeasons(1)[1];

  const typedNeeds = (needs ?? []) as PlayerNeed[];
  const activeNeeds = typedNeeds.filter((need) => need.status === "offen" || need.status === "in_gespraechen");
  const activeIds = new Set(activeNeeds.map((need) => need.id));

  // Unanswered suggestions only count as "new" while the need is still open.
  const suggestionsByNeed = new Map<string, { total: number; open: number }>();
  (matchRows ?? []).forEach((row) => {
    const entry = suggestionsByNeed.get(row.need_id) ?? { total: 0, open: 0 };
    entry.total += 1;
    if (row.status === "freigegeben" && activeIds.has(row.need_id)) entry.open += 1;
    suggestionsByNeed.set(row.need_id, entry);
  });
  const openSuggestions = [...suggestionsByNeed.values()].reduce((sum, entry) => sum + entry.open, 0);
  const cockpit = cockpitCopy[locale];

  const closedNeeds = typedNeeds.filter((need) => need.status === "besetzt");
  const staleCount = typedNeeds.filter(
    (need) => (need.status === "offen" || need.status === "in_gespraechen") && isStaleNeed(need.last_confirmed_at)
  ).length;

  const club = profile.clubs ?? null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const clubLogoUrl =
    club?.logo_path && supabaseUrl
      ? `${supabaseUrl}/storage/v1/object/public/club-logos/${club.logo_path}`
      : null;

  return (
    <div className="space-y-6">
      <Flash
        message={
          doneKind
            ? doneKind === "created"
              ? flash.needCreated
              : doneKind === "updated"
                ? flash.needUpdated
                : doneKind === "confirmed"
                  ? flash.needsConfirmed
                  : flash.statusUpdated
            : null
        }
      />

      {staleCount > 0 && params.confirm === "stale" ? (
        <section
          id="noch-aktuell"
          className={`flex flex-col gap-3 border-l-4 border-amber-400 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div>
            <p className="font-bold text-amber-900">{flash.staleTitle.replace("{n}", String(staleCount))}</p>
            <p className="mt-1 max-w-2xl text-sm text-amber-900/80">{flash.staleBody}</p>
          </div>
          <form action={confirmClubNeedsAction}>
            <Button type="submit" variant="accent" className="w-full whitespace-nowrap sm:w-auto">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {flash.staleConfirmAll}
            </Button>
          </form>
        </section>
      ) : null}
      {params.error === "status" ? (
        <div className="alert-error">{t.statusError}</div>
      ) : null}
      {params.error === "duplicate" ? (
        <div className="alert-error">{t.duplicateError}</div>
      ) : null}

      <ClubCockpit
        locale={locale}
        clubName={club?.name || t.eyebrowFallback}
        league={club?.league}
        logoUrl={clubLogoUrl}
        personName={profile.name}
        roster={roster}
        needs={typedNeeds}
        openSuggestions={openSuggestions}
        planningSeason={planningSeason}
      />

      <div id="bedarfe" className="flex scroll-mt-32 flex-wrap items-end justify-between gap-2 border-b-2 border-navy-950 pb-2 pt-2">
        <h2 className="font-display text-[2rem] uppercase leading-none text-navy-950">{cockpit.needs}</h2>
        <p className="text-xs text-slate-500">{format(cockpit.agencies, { n: agencyCount ?? 0 })}</p>
      </div>

      {typedNeeds.length === 0 ? (
        <EmptyState
          title={t.emptyTitle}
          body={t.emptyBody}
          action={
            <LinkButton href="/club/needs/new" variant="accent">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t.newNeed}
            </LinkButton>
          }
        />
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {activeNeeds.map((need) => (
              <ClubNeedCard key={need.id} need={need} locale={locale} suggestions={suggestionsByNeed.get(need.id)} />
            ))}
            <NewNeedTile locale={locale} />
          </section>
          {closedNeeds.length > 0 ? (
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600 hover:text-navy-950 [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
                  ›
                </span>
                {clubNeedCopy[locale].closedTitle} · {closedNeeds.length}
              </summary>
              <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {closedNeeds.map((need) => (
                  <ClubNeedCard key={need.id} need={need} locale={locale} suggestions={suggestionsByNeed.get(need.id)} />
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}

    </div>
  );
}

function isStaleNeed(lastConfirmedAt: string) {
  const lastConfirmed = new Date(lastConfirmedAt).getTime();
  if (Number.isNaN(lastConfirmed)) return false;

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - lastConfirmed > thirtyDays;
}
