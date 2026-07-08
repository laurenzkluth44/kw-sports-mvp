import {
  AlertTriangle,
  ClipboardList,
  Eye,
  Search,
  ShieldCheck,
  Target,
  type LucideIcon
} from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNeedsInbox, AdminQuickFilters } from "@/features/admin/dashboard-widgets";
import { AdminVisualSummary } from "@/features/admin/visual-summary";
import { normalizeAdminNeedFilters } from "@/features/admin/filters";
import { NeedBadges } from "@/features/player-needs/need-badges";
import {
  COUNTRIES,
  LEAGUES,
  POSITIONS,
  PRIORITIES,
  SEASONS,
  STATUSES
} from "@/lib/constants";
import { agencyCopy } from "@/lib/agency-i18n";
import { requireAgency } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { CLUB_POSITION_LABELS, CLUB_PRIORITY_LABELS, CLUB_STATUS_LABELS } from "@/lib/club-i18n";
import { formatDate } from "@/lib/utils";
import type { PlayerNeedWithClub } from "@/types/domain";

export default async function AgencyDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { supabase, profile } = await requireAgency();
  const locale = await getClubLocale();
  const t = agencyCopy[locale].dashboard;
  const positionLabels = CLUB_POSITION_LABELS[locale];
  const statusLabels = CLUB_STATUS_LABELS[locale];
  const priorityLabels = CLUB_PRIORITY_LABELS[locale];
  const params = await searchParams;
  const filters = normalizeAdminNeedFilters(params);

  let query = supabase
    .from("player_needs")
    .select("*, clubs!inner(id,name,country,league,city,website,logo_path,created_at,updated_at)")
    .order("created_at", { ascending: false });

  if (filters.q) query = query.ilike("clubs.name", `%${filters.q}%`);
  if (filters.country) query = query.eq("clubs.country", filters.country);
  if (filters.league) query = query.eq("clubs.league", filters.league);
  if (filters.season) query = query.eq("season", filters.season);
  if (filters.position) query = query.eq("position", filters.position);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);

  const { data = [] } = await query;
  const needs = data as PlayerNeedWithClub[];
  const { data: inboxRows = [] } = await supabase
    .from("player_needs")
    .select("*, clubs!inner(id,name,country,league,city,website,logo_path,created_at,updated_at)")
    .order("updated_at", { ascending: false })
    .limit(5);
  const inboxNeeds = inboxRows as PlayerNeedWithClub[];
  const openCount = needs.filter((need) => need.status === "offen").length;
  const highCount = needs.filter((need) => need.priority === "hoch").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={profile.agency_name || agencyCopy[locale].app.tagline}
        title={t.title}
        description={t.description}
        actions={
          <span className="inline-flex min-h-10 items-center gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-black uppercase text-brand-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {t.readOnly}
          </span>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric icon={ClipboardList} label={t.metrics.hits.label} value={needs.length} caption={t.metrics.hits.caption} />
        <Metric icon={Target} label={t.metrics.open.label} value={openCount} caption={t.metrics.open.caption} />
        <Metric
          icon={AlertTriangle}
          label={t.metrics.highPriority.label}
          value={highCount}
          caption={t.metrics.highPriority.caption}
          tone="danger"
        />
      </section>

      <AdminVisualSummary needs={needs} locale={locale} copy={agencyCopy[locale].visualSummary} />

      <AdminQuickFilters activeFilters={filters} basePath="/agency" copy={t.quickFilters} />

      <form action="/agency" className="panel overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-heading">{t.filters.title}</h2>
            <p className="section-subtitle">{t.filters.subtitle}</p>
          </div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            {needs.length} {t.filters.resultCount}
          </p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-4 lg:grid-cols-8">
          <Field label={t.filters.club} htmlFor="q" className="md:col-span-2">
            <Input id="q" name="q" defaultValue={filters.q || ""} placeholder={t.filters.clubPlaceholder} />
          </Field>

          <Field label={t.filters.country} htmlFor="country">
            <Select id="country" name="country" defaultValue={filters.country || ""}>
              <option value="">{t.filters.all}</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {t.countries[country]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.filters.league} htmlFor="league">
            <Select id="league" name="league" defaultValue={filters.league || ""}>
              <option value="">{t.filters.all}</option>
              {LEAGUES.map((league) => (
                <option key={league} value={league}>
                  {league}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.filters.season} htmlFor="season">
            <Select id="season" name="season" defaultValue={filters.season || ""}>
              <option value="">{t.filters.all}</option>
              {SEASONS.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.filters.position} htmlFor="position">
            <Select id="position" name="position" defaultValue={filters.position || ""}>
              <option value="">{t.filters.all}</option>
              {POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {positionLabels[position]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.filters.status} htmlFor="status">
            <Select id="status" name="status" defaultValue={filters.status || ""}>
              <option value="">{t.filters.all}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.filters.priority} htmlFor="priority">
            <Select id="priority" name="priority" defaultValue={filters.priority || ""}>
              <option value="">{t.filters.all}</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex items-end gap-2 md:col-span-4 lg:col-span-8">
            <Button type="submit">
              <Search className="h-4 w-4" aria-hidden="true" />
              {t.filters.submit}
            </Button>
            <LinkButton href="/agency" variant="secondary">
              {t.filters.reset}
            </LinkButton>
          </div>
        </div>
      </form>

      <AdminNeedsInbox needs={inboxNeeds} basePath="/agency" copy={t.inbox} locale={locale} />

      <section className="panel overflow-hidden">
        <div className="table-header hidden grid-cols-[1.25fr_0.8fr_0.7fr_0.8fr_1fr_0.5fr] gap-4 lg:grid">
          <span>{t.table.club}</span>
          <span>{t.table.league}</span>
          <span>{t.table.position}</span>
          <span>{t.table.season}</span>
          <span>{t.table.status}</span>
          <span className="text-right">{t.table.detail}</span>
        </div>

        <div className="divide-y divide-slate-200">
          {needs.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">{t.table.noResults}</div>
          ) : (
            needs.map((need) => (
              <article
                key={need.id}
                className="data-row grid gap-4 lg:grid-cols-[1.25fr_0.8fr_0.7fr_0.8fr_1fr_0.5fr] lg:items-center"
              >
                <div>
                  <p className="font-bold text-navy-950">{need.clubs.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {need.clubs.city} · {t.table.neededFrom} {formatDate(need.needed_from_date, locale)}
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-700">
                  <span className="mr-2 text-xs font-black uppercase text-slate-400 lg:hidden">{t.table.league}</span>
                  {need.clubs.league}
                </p>
                <p className="text-base font-bold text-navy-950">
                  <span className="mr-2 text-xs font-black uppercase text-slate-400 lg:hidden">{t.table.position}</span>
                  {positionLabels[need.position]}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="mr-2 text-xs font-black uppercase text-slate-400 lg:hidden">{t.table.season}</span>
                  {need.season}
                </p>
                <NeedBadges need={need} locale={locale} />
                <div className="flex justify-start lg:justify-end">
                  <LinkButton href={`/agency/needs/${need.id}`} variant="secondary" className="h-10 w-10 px-0">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{t.table.openNeed}</span>
                  </LinkButton>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  caption,
  tone = "default"
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  caption: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="metric-kicker">{label}</p>
          <p className="metric-value">{value}</p>
        </div>
        <span
          className={
            tone === "danger"
              ? "flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-700"
              : "flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700"
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-slate-500">{caption}</p>
    </div>
  );
}
