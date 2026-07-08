import {
  LEAGUES,
  POSITIONS,
  PRIORITIES,
  PRIORITY_LABELS,
  SEASONS,
  STATUSES,
  STATUS_LABELS
} from "@/lib/constants";
import { CLUB_POSITION_LABELS, CLUB_PRIORITY_LABELS, CLUB_STATUS_LABELS, type ClubLocale } from "@/lib/club-i18n";
import type { PlayerNeedWithClub } from "@/types/domain";
import type { ReactNode } from "react";

type ChartDatum = {
  label: string;
  value: number;
  color: string;
};

type VisualSummaryCopy = {
  title: string;
  subtitle: string;
  positions: string;
  positionsSubtitle: string;
  leagues: string;
  leaguesSubtitle: string;
  priority: string;
  prioritySubtitle: string;
  noData: string;
  noPositions: string;
  noLeagues: string;
  noPriorities: string;
  needs: string;
  topSeason: string;
  topStatus: string;
  new30Days: string;
  clubsWithNeeds: string;
  stale: string;
};

const defaultCopy: VisualSummaryCopy = {
  title: "Visual Summary",
  subtitle: "Die wichtigsten Muster im aktuellen Admin-Filter auf einen Blick.",
  positions: "Positionen",
  positionsSubtitle: "Gesuchte Positionen im aktuellen Filter",
  leagues: "Ligen",
  leaguesSubtitle: "Verteilung der Bedarfe nach Liga",
  priority: "Priorität",
  prioritySubtitle: "Dringlichkeit der Suchaufträge",
  noData: "Keine Daten",
  noPositions: "Keine Positionen im aktuellen Filter.",
  noLeagues: "Keine Liga-Daten im aktuellen Filter.",
  noPriorities: "Keine Prioritäten im aktuellen Filter.",
  needs: "Bedarfe",
  topSeason: "Top Saison",
  topStatus: "Top Status",
  new30Days: "Neue Bedarfe 30T",
  clubsWithNeeds: "Vereine mit Bedarf",
  stale: "Bitte aktualisieren"
};

const chartColors = [
  "#0055ff",
  "#003399",
  "#16a34a",
  "#f59e0b",
  "#0a0a0a",
  "#9ca3af",
  "#7aa8ff",
  "#4b4b45",
  "#60a5fa",
  "#d1d5db"
];

