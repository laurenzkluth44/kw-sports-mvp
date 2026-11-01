import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Eye, LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { COURT_ASPECT, CourtLines, attackSpot } from "@/features/court/court";
import { filtersToQuery, type AdminNeedFilters } from "@/features/admin/filters";
import { NeedBadges } from "@/features/player-needs/need-badges";
import { NeedPositionCell } from "@/features/player-needs/need-summary";
import { NeedCard } from "@/features/needs-overview/need-card";
import { ATTACK_POSITIONS } from "@/lib/constants";
import { CLUB_POSITION_LABELS, CLUB_POSITION_SHORT_LABELS, type ClubLocale } from "@/lib/club-i18n";
import type { OverviewCopy } from "@/lib/overview-i18n";
import { cn, formatDate } from "@/lib/utils";
import type { AttackPosition, PlayerNeedWithClub } from "@/types/domain";

export type OverviewView = "cards" | "list";

export function parseOverviewView(value: string | undefined): OverviewView {
  return value === "list" ? "list" : "cards";
}

const PRIORITY_ORDER = { hoch: 0, mittel: 1, niedrig: 2 } as const;

/**
 * Needs overview shared by the admin and agency dashboards ("A · Taktik-Karten").
 * `needs` are already filtered by everything except the position, so the demand court
 * can show counts per position; the position filter is applied here.
 */
