import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { CLUB_POSITION_LABELS, CLUB_PRIORITY_LABELS, CLUB_STATUS_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { formatDate } from "@/lib/utils";
import { filtersToQuery, type AdminNeedFilters } from "@/features/admin/filters";
import type { PlayerNeedWithClub } from "@/types/domain";

type QuickFilterCopy = {
  title: string;
  subtitle: string;
  all: string;
  open: string;
  highPriority: string;
  season2026: string;
  bundesliga: string;
  filled: string;
};

type InboxCopy = {
  title: string;
  subtitle: string;
  empty: string;
  updated: string;
};

const defaultQuickFilterCopy: QuickFilterCopy = {
  title: "Schnellfilter",
  subtitle: "Häufige Sichten ohne Umweg öffnen.",
  all: "Alle",
  open: "Offen",
  highPriority: "Hohe Priorität",
  season2026: "2026/27",
  bundesliga: "1. Bundesliga",
  filled: "Besetzt"
};

const defaultInboxCopy: InboxCopy = {
  title: "Needs Inbox",
  subtitle: "Zuletzt angelegte oder aktualisierte Bedarfe.",
  empty: "Keine aktuellen Änderungen.",
  updated: "aktualisiert"
};

const quickFilters: Array<{ copyKey: keyof Omit<QuickFilterCopy, "title" | "subtitle" | "all">; filters: AdminNeedFilters }> = [
  { copyKey: "open", filters: { status: "offen" } },
  { copyKey: "highPriority", filters: { priority: "hoch" } },
  { copyKey: "season2026", filters: { season: "2026/27" } },
  { copyKey: "bundesliga", filters: { league: "1. Bundesliga" } },
  { copyKey: "filled", filters: { status: "besetzt" } }
];

export function AdminQuickFilters({
  activeFilters,
  basePath = "/admin",
  copy = defaultQuickFilterCopy
}: {
  activeFilters: AdminNeedFilters;
  basePath?: "/admin" | "/agency";
  copy?: QuickFilterCopy;
}) {
  const activeQuery = filtersToQuery(activeFilters);

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="section-heading">{copy.title}</h2>
          <p className="section-subtitle">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickLink href={basePath} active={!activeQuery}>
            {copy.all}
          </QuickLink>
          {quickFilters.map((item) => {
            const query = filtersToQuery(item.filters);
            return (
              <QuickLink key={item.copyKey} href={`${basePath}?${query}`} active={query === activeQuery}>
                {copy[item.copyKey]}
              </QuickLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AdminNeedsInbox({
  needs,
  basePath = "/admin",
  copy = defaultInboxCopy,
  locale
}: {
  needs: PlayerNeedWithClub[];
  basePath?: "/admin" | "/agency";
  copy?: InboxCopy;
  locale?: ClubLocale;
}) {
  const statusLabels = locale ? CLUB_STATUS_LABELS[locale] : STATUS_LABELS;
  const priorityLabels = locale ? CLUB_PRIORITY_LABELS[locale] : PRIORITY_LABELS;
  const positionLabels = locale ? CLUB_POSITION_LABELS[locale] : null;

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <div>
          <h2 className="section-heading">{copy.title}</h2>
          <p className="section-subtitle">{copy.subtitle}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Activity className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="divide-y divide-slate-200">
        {needs.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">{copy.empty}</p>
        ) : (
          needs.map((need) => (
            <Link
              key={need.id}
              href={`${basePath}/needs/${need.id}`}
              className="data-row grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <span className="min-w-0">
                <span className="block truncate font-bold text-navy-950">
                  {need.clubs.name} · {positionLabels?.[need.position] ?? need.position} · {need.season}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {statusLabels[need.status]} · {priorityLabels[need.priority]} · {copy.updated}{" "}
                  {formatDate(need.updated_at, locale)}
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
          ? "inline-flex min-h-10 items-center rounded-md border border-brand-500 bg-brand-500 px-3 py-2 text-sm font-black uppercase text-white shadow-sm shadow-brand-500/20"
          : "inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-black uppercase text-navy-900 shadow-sm hover:border-brand-100 hover:bg-brand-50"
      }
    >
      {children}
    </Link>
  );
}
