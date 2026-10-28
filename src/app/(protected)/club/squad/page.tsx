import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, Lock, Pencil, Plus, Users, type LucideIcon } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ATTACK_LAYOUT, DEFENSE_GOALKEEPER, DEFENSE_LAYOUT } from "@/features/squad/board-layout";
import {
  COURT_ORDER,
  attackCoverage,
  attackGaps,
  byJerseyThenName,
  contractState,
  currentSeason,
  defenseCoverage,
  planningSeasons,
  playersForSeason,
  type CoverageStatus
} from "@/features/squad/squad-model";
import { BoardLegend, TacticsBoard, type BoardSlot } from "@/features/squad/tactics-board";
import { requireClubUser } from "@/lib/auth";
import { CLUB_POSITION_LABELS, CLUB_POSITION_SHORT_LABELS, defensePositionLabel, type ClubLocale } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";
import { DEFENSE_POSITIONS } from "@/lib/constants";
import { squadCopy, type SquadCopy } from "@/lib/squad-i18n";
import { cn, formatDate } from "@/lib/utils";
import type { AttackPosition, DefensePosition, RosterPlayer } from "@/types/domain";

type View = "attack" | "defense";

export default async function SquadPage({
  searchParams
}: {
  searchParams: Promise<{ season?: string; view?: string; done?: string }>;
}) {
  const { supabase, profile } = await requireClubUser();
  const locale = await getClubLocale();
  const t = squadCopy[locale];
  const params = await searchParams;

  const { data } = await supabase
    .from("roster_players")
    .select("*")
    .eq("club_id", profile.club_id!)
    .order("last_name", { ascending: true });
  const players = (data ?? []) as RosterPlayer[];

  const seasons = planningSeasons(2);
  const nowSeason = currentSeason();
  const season = params.season && seasons.includes(params.season) ? params.season : seasons[1];
  const view: View = params.view === "defense" ? "defense" : "attack";

  const inSeason = playersForSeason(players, season);
  const attack = attackCoverage(inSeason);
  const gaps = attackGaps(players, season);
  const openCount = gaps.filter((gap) => gap.status === "gap").length;
  const expiringCount = players.filter((player) => contractState(player) === "expiring").length;

  const flash = params.done === "created" || params.done === "saved" || params.done === "deleted" ? t.flash[params.done] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={profile.clubs?.name || t.page.eyebrow}
        title={t.page.title}
        description={t.page.description}
        actions={
          <LinkButton href="/club/squad/new" variant="accent">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t.page.addPlayer}
          </LinkButton>
        }
      />

      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Lock className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
        {t.page.privacy}
      </p>

      {flash ? <div className="alert-success">{flash}</div> : null}

      {players.length === 0 ? (
        <EmptyState
          title={t.list.emptyTitle}
          body={t.list.emptyBody}
          action={
            <LinkButton href="/club/squad/new" variant="accent">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t.page.addPlayer}
            </LinkButton>
          }
        />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <Metric icon={Users} label={t.page.players} value={players.length} />
            <Metric icon={CalendarClock} label={`${t.page.expiring} ${nowSeason}`} value={expiringCount} tone={expiringCount ? "warning" : "default"} />
            <Metric icon={AlertTriangle} label={t.page.gapsIn(season)} value={openCount} tone={openCount ? "danger" : "default"} />
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-sm bg-navy-950 text-white shadow-card">
              <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow eyebrow-light">{t.board.title}</p>
                  <p className="mt-1.5 text-sm text-slate-300">{t.board.subtitle}</p>
                </div>
                <Segmented
                  items={(["attack", "defense"] as const).map((value) => ({
                    href: squadHref(season, value),
                    label: value === "attack" ? t.board.attack : t.board.defense,
                    active: view === value
                  }))}
                />
              </div>

              <div className="px-3 pb-2 pt-4 sm:px-5">
                <Segmented
                  stretch
                  items={seasons.map((value) => ({
                    href: squadHref(value, view),
                    label: value === nowSeason ? `${value} · ${t.board.current}` : value,
                    active: value === season
                  }))}
                />
              </div>

              <div className="px-2 py-3 sm:px-5">
                <TacticsBoard
                  slots={view === "attack" ? attackSlots(inSeason, locale) : defenseSlots(inSeason, locale)}
                  moreLabel={t.board.morePlayers}
                  ariaLabel={`${t.board.title} ${season}`}
                />
              </div>

              <div className="border-t border-white/10 px-5 py-4">
                <BoardLegend ok={t.board.legendOk} thin={t.board.legendThin} gap={t.board.legendGap} flexible={t.board.flexibleHint} />
              </div>
            </div>

            <GapsPanel
              t={t}
              locale={locale}
              season={season}
              view={view}
              players={inSeason}
              attackGapsList={gaps}
            />
          </section>

          <PlanningMatrix t={t} locale={locale} players={players} seasons={seasons} selected={season} view={view} />

          <PlayerList t={t} locale={locale} players={players} highlight={attack} />
        </>
      )}
    </div>
  );
}

