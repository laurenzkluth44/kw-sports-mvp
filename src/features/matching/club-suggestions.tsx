import Link from "next/link";
import { Lock, Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Flash } from "@/components/ui/flash";
import { ClubSuggestionCard } from "@/features/matching/club-suggestion-card";
import { needHeadline } from "@/features/player-needs/need-summary";
import type { ClubLocale } from "@/lib/club-i18n";
import { fill, matchCopy } from "@/lib/match-i18n";
import { formatDate } from "@/lib/utils";
import type { KwPlayer, NeedMatch, PlayerNeed } from "@/types/domain";

/** Pure view of all KW suggestions for a club, grouped by need, unanswered first. */
export function ClubSuggestionsView({
  locale,
  needs,
  players,
  matches,
  files,
  done,
  error
}: {
  locale: ClubLocale;
  needs: PlayerNeed[];
  players: KwPlayer[];
  matches: NeedMatch[];
  files: Map<string, string>;
  done?: string;
  error?: string;
}) {
  const t = matchCopy[locale];
  const playerById = new Map(players.map((player) => [player.id, player]));
  const visible = matches.filter((match) => playerById.has(match.player_id));

  const groups = needs
    .map((need) => {
      const own = visible.filter((match) => match.need_id === need.id);
      const open = own.filter((match) => match.status === "freigegeben").sort(byScore);
      const answered = own.filter((match) => match.status !== "freigegeben").sort(byScore);
      return { need, open, answered };
    })
    .filter((group) => group.open.length + group.answered.length > 0)
    // Needs with unanswered suggestions first, then by start date.
    .sort((a, b) => Number(b.open.length > 0) - Number(a.open.length > 0) || a.need.needed_from_date.localeCompare(b.need.needed_from_date));

  const flash = done === "interessiert" ? t.doneInterested : done === "kein_interesse" ? t.doneNo : null;

  const card = (match: NeedMatch) => {
    const player = playerById.get(match.player_id)!;
    return (
      <ClubSuggestionCard
        key={match.id}
        match={match}
        player={player}
        locale={locale}
        photoUrl={player.photo_path ? files.get(player.photo_path) : null}
        cvUrl={player.cv_path ? files.get(player.cv_path) : null}
      />
    );
  };

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden bg-navy-950 px-5 py-6 text-white sm:px-7 sm:py-8">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-6 font-display text-[9rem] leading-[0.8] text-white/[0.05] sm:text-[12rem]"
        >
          KW
        </span>
        <p className="eyebrow eyebrow-light relative">{t.eyebrow}</p>
        <h1 className="relative mt-2 font-display text-[2.5rem] uppercase leading-[0.9] sm:text-[3.5rem]">{t.title}</h1>
        <p className="relative mt-3 max-w-2xl text-sm leading-6 text-white/75">{t.intro}</p>
        <p className="relative mt-4 inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brand-300">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          {t.confidential}
        </p>
      </header>

      <Flash message={flash} />
      {error ? <div className="alert-error">{t.error}</div> : null}

      {groups.length === 0 ? (
        <EmptyState
          title={t.emptyTitle}
          body={t.emptyBody}
          action={
            <LinkButton href="/club/needs/new" variant="accent">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t.emptyAction}
            </LinkButton>
          }
        />
      ) : (
        groups.map(({ need, open, answered }) => (
          <section key={need.id} id={`need-${need.id}`} className="scroll-mt-32 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-navy-950 pb-2">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">{t.forNeed}</p>
                <h2 className="font-display text-[1.9rem] uppercase leading-none text-navy-950">
                  <Link href={`/club/needs/${need.id}`} className="hover:text-brand-600">
                    {needHeadline(need, locale)}
                  </Link>
                  <span className="ml-3 text-lg text-slate-400">
                    {need.season} · {formatDate(need.needed_from_date, locale)}
                  </span>
                </h2>
              </div>
              {open.length > 0 ? (
                <span className="bg-brand-500 px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-white">
                  {fill(t.newCount, open.length)}
                </span>
              ) : null}
            </div>

            {open.map(card)}

            {answered.length > 0 ? (
              <details className="group" open={open.length === 0}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600 hover:text-navy-950 [&::-webkit-details-marker]:hidden">
                  <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
                    ›
                  </span>
                  {fill(t.answered, answered.length)}
                </summary>
                <div className="mt-2 space-y-4">{answered.map(card)}</div>
              </details>
            ) : null}
          </section>
        ))
      )}
    </div>
  );
}

function byScore(a: NeedMatch, b: NeedMatch) {
  return b.score - a.score;
}
