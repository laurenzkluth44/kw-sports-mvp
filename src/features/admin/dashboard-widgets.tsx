import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { filtersToQuery, type AdminNeedFilters } from "@/features/admin/filters";
import type { PlayerNeedWithClub } from "@/types/domain";

const quickFilters: Array<{ label: string; filters: AdminNeedFilters }> = [
  { label: "Offen", filters: { status: "offen" } },
  { label: "Hohe Priorität", filters: { priority: "hoch" } },
  { label: "RL 2026/27", filters: { position: "RL", season: "2026/27" } },
  { label: "3. Liga Süd", filters: { league: "3. Liga Süd" } },
  { label: "Besetzt", filters: { status: "besetzt" } }
];

export function AdminQuickFilters({ activeFilters }: { activeFilters: AdminNeedFilters }) {
  const activeQuery = filtersToQuery(activeFilters);

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-black uppercase text-navy-950">Schnellfilter</h2>
          <p className="mt-1 text-sm text-neutral-500">Häufige Sichten ohne Umweg öffnen.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickLink href="/admin" active={!activeQuery}>
            Alle
          </QuickLink>
          {quickFilters.map((item) => {
            const query = filtersToQuery(item.filters);
            return (
              <QuickLink key={item.label} href={`/admin?${query}`} active={query === activeQuery}>
                {item.label}
              </QuickLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AdminNeedsInbox({ needs }: { needs: PlayerNeedWithClub[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <h2 className="text-lg font-black uppercase text-navy-950">Needs Inbox</h2>
          <p className="mt-1 text-sm text-neutral-500">Zuletzt angelegte oder aktualisierte Bedarfe.</p>
        </div>
        <Activity className="h-5 w-5 text-brand-600" aria-hidden="true" />
      </div>

      <div className="divide-y divide-slate-200">
        {needs.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">Keine aktuellen Änderungen.</p>
        ) : (
          needs.map((need) => (
            <Link
              key={need.id}
              href={`/admin/needs/${need.id}`}
              className="grid gap-3 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <span className="min-w-0">
                <span className="block truncate font-bold text-navy-950">
                  {need.clubs.name} · {need.position} · {need.season}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {STATUS_LABELS[need.status]} · {PRIORITY_LABELS[need.priority]} · aktualisiert {formatDate(need.updated_at)}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

function QuickLink({
  href,
  active,
  children
}: {
  href: string;
  active?: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "inline-flex min-h-10 items-center rounded-md bg-navy-950 px-3 py-2 text-sm font-black uppercase text-white"
          : "inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-black uppercase text-navy-900 hover:bg-slate-50"
      }
    >
      {children}
    </Link>
  );
}
