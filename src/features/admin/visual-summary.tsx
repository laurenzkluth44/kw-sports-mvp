import {
  LEAGUES,
  POSITIONS,
  PRIORITIES,
  PRIORITY_LABELS,
  SEASONS,
  STATUSES,
  STATUS_LABELS
} from "@/lib/constants";
import type { PlayerNeedWithClub } from "@/types/domain";
import type { ReactNode } from "react";

type ChartDatum = {
  label: string;
  value: number;
  color: string;
};

const chartColors = [
  "#0b55e8",
  "#073aa5",
  "#7aa8ff",
  "#10100e",
  "#4b4b45",
  "#9ca3af",
  "#1f2937",
  "#60a5fa",
  "#d1d5db"
];

export function AdminVisualSummary({ needs }: { needs: PlayerNeedWithClub[] }) {
  const positionData = POSITIONS.map((position, index) => ({
    label: position,
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
    label: PRIORITY_LABELS[priority],
    value: needs.filter((need) => need.priority === priority).length,
    color: ["#dc2626", "#0b55e8", "#6b7280"][index]
  }));

  const seasonData = SEASONS.map((season, index) => ({
    label: season,
    value: needs.filter((need) => need.season === season).length,
    color: chartColors[index % chartColors.length]
  })).filter((item) => item.value > 0);

  const statusData = STATUSES.map((status, index) => ({
    label: STATUS_LABELS[status],
    value: needs.filter((need) => need.status === status).length,
    color: ["#0b55e8", "#073aa5", "#10100e", "#9ca3af"][index]
  }));

  const recentlyCreatedCount = needs.filter((need) => isWithinDays(need.created_at, 30)).length;
  const staleCount = needs.filter((need) => need.last_confirmed_at && !isWithinDays(need.last_confirmed_at, 30)).length;
  const clubsWithNeedsCount = new Set(needs.map((need) => need.club_id)).size;
  const topSeason = seasonData.sort((a, b) => b.value - a.value)[0];
  const topStatus = statusData.sort((a, b) => b.value - a.value)[0];

  return (
    <section className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_0.85fr]">
        <SummaryPanel title="Positionen" subtitle="Gesuchte Positionen im aktuellen Filter">
          <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
            <DonutChart data={positionData} />
            <Legend data={positionData} emptyText="Keine Positionen im aktuellen Filter." />
          </div>
        </SummaryPanel>

        <SummaryPanel title="Ligen" subtitle="Verteilung der Bedarfe nach Liga">
          <BarChart data={leagueData} emptyText="Keine Liga-Daten im aktuellen Filter." />
        </SummaryPanel>

        <SummaryPanel title="Priorität" subtitle="Dringlichkeit der Suchaufträge">
          <BarChart data={priorityData} emptyText="Keine Prioritäten im aktuellen Filter." compact />
        </SummaryPanel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MiniMetric label="Top Saison" value={topSeason?.label || "-"} />
        <MiniMetric label="Top Status" value={topStatus?.label || "-"} />
        <MiniMetric label="Neue Bedarfe 30T" value={recentlyCreatedCount} />
        <MiniMetric label="Vereine mit Bedarf" value={clubsWithNeedsCount} />
        <MiniMetric label="Bitte aktualisieren" value={staleCount} tone={staleCount > 0 ? "warning" : "default"} />
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
    <div className="panel p-5">
      <div className="mb-5">
        <h2 className="text-lg font-black uppercase text-navy-950">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function DonutChart({ data }: { data: ChartDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 44;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-md bg-neutral-50 text-sm text-neutral-500">
        Keine Daten
      </div>
    );
  }

  return (
    <div className="relative flex h-44 items-center justify-center">
      <svg viewBox="0 0 128 128" className="h-44 w-44 -rotate-90" role="img" aria-label="Positionen Donut Chart">
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
        <p className="text-xs font-black uppercase text-neutral-500">Bedarfe</p>
      </div>
    </div>
  );
}

function Legend({ data, emptyText }: { data: ChartDatum[]; emptyText: string }) {
  if (data.length === 0) return <p className="text-sm text-neutral-500">{emptyText}</p>;

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
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
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-neutral-700">{item.label}</span>
              <span className="font-black text-navy-950">{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
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
    <div className={tone === "warning" ? "rounded-md bg-amber-50 px-4 py-3" : "rounded-md bg-neutral-50 px-4 py-3"}>
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
