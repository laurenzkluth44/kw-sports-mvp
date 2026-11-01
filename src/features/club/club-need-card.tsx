import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { NeedCourt, PRIORITY_TAG, isStale } from "@/features/needs-overview/need-card";
import { attackPositionsText, defensePositionsText, needHeadline } from "@/features/player-needs/need-summary";
import { CLUB_PRIORITY_LABELS, CLUB_STATUS_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { clubNeedCopy } from "@/lib/club-need-i18n";
import { cn, formatDate } from "@/lib/utils";
import type { PlayerNeed } from "@/types/domain";

const fill = (text: string, n: number) => text.replace("{n}", String(n));

/** One of the club's own needs: court, what, when, status and KW suggestions. Opens the need page. */
export function ClubNeedCard({
  need,
  locale,
  suggestions
}: {
  need: PlayerNeed;
  locale: ClubLocale;
  suggestions?: { total: number; open: number };
}) {
  const t = clubNeedCopy[locale];
  const attack = attackPositionsText(need, locale);
  const defense = defensePositionsText(need, locale);
  const stale = isStale(need);
  const closed = need.status === "besetzt" || need.status === "archiviert";

  return (
    <Link
      href={`/club/needs/${need.id}`}
      className={cn(
        "group flex flex-col border border-slate-200 bg-white text-navy-950 transition duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-cardHover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        closed && "opacity-75"
      )}
    >
      <div className="relative bg-navy-950 py-2">
        <NeedCourt need={need} locale={locale} className="mx-auto w-[72%] max-w-[240px]" />
        {suggestions && suggestions.open > 0 ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 bg-brand-500 px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {suggestions.open === 1 ? t.newCountOne : fill(t.newCount, suggestions.open)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[1.9rem] leading-[0.9]">{need.need_type === "trainer" ? needHeadline(need, locale) : attack || defense || "–"}</p>
            {need.need_type !== "trainer" && attack && defense ? (
              <p className="mt-1 text-xs font-semibold text-slate-500">{defense}</p>
            ) : null}
          </div>
          <span className={cn("whitespace-nowrap px-2 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.12em]", PRIORITY_TAG[need.priority])}>
            {CLUB_PRIORITY_LABELS[locale][need.priority]}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-bold text-brand-700">{need.season}</span> · {formatDate(need.needed_from_date, locale)}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
          <span className="inline-flex items-center gap-2 font-bold">
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full",
                need.status === "offen"
                  ? "bg-brand-500"
                  : need.status === "in_gespraechen"
                    ? "bg-amber-500"
                    : need.status === "besetzt"
                      ? "bg-slate-700"
                      : "bg-slate-300"
              )}
            />
            {CLUB_STATUS_LABELS[locale][need.status]}
          </span>
          {stale ? (
            <span className="bg-amber-50 px-2 py-0.5 font-bold text-amber-800 ring-1 ring-amber-200">{t.stale}</span>
          ) : suggestions && suggestions.total > 0 ? (
            <span className="font-semibold text-brand-700">
              {suggestions.total === 1 ? t.suggestionCountOne : fill(t.suggestionCount, suggestions.total)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/** Last tile in the grid: start a new need. */
export function NewNeedTile({ locale }: { locale: ClubLocale }) {
  const t = clubNeedCopy[locale];
  return (
    <Link
      href="/club/needs/new"
      className="group flex min-h-48 flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-white/60 p-6 text-center text-navy-950 transition-colors hover:border-brand-500 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <span className="flex h-12 w-12 items-center justify-center bg-brand-500 text-white transition-transform group-hover:scale-105">
        <Plus className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="font-display text-2xl uppercase leading-none">{t.addNeed}</span>
      <span className="text-xs text-slate-500">{t.addNeedHint}</span>
    </Link>
  );
}