function squadHref(season: string, view: View) {
  const params = new URLSearchParams({ season });
  if (view === "defense") params.set("view", "defense");
  return `/club/squad?${params.toString()}`;
}

function boardName(player: RosterPlayer) {
  return `${player.jersey_number !== null ? `${player.jersey_number} ` : ""}${player.last_name}`;
}

function attackSlots(players: RosterPlayer[], locale: ClubLocale): BoardSlot[] {
  const coverage = attackCoverage(players);
  return COURT_ORDER.map((position) => {
    const slot = coverage[position];
    return {
      key: position,
      label: CLUB_POSITION_SHORT_LABELS[locale][position],
      ...ATTACK_LAYOUT[position],
      status: slot.status,
      count: slot.main.length,
      flexibleCount: slot.secondary.length,
      names: slot.main.map(boardName),
      href: `#pos-${position}`,
      title: [CLUB_POSITION_LABELS[locale][position], ...slot.main.map(boardName)].join(" · ")
    };
  });
}

function defenseSlots(players: RosterPlayer[], locale: ClubLocale): BoardSlot[] {
  const coverage = defenseCoverage(players);
  const goalkeepers = attackCoverage(players).TW;
  return [
    {
      key: "TW",
      label: CLUB_POSITION_SHORT_LABELS[locale].TW,
      ...DEFENSE_GOALKEEPER,
      status: goalkeepers.status,
      count: goalkeepers.main.length,
      flexibleCount: goalkeepers.secondary.length,
      names: goalkeepers.main.map(boardName),
      href: "#pos-TW",
      title: CLUB_POSITION_LABELS[locale].TW
    },
    ...DEFENSE_POSITIONS.map((position) => {
      const slot = coverage[position];
      return {
        key: `D${position}`,
        label: String(position),
        ...DEFENSE_LAYOUT[position],
        status: slot.status,
        count: slot.main.length,
        flexibleCount: 0,
        names: slot.main.map(boardName),
        href: "#players",
        title: [defensePositionLabel(position, locale), ...slot.main.map(boardName)].join(" · ")
      };
    })
  ];
}

