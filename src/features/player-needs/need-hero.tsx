import type { ReactNode } from "react";
import { ClubCrest, NeedCourt, PRIORITY_TAG, clubLogoUrl, isStale } from "@/features/needs-overview/need-card";
import { needHeadline } from "@/features/player-needs/need-summary";
import { CLUB_PRIORITY_LABELS, CLUB_STATUS_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { cn, formatDate } from "@/lib/utils";
import type { PlayerNeedWithClub } from "@/types/domain";

const heroCopy = {
  de: { season: "Saison", from: "Benötigt ab", stale: "Seit über 30 Tagen nicht bestätigt", updated: "Bestätigt am" },
  en: { season: "Season", from: "Needed from", stale: "Not confirmed for over 30 days", updated: "Confirmed on" },
  fr: { season: "Saison", from: "Requis dès", stale: "Non confirmé depuis plus de 30 jours", updated: "Confirmé le" },
  es: { season: "Temporada", from: "Necesario desde", stale: "Sin confirmar desde hace más de 30 días", updated: "Confirmado el" }
} as const;

/**
 * Top of a need's detail page: club, what is sought (big), when, how urgent, and the
 * positions drawn on the court. Shared by the KW admin and agency views.
 */
export function NeedHero({ need, locale, actions }: { need: PlayerNeedWithClub; locale: ClubLocale; actions?: ReactNode }) {
  const t = heroCopy[locale];
  const stale = isStale(need);

  return (
    <section className="grid overflow-hidden bg-navy-950 text-white lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <ClubCrest name={need.clubs.name} logoUrl={clubLogoUrl(need.clubs.logo_path)} />
          <div className="min-w-0">
            <p className="truncate font-bold">{need.clubs.name}</p>
            <p className="truncate text-xs text-white/60">
              {need.clubs.league} · {need.clubs.city}
            </p>
          </div>
        </div>

        <div>
          <h1 className="font-display text-[2.8rem] uppercase leading-[0.88] sm:text-[3.8rem]">{needHeadline(need, locale)}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={cn("px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.12em]", PRIORITY_TAG[need.priority])}>
              {CLUB_PRIORITY_LABELS[locale][need.priority]}
            </span>
            <span className="inline-flex items-center gap-2 border border-white/15 px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.12em]">
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 w-2 rounded-full",
                  need.status === "offen" ? "bg-brand-500" : need.status === "in_gespraechen" ? "bg-amber-400" : "bg-slate-400"
                )}
              />
              {CLUB_STATUS_LABELS[locale][need.status]}
            </span>
            {stale ? (
              <span className="bg-amber-400/15 px-2 py-1 text-[0.68rem] font-bold text-amber-200">{t.stale}</span>
            ) : null}
          </div>
        </div>

        <dl className="grid grid-cols-3 border-t border-white/10 pt-4">
          <Fact label={t.season} value={need.season} />
          <Fact label={t.from} value={formatDate(need.needed_from_date, locale)} />
          <Fact label={t.updated} value={formatDate(need.last_confirmed_at, locale)} />
        </dl>

        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="flex items-center justify-center border-t border-white/10 p-5 lg:border-l lg:border-t-0">
        <NeedCourt need={need} locale={locale} size="lg" className="w-full max-w-[420px]" />
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-white/10 px-3 first:border-l-0 first:pl-0">
      <dt className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/50">{label}</dt>
      <dd className="mt-1 font-display text-xl leading-none sm:text-2xl">{value}</dd>
    </div>
  );
}

/** Requirement profile: only what the club actually filled in, as label/value rows. */
export function NeedFacts({ title, rows, empty }: { title: string; rows: { label: string; value: ReactNode; wide?: boolean }[]; empty: string }) {
  const filled = rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== "" && row.value !== "-");
  return (
    <div className="panel p-5">
      <h2 className="section-heading">{title}</h2>
      {filled.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{empty}</p>
      ) : (
        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {filled.map((row) => (
            <div key={row.label} className={row.wide ? "sm:col-span-2" : undefined}>
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">{row.label}</dt>
              <dd className="mt-1 whitespace-pre-line text-sm font-medium leading-6 text-navy-950 [&_a]:text-brand-600 [&_a]:underline">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/** Chips for a list of labels, or null when empty (so NeedFacts hides the row). */
export function chips(items: string[]) {
  if (items.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
          {item}
        </span>
      ))}
    </span>
  );
}