export function NeedsOverview({
  basePath,
  locale,
  copy,
  eyebrow,
  actions,
  needs,
  filters,
  view,
  agencyCount,
  filterFields,
  quickFilters,
  inbox,
  summary,
  detailHref,
  clubHref
}: {
  basePath: "/admin" | "/agency";
  locale: ClubLocale;
  copy: OverviewCopy;
  eyebrow: string;
  actions?: ReactNode;
  needs: PlayerNeedWithClub[];
  filters: AdminNeedFilters;
  view: OverviewView;
  agencyCount?: number | null;
  filterFields: ReactNode;
  quickFilters: ReactNode;
  inbox: ReactNode;
  summary: ReactNode;
  detailHref: (needId: string) => string;
  clubHref?: (clubId: string) => string;
}) {
  const position = filters.position;
  const shown = (position ? needs.filter((need) => need.attack_positions.includes(position)) : needs)
    .slice()
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const openCount = shown.filter((need) => need.status === "offen").length;
  const highCount = shown.filter((need) => need.priority === "hoch").length;

  const counts = Object.fromEntries(
    ATTACK_POSITIONS.map((code) => [code, needs.filter((need) => need.attack_positions.includes(code)).length])
  ) as Record<AttackPosition, number>;

  const href = (next: Partial<AdminNeedFilters>, nextView: OverviewView = view) => {
    const query = new URLSearchParams(filtersToQuery({ ...filters, ...next }));
    if (nextView === "list") query.set("view", "list");
    const text = query.toString();
    return text ? `${basePath}?${text}` : basePath;
  };

  const advancedActive = (["country", "league", "season", "type", "defense", "status", "priority"] as const).filter(
    (key) => Boolean(filters[key])
  ).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white shadow-card">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-6 whitespace-nowrap font-display text-[9rem] leading-[0.8] text-white/[0.05] sm:text-[15rem]"
        >
          {copy.results}
        </span>
        <div className="relative flex flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="eyebrow eyebrow-light">{eyebrow}</p>
              <h1 className="font-display text-[3.5rem] uppercase leading-[0.86] sm:text-[5rem]">
                {copy.heroTitle} <span className="text-brand-500">{copy.heroAccent}</span>
              </h1>
              <p className="text-[0.95rem] font-light leading-7 text-white/70">{copy.heroDescription}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <HeroKpi value={shown.length} label={copy.kpiHits} />
            <HeroKpi value={openCount} label={copy.kpiOpen} />
            <HeroKpi value={highCount} label={copy.kpiHigh} />
            {agencyCount !== undefined ? <HeroKpi value={agencyCount ?? 0} label={copy.kpiAgencies} /> : null}
          </div>
        </div>
      </section>

      {/* Court + toolbar */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col bg-navy-950 text-white shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
            <p className="eyebrow eyebrow-light">{copy.courtTitle}</p>
            <Link
              href={href({ position: undefined })}
              scroll={false}
              aria-current={position ? undefined : "true"}
              className={cn(
                "inline-flex min-h-10 items-center font-display text-lg tracking-[0.04em]",
                position ? "text-slate-300 hover:text-white" : "text-white underline decoration-brand-500 decoration-2 underline-offset-4"
              )}
            >
              {copy.courtAll}
            </Link>
          </div>
          <div className="px-3 pb-3 pt-2 sm:px-5">
            <div className="relative mx-auto w-full max-w-[520px]" style={{ aspectRatio: COURT_ASPECT.full }}>
              <CourtLines crop="full" />
              {ATTACK_POSITIONS.map((code) => {
                const active = position === code;
                const count = counts[code];
                return (
                  <Link
                    key={code}
                    href={href({ position: active ? undefined : code })}
                    scroll={false}
                    aria-current={active ? "true" : undefined}
                    aria-label={copy.courtAria(CLUB_POSITION_LABELS[locale][code], count)}
                    className="group absolute flex -translate-x-1/2 -translate-y-[22px] flex-col items-center gap-1 focus:outline-none sm:-translate-y-[27px]"
                    style={attackSpot(code, "full")}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center rounded-full font-display leading-none transition-transform duration-300 ease-out-expo group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-white",
                        count >= 2 ? "h-11 w-11 text-2xl sm:h-[54px] sm:w-[54px] sm:text-[1.8rem]" : "h-10 w-10 text-xl sm:h-12 sm:w-12 sm:text-2xl",
                        active
                          ? "bg-white text-navy-950 shadow-[0_0_0_4px_#0055FF]"
                          : count > 0
                            ? "bg-brand-500 text-white shadow-blueGlow"
                            : "border-2 border-dashed border-white/35 text-white/60"
                      )}
                    >
                      {count}
                    </span>
                    <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-white">
                      {CLUB_POSITION_SHORT_LABELS[locale][code]}
                    </span>
                  </Link>
                );
              })}
            </div>
            <p className="px-1 pt-1 text-xs text-slate-300">{copy.courtHint}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <form action={basePath} className="panel flex flex-col gap-4 p-5">
            {position ? <input type="hidden" name="position" value={position} /> : null}
            {view === "list" ? <input type="hidden" name="view" value="list" /> : null}
            <label htmlFor="q" className="field-label">
              {copy.search}
            </label>
            <div className="flex gap-2">
              <Input id="q" name="q" type="search" defaultValue={filters.q || ""} placeholder={copy.searchPlaceholder} />
              <Button type="submit" className="shrink-0">
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">{copy.searchButton}</span>
              </Button>
            </div>
            <details className="group border-t border-slate-200 pt-3" open={advancedActive > 0}>
              <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold uppercase tracking-[0.08em] text-navy-950">
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  {copy.moreFilters}
                  {advancedActive > 0 ? (
                    <span className="bg-brand-500 px-1.5 py-0.5 text-[0.65rem] text-white">{copy.activeFilters(advancedActive)}</span>
                  ) : null}
                </span>
                <span aria-hidden="true" className="text-lg text-slate-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="grid gap-4 pt-4 sm:grid-cols-2">{filterFields}</div>
              <div className="flex flex-wrap gap-2 pt-4">
                <Button type="submit">{copy.searchButton}</Button>
                <LinkButton href={basePath} variant="secondary">
                  {copy.reset}
                </LinkButton>
              </div>
            </details>
          </form>

          {quickFilters}

          <div className="panel flex flex-wrap items-end justify-between gap-4 p-5">
            <div>
              <p className="font-display text-[3.25rem] leading-[0.9]">
                {shown.length} <span className="text-brand-500">{copy.results}</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {position ? copy.positionFilter(CLUB_POSITION_LABELS[locale][position]) : copy.allPositions}
              </p>
            </div>
            <nav aria-label={`${copy.cards} / ${copy.list}`} className="flex border border-slate-200 p-1">
              <ViewLink href={href({}, "cards")} active={view === "cards"} icon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}>
                {copy.cards}
              </ViewLink>
              <ViewLink href={href({}, "list")} active={view === "list"} icon={<List className="h-4 w-4" aria-hidden="true" />}>
                {copy.list}
              </ViewLink>
            </nav>
          </div>
        </div>
      </section>

      {/* Results */}
      {shown.length === 0 ? (
        <div className="panel px-5 py-12 text-center text-sm text-slate-500">{copy.noResults}</div>
      ) : view === "cards" ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((need) => (
            <NeedCard key={need.id} need={need} href={detailHref(need.id)} locale={locale} copy={copy} />
          ))}
        </section>
      ) : (
        <section className="panel overflow-hidden">
          <div className="divide-y divide-slate-200">
            {shown.map((need) => (
              <article
                key={need.id}
                className="data-row grid gap-4 lg:grid-cols-[1.25fr_0.8fr_0.7fr_0.6fr_1fr_auto] lg:items-center"
              >
                <div>
                  {clubHref ? (
                    <Link href={clubHref(need.clubs.id)} className="font-bold text-navy-950 hover:text-brand-600">
                      {need.clubs.name}
                    </Link>
                  ) : (
                    <p className="font-bold text-navy-950">{need.clubs.name}</p>
                  )}
                  <p className="mt-1 text-sm text-slate-500">
                    {need.clubs.city} · {copy.from} {formatDate(need.needed_from_date, locale)}
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-700">{need.clubs.league}</p>
                <NeedPositionCell need={need} locale={locale} />
                <p className="text-sm text-slate-700">{need.season}</p>
                <NeedBadges need={need} locale={locale} />
                <LinkButton href={detailHref(need.id)} variant="secondary" className="h-10 w-10 px-0" title={copy.open}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">{copy.open}</span>
                </LinkButton>
              </article>
            ))}
          </div>
        </section>
      )}

      {inbox}

      <details className="panel group overflow-hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-extrabold uppercase tracking-[0.08em] text-navy-950 hover:bg-brand-50">
          <span className="inline-flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-500" aria-hidden="true" />
            {copy.analysis}
          </span>
          <span aria-hidden="true" className="text-lg text-slate-400 transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="border-t border-slate-200 p-5">{summary}</div>
      </details>
    </div>
  );
}

function HeroKpi({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1 border-l-[3px] border-brand-500 pl-4">
      <span className="font-display text-[2.75rem] leading-[0.9] sm:text-[3.25rem]">{value}</span>
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/70">{label}</span>
    </div>
  );
}

function ViewLink({ href, active, icon, children }: { href: string; active: boolean; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-9 items-center gap-2 px-3 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] transition-colors",
        active ? "bg-navy-950 text-white" : "text-slate-600 hover:text-navy-950"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