function Segmented({ items, stretch = false }: { items: { href: string; label: string; active: boolean }[]; stretch?: boolean }) {
  return (
    <nav className={cn("flex gap-1 rounded-sm border border-white/15 bg-white/5 p-1", stretch ? "w-full" : "w-fit")}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          scroll={false}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "min-h-9 rounded-sm px-3 py-2 text-center text-[0.72rem] font-bold uppercase tracking-[0.08em] transition-colors duration-200 ease-out-expo",
            stretch ? "flex-1" : "",
            item.active ? "bg-white text-navy-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

const statusChip: Record<CoverageStatus, string> = {
  gap: "border-red-200 bg-red-50 text-red-700",
  thin: "border-amber-200 bg-amber-50 text-amber-800",
  ok: "border-brand-100 bg-brand-50 text-brand-700"
};

function GapsPanel({
  t,
  locale,
  season,
  view,
  players,
  attackGapsList
}: {
  t: SquadCopy;
  locale: ClubLocale;
  season: string;
  view: View;
  players: RosterPlayer[];
  attackGapsList: ReturnType<typeof attackGaps>;
}) {
  const rows =
    view === "attack"
      ? attackGapsList.map((gap) => ({
          key: gap.position,
          label: CLUB_POSITION_LABELS[locale][gap.position],
          status: gap.status,
          detail: gap.main.length === 0 ? (gap.secondary.length > 0 ? t.gaps.onlyFlexible : t.gaps.nobody) : t.gaps.onePlayer,
          href: `/club/needs/new?position=${gap.position}&season=${encodeURIComponent(season)}`
        }))
      : Object.entries(defenseCoverage(players))
          .filter(([, slot]) => slot.status !== "ok")
          .map(([position, slot]) => ({
            key: `D${position}`,
            label: defensePositionLabel(Number(position) as DefensePosition, locale),
            status: slot.status,
            detail: slot.main.length === 0 ? t.gaps.nobody : t.gaps.onePlayer,
            href: `/club/needs/new?defense=${position}&season=${encodeURIComponent(season)}`
          }));

  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <h2 className="section-heading">{t.gaps.title(season)}</h2>
        <p className="section-subtitle">{view === "attack" ? t.board.attack : t.board.defense}</p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-4 h-[3px] w-12 bg-brand-500" />
          <p className="text-sm font-semibold text-navy-950">{t.gaps.none}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-sm border px-1.5 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-[0.1em]",
                      statusChip[row.status]
                    )}
                  >
                    {row.status === "gap" ? t.gaps.gap : t.gaps.thin}
                  </span>
                  <span className="truncate text-sm font-bold text-navy-950">{row.label}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{row.detail}</p>
              </div>
              <LinkButton href={row.href} variant="secondary" className="min-h-9 px-3 text-[0.7rem]">
                {t.gaps.createNeed}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </LinkButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const cellClasses: Record<CoverageStatus, string> = {
  ok: "bg-brand-500 text-white",
  thin: "bg-amber-100 text-amber-900",
  gap: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
};

function PlanningMatrix({
  t,
  locale,
  players,
  seasons,
  selected,
  view
}: {
  t: SquadCopy;
  locale: ClubLocale;
  players: RosterPlayer[];
  seasons: string[];
  selected: string;
  view: View;
}) {
  const coverageBySeason = seasons.map((season) => attackCoverage(playersForSeason(players, season)));

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <h2 className="section-heading">{t.planning.title}</h2>
        <p className="section-subtitle">{t.planning.subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="table-header text-left">{t.planning.position}</th>
              {seasons.map((season) => (
                <th key={season} className={cn("table-header text-center", season === selected ? "text-brand-600" : "")}>
                  <Link href={squadHref(season, view)} scroll={false} className="hover:text-brand-600">
                    {season}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COURT_ORDER.map((position) => (
              <tr key={position}>
                <th scope="row" className="border-b border-slate-100 px-5 py-2.5 text-left font-semibold text-navy-950">
                  {CLUB_POSITION_LABELS[locale][position]}
                </th>
                {coverageBySeason.map((coverage, index) => {
                  const slot = coverage[position];
                  return (
                    <td key={seasons[index]} className="border-b border-slate-100 px-3 py-2 text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-12 items-center justify-center gap-1 rounded-sm px-2 py-1 font-display text-xl leading-none",
                          cellClasses[slot.status],
                          seasons[index] === selected ? "outline outline-2 outline-offset-2 outline-brand-500/40" : ""
                        )}
                      >
                        {slot.main.length}
                        {slot.secondary.length > 0 ? (
                          <span className="font-sans text-[0.65rem] font-bold">+{slot.secondary.length}</span>
                        ) : null}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PlayerList({
  t,
  locale,
  players,
  highlight
}: {
  t: SquadCopy;
  locale: ClubLocale;
  players: RosterPlayer[];
  highlight: ReturnType<typeof attackCoverage>;
}) {
  const short = CLUB_POSITION_SHORT_LABELS[locale];

  return (
    <section id="players" className="panel scroll-mt-28 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <h2 className="section-heading">
          {t.list.title} <span className="text-slate-400">· {players.length}</span>
        </h2>
      </div>

      <div className="divide-y divide-slate-200">
        {COURT_ORDER.map((position: AttackPosition) => {
          const group = players.filter((player) => player.position === position).sort(byJerseyThenName);

          return (
            <div key={position} id={`pos-${position}`} className="scroll-mt-28">
              <div className="flex items-center justify-between gap-3 bg-white px-5 pb-1 pt-4">
                <p className="flex items-center gap-2 text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      highlight[position].status === "ok"
                        ? "bg-brand-500"
                        : highlight[position].status === "thin"
                          ? "bg-amber-400"
                          : "bg-red-400"
                    )}
                    aria-hidden="true"
                  />
                  {CLUB_POSITION_LABELS[locale][position]}
                  <span className="text-slate-400">· {group.length}</span>
                </p>
                <Link
                  href={`/club/squad/new?position=${position}`}
                  className="inline-flex min-h-9 items-center gap-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-brand-600 hover:text-brand-700"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.list.addHere}
                </Link>
              </div>

              {group.length === 0 ? (
                <p className="px-5 pb-4 pt-1 text-sm text-slate-400">{t.list.emptyGroup}</p>
              ) : (
                <ul className="pb-2">
                  {group.map((player) => {
                    const state = contractState(player);
                    return (
                      <li key={player.id} className="data-row flex items-center gap-4 py-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-950 font-display text-xl leading-none text-white">
                          {player.jersey_number ?? "–"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-navy-950">
                            {player.first_name} <span className="font-extrabold uppercase tracking-[0.02em]">{player.last_name}</span>
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>
                              {t.list.contractUntil} {formatDate(player.contract_until, locale)}
                            </span>
                            {state !== "running" ? (
                              <span
                                className={cn(
                                  "rounded-sm border px-1.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.1em]",
                                  state === "expired" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800"
                                )}
                              >
                                {state === "expired" ? t.list.expired : t.list.expiring}
                              </span>
                            ) : null}
                            {player.secondary_positions.length > 0 ? (
                              <span>
                                {t.list.also}: {player.secondary_positions.map((value) => short[value]).join(", ")}
                              </span>
                            ) : null}
                            {player.defense_positions.length > 0 ? (
                              <span>
                                {t.list.defense}: {player.defense_positions.join(", ")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <Link
                          href={`/club/squad/${player.id}/edit`}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-slate-200 bg-white text-navy-900 hover:border-brand-300 hover:text-brand-600"
                          title={t.list.edit}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">
                            {t.list.edit}: {player.first_name} {player.last_name}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "default"
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="metric-kicker">{label}</p>
          <p className="metric-value">{value}</p>
        </div>
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md",
            tone === "danger" ? "bg-red-50 text-red-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-700"
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