export function AdminVisualSummary({
  needs,
  copy = defaultCopy,
  locale
}: {
  needs: PlayerNeedWithClub[];
  copy?: VisualSummaryCopy;
  locale?: ClubLocale;
}) {
  const positionLabels = locale ? CLUB_POSITION_LABELS[locale] : null;
  const priorityLabels = locale ? CLUB_PRIORITY_LABELS[locale] : PRIORITY_LABELS;
  const statusLabels = locale ? CLUB_STATUS_LABELS[locale] : STATUS_LABELS;

  const positionData = POSITIONS.map((position, index) => ({
    label: positionLabels?.[position] ?? position,
    value: needs.filter((need) => need.position === position).length,
    color: chartColors[index % chartColors.length]
  }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const leagueData = LEAGUES.map((league, index) => ({
    label: league,
    value: needs.filter((need) => need.clubs.league === league).length,
    color: chartColors[index % chartColors.length]
  }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const priorityData = PRIORITIES.map((priority, index) => ({
    label: priorityLabels[priority],
    value: needs.filter((need) => need.priority === priority).length,
    color: ["#dc2626", "#0055ff", "#6b7280"][index]
  }));

  const seasonData = SEASONS.map((season, index) => ({
    label: season,
    value: needs.filter((need) => need.season === season).length,
    color: chartColors[index % chartColors.length]
  })).filter((item) => item.value > 0);

  const statusData = STATUSES.map((status, index) => ({
    label: statusLabels[status],
    value: needs.filter((need) => need.status === status).length,
    color: ["#0055ff", "#003399", "#0a0a0a", "#9ca3af"][index]
  }));

  const recentlyCreatedCount = needs.filter((need) => isWithinDays(need.created_at, 30)).length;
  const staleCount = needs.filter((need) => need.last_confirmed_at && !isWithinDays(need.last_confirmed_at, 30)).length;
  const clubsWithNeedsCount = new Set(needs.map((need) => need.club_id)).size;
  const topSeason = [...seasonData].sort((a, b) => b.value - a.value)[0];
  const topStatus = [...statusData].filter((item) => item.value > 0).sort((a, b) => b.value - a.value)[0];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-heading">{copy.title}</h2>
          <p className="section-subtitle">{copy.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_0.85fr]">
        <SummaryPanel title={copy.positions} subtitle={copy.positionsSubtitle}>
          <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
            <DonutChart data={positionData} copy={copy} />
            <Legend data={positionData} emptyText={copy.noPositions} />
          </div>
        </SummaryPanel>

        <SummaryPanel title={copy.leagues} subtitle={copy.leaguesSubtitle}>
          <BarChart data={leagueData} emptyText={copy.noLeagues} />
        </SummaryPanel>

        <SummaryPanel title={copy.priority} subtitle={copy.prioritySubtitle}>
          <BarChart data={priorityData} emptyText={copy.noPriorities} compact />
        </SummaryPanel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MiniMetric label={copy.topSeason} value={topSeason?.label || "-"} />
        <MiniMetric label={copy.topStatus} value={topStatus?.label || "-"} />
        <MiniMetric label={copy.new30Days} value={recentlyCreatedCount} />
        <MiniMetric label={copy.clubsWithNeeds} value={clubsWithNeedsCount} />
        <MiniMetric label={copy.stale} value={staleCount} tone={staleCount > 0 ? "warning" : "default"} />
      </div>
    </section>
  );
}

function SummaryPanel({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <h3 className="section-heading">{title}</h3>
        <p className="section-subtitle">{subtitle}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DonutChart({ data, copy }: { data: ChartDatum[]; copy: VisualSummaryCopy }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 44;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-sm text-neutral-500">
        {copy.noData}
      </div>
    );
  }

  return (
    <div className="relative flex h-44 items-center justify-center rounded-md bg-slate-50/80">
      <svg viewBox="0 0 128 128" className="h-44 w-44 -rotate-90" role="img" aria-label={`${copy.positions} Donut Chart`}>
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        {data.map((item) => {
          const length = (item.value / total) * circumference;
          const segment = (
            <circle
              key={item.label}
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={stroke}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
            />
          );
          offset += length;
          return segment;
        })}
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-black text-navy-950">{total}</p>
        <p className="text-xs font-black uppercase text-neutral-500">{copy.needs}</p>
      </div>
    </div>
  );
}

function Legend({ data, emptyText }: { data: ChartDatum[]; emptyText: string }) {
  if (data.length === 0) return <p className="text-sm text-neutral-500">{emptyText}</p>;

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-sm hover:bg-slate-50">
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="truncate font-medium text-neutral-700">{item.label}</span>
          </span>
          <span className="font-black text-navy-950">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function BarChart({
  data,
  emptyText,
  compact = false
}: {
  data: ChartDatum[];
  emptyText: string;
  compact?: boolean;
}) {
  const max = Math.max(...data.map((item) => item.value), 0);
  const visibleData = data.filter((item) => item.value > 0);

  if (visibleData.length === 0) return <p className="text-sm text-neutral-500">{emptyText}</p>;

  return (
    <div className={compact ? "space-y-4" : "space-y-3"}>
      {visibleData.map((item) => {
        const width = max > 0 ? Math.max((item.value / max) * 100, 8) : 0;

        return (
          <div key={item.label} className="space-y-1.5 rounded-md px-2 py-1 hover:bg-slate-50">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-neutral-700">{item.label}</span>
              <span className="font-black text-navy-950">{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: number | string;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={
        tone === "warning"
          ? "rounded-md border border-amber-200 bg-amber-50 px-4 py-3"
          : "rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm"
      }
    >
      <p className={tone === "warning" ? "text-xs font-black uppercase text-amber-700" : "text-xs font-black uppercase text-neutral-500"}>
        {label}
      </p>
      <p className="mt-1 truncate text-2xl font-black text-navy-950">{value}</p>
    </div>
  );
}

function isWithinDays(value: string | null | undefined, days: number) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;

  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}
