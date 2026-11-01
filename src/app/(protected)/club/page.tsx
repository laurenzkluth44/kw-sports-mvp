import Link from "next/link";
import { Flash, flashKind } from "@/components/ui/flash";
import { guideCopy } from "@/lib/guide-i18n";
import { CheckCircle2, Copy, Edit, Plus, Sparkles } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NeedBadges } from "@/features/player-needs/need-badges";
import { NeedStatusForm } from "@/features/player-needs/need-status-form";
import { NeedPositionCell } from "@/features/player-needs/need-summary";
import { planningSeasons } from "@/features/squad/squad-model";
import { confirmClubNeedsAction, duplicateClubNeedAction } from "@/features/player-needs/actions";
import { CLUB_STATUS_LABELS, clubCopy } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";
import { requireClubUser } from "@/lib/auth";
import { fill, matchCopy } from "@/lib/match-i18n";
import { cockpitCopy, format } from "@/lib/cockpit-i18n";
import { ClubCockpit } from "@/features/club/cockpit";
import { formatDate } from "@/lib/utils";
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

  const suggestionsByNeed = new Map<string, { total: number; open: number }>();
  (matchRows ?? []).forEach((row) => {
    const entry = suggestionsByNeed.get(row.need_id) ?? { total: 0, open: 0 };
    entry.total += 1;
    if (row.status === "freigegeben") entry.open += 1;
    suggestionsByNeed.set(row.need_id, entry);
  });
  const openSuggestions = [...suggestionsByNeed.values()].reduce((sum, entry) => sum + entry.open, 0);
  const m = matchCopy[locale];
  const cockpit = cockpitCopy[locale];

  const typedNeeds = (needs ?? []) as PlayerNeed[];
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
        <section className="panel overflow-hidden">
          <div className="table-header hidden grid-cols-[0.7fr_0.7fr_0.8fr_1.35fr_auto] gap-4 lg:grid">
            <span>{t.position}</span>
            <span>{t.season}</span>
            <span>{t.neededFrom}</span>
            <span>{t.status}</span>
            <span className="text-right">{t.action}</span>
          </div>

          <div className="divide-y divide-slate-200">
            {typedNeeds.map((need) => {
              const stale = isStaleNeed(need.last_confirmed_at);
              const suggestions = suggestionsByNeed.get(need.id);

              return (
                <article
                  key={need.id}
                  className="data-row grid gap-4 lg:grid-cols-[0.7fr_0.7fr_0.8fr_1.35fr_auto] lg:items-center"
                >
                  <div>
                    <NeedPositionCell need={need} locale={locale} />
                    <p className="mt-1 text-sm text-slate-500 lg:hidden">{need.season}</p>
                    {suggestions ? (
                      <Link
                        href={`/club/suggestions#need-${need.id}`}
                        className={
                          suggestions.open > 0
                            ? "mt-2 inline-flex items-center gap-1.5 bg-brand-500 px-2 py-1 text-[0.66rem] font-extrabold uppercase tracking-[0.1em] text-white hover:bg-brand-600"
                            : "mt-2 inline-flex items-center gap-1.5 bg-brand-50 px-2 py-1 text-[0.66rem] font-extrabold uppercase tracking-[0.1em] text-brand-700 hover:bg-brand-100"
                        }
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {suggestions.total === 1 ? m.needChipOne : fill(m.needChip, suggestions.total)}
                      </Link>
                    ) : null}
                    {stale && (need.status === "offen" || need.status === "in_gespraechen") ? (
                      <form action={confirmClubNeedsAction} className="mt-2">
                        <input type="hidden" name="id" value={need.id} />
                        <button
                          type="submit"
                          className="inline-flex min-h-8 items-center gap-1.5 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                          title={t.updateHint}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          {flash.staleConfirmOne}
                        </button>
                      </form>
                    ) : null}
                  </div>
                  <p className="hidden text-sm font-medium text-slate-700 lg:block">{need.season}</p>
                  <p className="text-sm text-slate-700">{formatDate(need.needed_from_date, locale)}</p>
                  <div className="space-y-3">
                    <NeedBadges need={need} locale={locale} />
                    {need.status_note ? <p className="text-xs text-slate-500">{need.status_note}</p> : null}
                    <NeedStatusForm need={need} locale={locale} />
                  </div>
                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    <form action={duplicateClubNeedAction}>
                      <input type="hidden" name="id" value={need.id} />
                      <Button type="submit" variant="secondary" className="px-3 shadow-sm" title={t.copyTitle}>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        {t.copy}
                      </Button>
                    </form>
                    <Link
                      href={`/club/needs/${need.id}/edit`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-navy-900 hover:bg-slate-50"
                      title={t.editTitle}
                    >
                      <Edit className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{t.editSr}</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="panel-muted px-5 py-4 text-sm leading-6 text-slate-600">
        {t.footer} {t.statusFilter}: {CLUB_STATUS_LABELS[locale].offen}, {CLUB_STATUS_LABELS[locale].in_gespraechen},{" "}
        {CLUB_STATUS_LABELS[locale].besetzt}.
      </section>
    </div>
  );
}

function isStaleNeed(lastConfirmedAt: string) {
  const lastConfirmed = new Date(lastConfirmedAt).getTime();
  if (Number.isNaN(lastConfirmed)) return false;

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - lastConfirmed > thirtyDays;
}
