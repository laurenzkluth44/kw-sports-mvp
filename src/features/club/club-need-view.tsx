import { CheckCircle2, Copy, Lock, Pencil, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button, LinkButton } from "@/components/ui/button";
import { Flash, flashKind } from "@/components/ui/flash";
import { ClubNeedStatus } from "@/features/club/club-need-status";
import { ClubSuggestionCard } from "@/features/matching/club-suggestion-card";
import { isStale } from "@/features/needs-overview/need-card";
import { confirmClubNeedsAction, duplicateClubNeedAction } from "@/features/player-needs/actions";
import { NeedFacts, NeedHero, chips } from "@/features/player-needs/need-hero";
import { needHeadline, needProfileLabels } from "@/features/player-needs/need-summary";
import { agencyCopy } from "@/lib/agency-i18n";
import { clubCopy, type ClubLocale } from "@/lib/club-i18n";
import { clubNeedCopy } from "@/lib/club-need-i18n";
import { cockpitCopy } from "@/lib/cockpit-i18n";
import { guideCopy } from "@/lib/guide-i18n";
import { matchCopy } from "@/lib/match-i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { KwPlayer, NeedFillSource, NeedMatch, PlayerNeedWithClub } from "@/types/domain";

/** The club's own need page as a pure view (also used by the screenshot preview). */
export function ClubNeedView({
  need,
  matches,
  players,
  files,
  locale,
  query,
  filledVia
}: {
  need: PlayerNeedWithClub & { player_need_confidential?: { note: string | null } | null };
  matches: NeedMatch[];
  players: Map<string, KwPlayer>;
  files: Map<string, string>;
  locale: ClubLocale;
  query: { done?: string; error?: string };
  filledVia?: NeedFillSource | null;
}) {
  const t = clubNeedCopy[locale];
  const d = agencyCopy[locale].detail;
  const m = matchCopy[locale];
  const visible = matches.filter((match) => players.has(match.player_id));
  const open = visible.filter((match) => match.status === "freigegeben");
  const answered = visible.filter((match) => match.status !== "freigegeben");
  const labels = needProfileLabels(need, locale);
  const isCoach = need.need_type === "trainer";
  const closed = need.status === "besetzt" || need.status === "archiviert";
  const stale = isStale(need);
  const here = `/club/needs/${need.id}`;
  const confidentialNote = need.player_need_confidential?.note;

  const flashText = (() => {
    const kind = flashKind(query.done);
    const g = guideCopy[locale].flash;
    if (kind === "created") return g.needCreated;
    if (kind === "updated") return g.needUpdated;
    if (kind === "confirmed") return g.needsConfirmed;
    if (kind === "status") return g.statusUpdated;
    if (query.done === "interessiert") return m.doneInterested;
    if (query.done === "kein_interesse") return m.doneNo;
    return null;
  })();

  const card = (match: NeedMatch) => {
    const player = players.get(match.player_id)!;
    return (
      <ClubSuggestionCard
        key={match.id}
        match={match}
        player={player}
        locale={locale}
        photoUrl={player.photo_path ? files.get(player.photo_path) : null}
        cvUrl={player.cv_path ? files.get(player.cv_path) : null}
        returnTo={here}
      />
    );
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: cockpitCopy[locale].nav, href: "/club" }, { label: needHeadline(need, locale) }]} />
      <Flash message={flashText} />
      {query.error === "status" ? <div className="alert-error">{clubCopy[locale].dashboard.statusError}</div> : null}
      {query.error === "respond" ? <div className="alert-error">{m.error}</div> : null}

      <NeedHero
        need={need}
        locale={locale}
        actions={
          <>
            <LinkButton href={`${here}/edit`} variant="accent">
              <Pencil className="h-4 w-4" aria-hidden="true" />
              {t.edit}
            </LinkButton>
            <form action={duplicateClubNeedAction}>
              <input type="hidden" name="id" value={need.id} />
              <Button type="submit" variant="ghost" className="border-white/20 text-white">
                <Copy className="h-4 w-4" aria-hidden="true" />
                {t.duplicate}
              </Button>
            </form>
          </>
        }
      />

      {stale ? (
        <section className="flex flex-col gap-3 border-l-4 border-amber-400 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm font-semibold text-amber-900">{t.confirmHint}</p>
          <form action={confirmClubNeedsAction}>
            <input type="hidden" name="id" value={need.id} />
            <input type="hidden" name="return_to" value={here} />
            <Button type="submit" variant="accent" className="w-full whitespace-nowrap sm:w-auto">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {t.confirm}
            </Button>
          </form>
        </section>
      ) : null}

      <ClubNeedStatus need={need} locale={locale} returnTo={here} filledVia={filledVia} />

      <section id="kw-spieler" className="scroll-mt-32 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-navy-950 pb-2">
          <div>
            <p className="eyebrow">{m.eyebrow}</p>
            <h2 className="mt-1 font-display text-[2rem] uppercase leading-none text-navy-950">{t.suggestionsTitle}</h2>
          </div>
          {open.length > 0 ? (
            <span className="bg-brand-500 px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-white">
              {open.length === 1 ? t.newCountOne : t.newCount.replace("{n}", String(open.length))}
            </span>
          ) : null}
        </div>

        {visible.length === 0 ? (
          <div className="flex items-start gap-3 border border-dashed border-slate-300 bg-white px-5 py-5 text-sm text-slate-600">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
            <p>{closed ? t.suggestionsClosed : t.suggestionsEmpty}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600">{t.suggestionsIntro}</p>
            {open.map(card)}
            {answered.length > 0 ? (
              <details className="group" open={open.length === 0}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600 hover:text-navy-950 [&::-webkit-details-marker]:hidden">
                  <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
                    ›
                  </span>
                  {m.answered.replace("{n}", String(answered.length))}
                </summary>
                <div className="mt-2 space-y-4">{answered.map(card)}</div>
              </details>
            ) : null}
          </>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <NeedFacts
          title={d.profile}
          empty={d.profileEmpty}
          rows={[
            { label: d.description, value: need.description, wide: true },
            ...(isCoach
              ? [{ label: d.coachRole, value: labels.coachRole }]
              : [
                  { label: d.attackPositions, value: chips(labels.attackPositions) },
                  { label: d.defensePositions, value: chips(labels.defensePositions) },
                  { label: d.playerType, value: chips(labels.playerTypes) },
                  { label: d.targetRoles, value: chips(labels.targetRoles) },
                  { label: d.age, value: formatRange(need.age_min, need.age_max, d) },
                  { label: d.heightMin, value: need.height_min ? `${need.height_min} cm` : null },
                  { label: d.playerTypeNote, value: need.player_type, wide: true }
                ]),
            { label: d.languages, value: chips(labels.languages) },
            { label: d.nationality, value: need.nationality_preference },
            { label: d.leagueExperience, value: need.league_experience },
            { label: d.contractStatus, value: need.contract_status_preference }
          ]}
        />
        <div className="space-y-5">
          <NeedFacts
            title={d.conditions}
            empty={d.conditionsEmpty}
            rows={[
              { label: d.budget, value: need.budget_amount ? formatCurrency(need.budget_amount, need.budget_currency, locale) : null },
              { label: d.budgetNote, value: need.budget_note, wide: true },
              { label: d.statusNote, value: need.status_note, wide: true },
              { label: d.closedAt, value: need.closed_at ? formatDate(need.closed_at, locale) : null }
            ]}
          />
          {confidentialNote ? (
            <section className="panel border-l-4 border-l-brand-500 p-5">
              <h2 className="section-heading flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand-500" aria-hidden="true" />
                {t.confidential}
              </h2>
              <p className="mt-1 text-xs text-slate-500">{t.confidentialHint}</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-800">{confidentialNote}</p>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function formatRange(min: number | null, max: number | null, copy: { rangeFrom: string; rangeTo: string }) {
  if (min && max) return `${min}–${max}`;
  if (min) return `${copy.rangeFrom} ${min}`;
  if (max) return `${copy.rangeTo} ${max}`;
  return null;
}
