import { Check, FileText, PlayCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { KwPlayerCard } from "@/features/kw-players/kw-player-card";
import { KwPlayerPositions, matchedPositions } from "@/features/kw-players/kw-player-positions";
import { respondToMatchAction } from "@/features/matching/club-actions";
import { MatchReasons } from "@/features/matching/match-reasons";
import { languageLabel, type ClubLocale } from "@/lib/club-i18n";
import { matchCopy } from "@/lib/match-i18n";
import { cn } from "@/lib/utils";
import type { KwPlayer, NeedMatch } from "@/types/domain";

/** One KW suggestion as the club sees it: CV-style card, why it fits, files and a one-click answer. */
export function ClubSuggestionCard({
  match,
  player,
  photoUrl,
  cvUrl,
  locale,
  highlight,
  returnTo
}: {
  match: NeedMatch;
  player: KwPlayer;
  photoUrl?: string | null;
  cvUrl?: string | null;
  locale: ClubLocale;
  highlight?: boolean;
  /** Need page to come back to after answering. */
  returnTo?: string;
}) {
  const t = matchCopy[locale];
  const isNew = match.status === "freigegeben";
  const facts = [
    player.nationality ? { label: t.nationality, value: player.nationality } : null,
    player.handedness ? { label: t.handedness, value: t.hand[player.handedness] } : null,
    player.languages.length > 0
      ? { label: t.languages, value: player.languages.map((code) => languageLabel(code, locale)).join(", ") }
      : null,
    player.league_experience ? { label: t.leagueExperience, value: player.league_experience } : null
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <article
      id={`match-${match.id}`}
      className={cn(
        "panel scroll-mt-32 grid overflow-hidden lg:grid-cols-[22rem_minmax(0,1fr)]",
        highlight && "ring-2 ring-brand-500"
      )}
    >
      <KwPlayerCard
        player={player}
        photoUrl={photoUrl}
        locale={locale}
        className="h-full"
        size="lg"
        details={<KwPlayerPositions player={player} locale={locale} matched={matchedPositions(match.reasons)} />}
        topRight={
          isNew ? (
            <span className="shrink-0 bg-white px-2 py-0.5 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-navy-950">
              {t.statusNew}
            </span>
          ) : null
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/70">{t.fit}</span>
            <span className={cn("px-2.5 py-1 font-display text-2xl leading-none", match.score >= 80 ? "bg-brand-500 text-white" : "bg-white text-navy-950")}>{match.score}%</span>
          </div>
        }
      />

      <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
        {match.reasons.length > 0 ? (
          <div>
            <p className="section-heading mb-2">{t.why}</p>
            <MatchReasons reasons={match.reasons} locale={locale} />
          </div>
        ) : null}

        {facts.length > 0 ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-slate-500">{fact.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-navy-950">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {player.profile ? (
          <div>
            <p className="section-heading mb-1.5">{t.profile}</p>
            <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{player.profile}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 bg-navy-950 px-4 text-[0.75rem] font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-600"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              {t.cv}
            </a>
          ) : (
            <span className="inline-flex min-h-11 items-center gap-2 border border-dashed border-slate-300 px-4 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-slate-500">
              <FileText className="h-4 w-4" aria-hidden="true" />
              {t.noCv}
            </span>
          )}
          {player.video_url ? (
            <a
              href={player.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 border border-slate-200 bg-white px-4 text-[0.75rem] font-extrabold uppercase tracking-[0.08em] text-navy-950 transition-colors hover:border-brand-500 hover:text-brand-600"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              {t.video}
            </a>
          ) : null}
        </div>

        <div className="mt-auto border-t border-slate-200 pt-5">
          {isNew ? (
            <AnswerForm match={match} locale={locale} returnTo={returnTo} />
          ) : (
            <div className="space-y-3">
              <p
                className={cn(
                  "flex items-start gap-2 text-sm font-semibold",
                  match.status === "interessiert" ? "text-brand-700" : "text-slate-600"
                )}
              >
                {match.status === "interessiert" ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <ThumbsDown className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                {match.status === "interessiert" ? t.answeredInterested : t.answeredNo}
              </p>
              {match.club_note ? (
                <p className="border-l-2 border-slate-200 pl-3 text-sm italic text-slate-600">
                  <span className="sr-only">{t.yourNote}: </span>„{match.club_note}“
                </p>
              ) : null}
              <details className="group">
                <summary className="cursor-pointer list-none text-xs font-extrabold uppercase tracking-[0.1em] text-brand-600 hover:text-brand-700 [&::-webkit-details-marker]:hidden">
                  {t.change}
                </summary>
                <div className="pt-3">
                  <AnswerForm match={match} locale={locale} returnTo={returnTo} />
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function AnswerForm({ match, locale, returnTo }: { match: NeedMatch; locale: ClubLocale; returnTo?: string }) {
  const t = matchCopy[locale];
  const noteId = `note-${match.id}`;
  return (
    <form action={respondToMatchAction} className="space-y-3">
      <input type="hidden" name="match_id" value={match.id} />
      {returnTo ? <input type="hidden" name="return_to" value={returnTo} /> : null}
      <label htmlFor={noteId} className="block text-sm font-bold text-navy-950">
        {t.question}
      </label>
      <textarea
        id={noteId}
        name="note"
        rows={2}
        maxLength={1000}
        defaultValue={match.club_note ?? ""}
        placeholder={t.notePlaceholder}
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-navy-950 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="submit"
          name="answer"
          value="interessiert"
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-brand-500 px-4 text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_24px_-12px_rgba(0,85,255,0.8)] transition-colors hover:bg-brand-600"
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          {t.interested}
        </button>
        <button
          type="submit"
          name="answer"
          value="kein_interesse"
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-slate-200 bg-white px-4 text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-navy-950 transition-colors hover:border-slate-400"
        >
          <ThumbsDown className="h-4 w-4" aria-hidden="true" />
          {t.notInterested}
        </button>
      </div>
    </form>
  );
}
