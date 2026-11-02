import { ShieldCheck } from "lucide-react";
import { Field, Select } from "@/components/ui/form";
import { AdminNeedsInbox, AdminQuickFilters } from "@/features/admin/dashboard-widgets";
import { AdminVisualSummary } from "@/features/admin/visual-summary";
import { applyNeedFilters, normalizeAdminNeedFilters } from "@/features/admin/filters";
import { NeedsOverview, parseOverviewView } from "@/features/needs-overview/needs-overview";
import { COUNTRIES, DEFENSE_GROUPS, LEAGUES, NEED_TYPES, PRIORITIES, SEASONS, STATUSES } from "@/lib/constants";
import { agencyCopy } from "@/lib/agency-i18n";
import { requireAgency } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import {
  CLUB_DEFENSE_GROUP_LABELS,
  CLUB_NEED_TYPE_LABELS,
  CLUB_PRIORITY_LABELS,
  CLUB_STATUS_LABELS
} from "@/lib/club-i18n";
import { overviewCopy } from "@/lib/overview-i18n";
import type { PlayerNeedWithClub } from "@/types/domain";

const CLUB_COLUMNS = "id,name,country,league,city,website,logo_path,created_at,updated_at";

export default async function AgencyDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { supabase, profile } = await requireAgency();
  const locale = await getClubLocale();
  const t = agencyCopy[locale].dashboard;
  const statusLabels = CLUB_STATUS_LABELS[locale];
  const priorityLabels = CLUB_PRIORITY_LABELS[locale];
  const params = await searchParams;
  const filters = normalizeAdminNeedFilters(params);
  const view = parseOverviewView(params.view);

  const query = supabase
    .from("player_needs")
    .select(`*, clubs!inner(${CLUB_COLUMNS})`)
    .order("created_at", { ascending: false });

  const [{ data = [] }, { data: inboxRows = [] }] = await Promise.all([
    applyNeedFilters(query, { ...filters, position: undefined }),
    supabase.from("player_needs").select(`*, clubs!inner(${CLUB_COLUMNS})`).order("updated_at", { ascending: false }).limit(5)
  ]);
  const needs = data as PlayerNeedWithClub[];
  const inboxNeeds = inboxRows as PlayerNeedWithClub[];
  const summaryNeeds = filters.position ? needs.filter((need) => need.attack_positions.includes(filters.position!)) : needs;

  return (
    <NeedsOverview
      basePath="/agency"
      locale={locale}
      copy={overviewCopy[locale]}
      eyebrow={profile.agency_name || agencyCopy[locale].app.tagline}
      view={view}
      showAll={params.alle === "1"}
      needs={needs}
      filters={filters}
      detailHref={(id) => `/agency/needs/${id}`}
      actions={
        <span className="inline-flex min-h-10 items-center gap-2 border border-white/20 px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-brand-300">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {t.readOnly}
        </span>
      }
      quickFilters={<AdminQuickFilters activeFilters={filters} basePath="/agency" copy={t.quickFilters} />}
      inbox={<AdminNeedsInbox needs={inboxNeeds} basePath="/agency" copy={t.inbox} locale={locale} />}
      summary={<AdminVisualSummary needs={summaryNeeds} locale={locale} copy={agencyCopy[locale].visualSummary} />}
      filterFields={
        <>
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
          <Field label={t.filters.type} htmlFor="type">
            <Select id="type" name="type" defaultValue={filters.type || ""}>
              <option value="">{t.filters.all}</option>
              {NEED_TYPES.map((needType) => (
                <option key={needType} value={needType}>
                  {CLUB_NEED_TYPE_LABELS[locale][needType]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.filters.defense} htmlFor="defense">
            <Select id="defense" name="defense" defaultValue={filters.defense || ""}>
              <option value="">{t.filters.all}</option>
              {DEFENSE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {CLUB_DEFENSE_GROUP_LABELS[locale][group]}
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
        </>
      }
    />
  );
}
