import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Plus, Sparkles, type LucideIcon } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { confirmClubNeedsAction } from "@/features/player-needs/actions";
import { needHeadline } from "@/features/player-needs/need-summary";
import { attackCoverage, COURT_ORDER, contractState, currentSeason, playersForSeason } from "@/features/squad/squad-model";
import { CLUB_POSITION_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { clubCopy } from "@/lib/club-i18n";
import { cockpitCopy, format } from "@/lib/cockpit-i18n";
import { cn } from "@/lib/utils";
import type { AttackPosition, PlayerNeed, RosterPlayer } from "@/types/domain";

const DAY = 24 * 60 * 60 * 1000;
const STALE_DAYS = 30;

type Todo = {
  key: string;
  icon: LucideIcon;
  tone: "blue" | "amber" | "neutral";
  title: string;
  body?: string;
  action: ReactNode;
};

function positionName(position: AttackPosition, locale: ClubLocale) {
  const label = CLUB_POSITION_LABELS[locale][position];
  return label.includes(" · ") ? label.split(" · ")[1] : label;
}

/**
 * Club start page: who we are, the four numbers that matter, the squad for next season,
 * and a short "today" list built from real data (KW suggestions, uncovered gaps, stale needs, expiring contracts).
 * Pure view, also rendered by the screenshot preview.
 */
export function ClubCockpit({
  locale,
  clubName,
  league,
  logoUrl,
  personName,
  roster,
  needs,
  openSuggestions,
  planningSeason,
  now = Date.now()
}: {
  locale: ClubLocale;
  clubName: string;
  league?: string | null;
  logoUrl?: string | null;
  personName?: string | null;
  roster: RosterPlayer[];
  /** Active (non-archived) needs of the club. */
  needs: PlayerNeed[];
  openSuggestions: number;
  planningSeason: string;
  now?: number;
}) {
  const t = cockpitCopy[locale];
  const dashboard = clubCopy[locale].dashboard;
  const today = new Date(now);
  const season = currentSeason(today);

  const activeNeeds = needs.filter((need) => need.status === "offen" || need.status === "in_gespraechen");
  const coverage = attackCoverage(playersForSeason(roster, planningSeason));
  const gapCount = COURT_ORDER.filter((position) => coverage[position].status === "gap").length;
  const squadNow = playersForSeason(roster, season).length || roster.length;
  const expiring = roster.filter((player) => contractState(player, today) === "expiring");

  const todos: Todo[] = [];
  if (openSuggestions > 0) {
    todos.push({
      key: "suggestions",
      icon: Sparkles,
      tone: "blue",
      title: openSuggestions === 1 ? t.todoSuggestionsOne : format(t.todoSuggestions, { n: openSuggestions }),
      body: t.todoSuggestionsBody,
      action: <TodoLink href="/club/suggestions" label={t.todoSuggestionsAction} primary />
    });
  }

  // Squad gaps next season that no active need covers yet.
  if (roster.length > 0) {
    COURT_ORDER.filter((position) => coverage[position].status !== "ok")
      .filter(
        (position) =>
          !activeNeeds.some((need) => need.need_type === "spieler" && need.attack_positions.includes(position))
      )
      .sort((a, b) => Number(coverage[b].status === "gap") - Number(coverage[a].status === "gap"))
      .slice(0, 3)
      .forEach((position) => {
        const isGap = coverage[position].status === "gap";
        todos.push({
          key: `gap-${position}`,
          icon: AlertTriangle,
          tone: isGap ? "amber" : "neutral",
          title: format(isGap ? t.todoGap : t.todoThin, { position: positionName(position, locale), season: planningSeason }),
          body: t.todoGapBody,
          action: (
            <TodoLink
              href={`/club/needs/new?position=${position}&season=${encodeURIComponent(planningSeason)}`}
              label={t.todoGapAction}
            />
          )
        });
      });
  }

  activeNeeds
    .map((need) => ({ need, days: Math.floor((now - new Date(need.last_confirmed_at).getTime()) / DAY) }))
    .filter(({ days }) => days > STALE_DAYS)
    .sort((a, b) => b.days - a.days)
    .slice(0, 2)
    .forEach(({ need, days }) => {
      todos.push({
        key: `stale-${need.id}`,
        icon: CalendarClock,
        tone: "amber",
        title: format(t.todoStale, { need: needHeadline(need, locale), days }),
        body: t.todoStaleBody,
        action: (
          <form action={confirmClubNeedsAction}>
            <input type="hidden" name="id" value={need.id} />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-1.5 border border-slate-200 bg-white px-3 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-navy-950 transition-colors hover:border-brand-500 hover:text-brand-600"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t.todoStaleAction}
            </button>
          </form>
        )
      });
    });

  if (expiring.length > 0) {
    todos.push({
      key: "contracts",
      icon: CalendarClock,
      tone: "neutral",
      title: expiring.length === 1 ? format(t.todoContractsOne, { season }) : format(t.todoContracts, { n: expiring.length, season }),
      body: expiring
        .slice(0, 6)
        .map((player) => `${player.last_name || player.first_name} (${player.position})`)
        .join(", "),
      action: <TodoLink href="/club/squad" label={t.todoContractsAction} />
    });
  }

  const headline = todos.length === 0 ? t.allGood : todos.length === 1 ? t.todoOne : format(t.todoCount, { n: todos.length });
  const [nameFirst, ...nameRest] = clubName.split(" ");

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 px-5 py-6 text-white sm:px-7 sm:py-8">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-8 select-none font-display text-[10rem] leading-[0.8] text-white/[0.05] sm:text-[14rem]"
        >
          {nameFirst.slice(0, 3).toUpperCase()}
        </span>
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-16 w-16 shrink-0 bg-white object-contain p-1.5 sm:h-20 sm:w-20" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-brand-500 font-display text-2xl sm:h-20 sm:w-20 sm:text-3xl">
                {clubName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 3)
                  .toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              {league ? (
                <p className="eyebrow eyebrow-light">
                  {league} · {season}
                </p>
              ) : null}
              <h1 className="mt-1.5 font-display text-[2.4rem] uppercase leading-[0.88] sm:text-[3.4rem]">
                {nameFirst} {nameRest.length > 0 ? <span className="text-brand-500">{nameRest.join(" ")}</span> : null}
              </h1>
              <p className="mt-2 text-sm text-white/70">
                {personName ? format(t.welcome, { name: personName }) : t.welcomeAnon} {headline}
              </p>
            </div>
          </div>
          <LinkButton href="/club/needs/new" variant="accent" className="shrink-0">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {dashboard.newNeed}
          </LinkButton>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={t.kpiSquad} value={squadNow} href="/club/squad" />
        <Kpi label={t.kpiNeeds} value={activeNeeds.length} href="#bedarfe" />
        <Kpi label={format(t.kpiGaps, { season: planningSeason })} value={gapCount} tone={gapCount > 0 ? "warn" : "default"} href="/club/squad" />
        <Kpi label={t.kpiSuggestions} value={openSuggestions} tone={openSuggestions > 0 ? "blue" : "default"} href="/club/suggestions" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Squad strip */}
        <div className="panel flex flex-col p-5">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="section-heading">{format(t.board, { season: planningSeason })}</h2>
            <Link href="/club/squad" className="text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-brand-600 hover:text-brand-700">
              {t.boardOpen} →
            </Link>
          </div>
          {roster.length === 0 ? (
            <div className="flex flex-1 flex-col items-start justify-center gap-3 border border-dashed border-slate-300 p-5">
              <p className="text-sm leading-6 text-slate-600">{t.boardEmpty}</p>
              <LinkButton href="/club/squad/new" variant="secondary">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t.boardEmptyAction}
              </LinkButton>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-7 gap-1.5">
                {COURT_ORDER.map((position) => {
                  const slot = coverage[position];
                  const count = slot.main.length + slot.secondary.length;
                  return (
                    <li key={position}>
                      <Link
                        href="/club/squad"
                        title={positionName(position, locale)}
                        className={cn(
                          "flex aspect-[3/4] flex-col items-center justify-center gap-0.5 transition-transform hover:-translate-y-0.5",
                          slot.status === "ok" && "bg-brand-500 text-white",
                          slot.status === "thin" && "border-2 border-navy-950 bg-white text-navy-950",
                          slot.status === "gap" && "border-2 border-dashed border-amber-500 bg-amber-50 text-amber-800"
                        )}
                      >
                        <span className="font-display text-2xl leading-none sm:text-3xl">{count}</span>
                        <span className="text-[0.62rem] font-extrabold tracking-[0.08em]">{position}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[0.68rem] text-slate-500">{t.boardLegend}</p>
            </>
          )}
        </div>

        {/* Today */}
        <div className="panel p-5">
          <h2 className="section-heading mb-3">{t.today}</h2>
          {todos.length === 0 ? (
            <p className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
              {t.todoDone}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {todos.map((todo) => (
                <li key={todo.key} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center",
                        todo.tone === "blue" && "bg-brand-500 text-white",
                        todo.tone === "amber" && "bg-amber-100 text-amber-800",
                        todo.tone === "neutral" && "bg-slate-100 text-navy-950"
                      )}
                    >
                      <todo.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-950">{todo.title}</p>
                      {todo.body ? <p className="mt-0.5 text-xs leading-5 text-slate-500">{todo.body}</p> : null}
                    </div>
                  </div>
                  <div className="shrink-0 pl-12 sm:pl-0">{todo.action}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, href, tone = "default" }: { label: string; value: number; href: string; tone?: "default" | "blue" | "warn" }) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col justify-between gap-2 border-l-[3px] px-4 py-3.5 transition-shadow duration-300 ease-out-expo hover:shadow-cardHover",
        tone === "blue" ? "border-brand-500 bg-brand-500 text-white" : "border-brand-500 bg-white text-navy-950 shadow-card",
        tone === "warn" && "border-amber-500"
      )}
    >
      <span className={cn("text-[0.62rem] font-bold uppercase tracking-[0.14em]", tone === "blue" ? "text-white/80" : "text-slate-500")}>
        {label}
      </span>
      <span className="flex items-end justify-between">
        <span className="font-display text-[2.6rem] leading-none">{value}</span>
        <ArrowRight
          className={cn(
            "h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5",
            tone === "blue" ? "text-white" : "text-brand-500"
          )}
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function TodoLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 px-3 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] transition-colors",
        primary
          ? "bg-brand-500 text-white hover:bg-brand-600"
          : "border border-slate-200 bg-white text-navy-950 hover:border-brand-500 hover:text-brand-600"
      )}
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}
