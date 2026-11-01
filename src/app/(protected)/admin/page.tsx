import { Download, FileSpreadsheet, PlusCircle, Users } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/form";
import { AdminNeedsInbox, AdminQuickFilters } from "@/features/admin/dashboard-widgets";
import { AdminVisualSummary } from "@/features/admin/visual-summary";
import { applyNeedFilters, normalizeAdminNeedFilters, filtersToQuery } from "@/features/admin/filters";
import { NeedsOverview, parseOverviewView } from "@/features/needs-overview/needs-overview";
import {
  COUNTRIES,
  DEFENSE_GROUPS,
  LEAGUES,
  NEED_TYPES,
  PRIORITIES,
  PRIORITY_LABELS,
  SEASONS,
  STATUSES,
  STATUS_LABELS
} from "@/lib/constants";
import { CLUB_DEFENSE_GROUP_LABELS, CLUB_NEED_TYPE_LABELS } from "@/lib/club-i18n";
import { overviewCopy } from "@/lib/overview-i18n";
import { requireAdmin } from "@/lib/auth";
import type { PlayerNeedWithClub } from "@/types/domain";

const CLUB_COLUMNS = "id,name,country,league,city,website,logo_path,created_at,updated_at";

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const filters = normalizeAdminNeedFilters(params);
  const view = parseOverviewView(params.view);
  const exportQuery = filtersToQuery(filters);

  // Everything except the position is filtered in the database; the demand court needs
  // the counts for all positions and applies the position filter itself.
  const query = supabase
    .from("player_needs")
    .select(`*, clubs!inner(${CLUB_COLUMNS})`)
    .order("created_at", { ascending: false });

  const { data = [] } = await applyNeedFilters(query, { ...filters, position: undefined });
  const needs = data as PlayerNeedWithClub[];
  const { data: inboxRows = [] } = await supabase
    .from("player_needs")
    .select(`*, clubs!inner(${CLUB_COLUMNS})`)
    .order("updated_at", { ascending: false })
    .limit(5);
  const inboxNeeds = inboxRows as PlayerNeedWithClub[];
  const { data: agencyCount } = await supabase.rpc("agency_count");
  const summaryNeeds = filters.position ? needs.filter((need) => need.attack_positions.includes(filters.position!)) : needs;

  return (
    <NeedsOverview
      basePath="/admin"
      locale="de"
      copy={overviewCopy.de}
      eyebrow="KW Sports Admin · Alle Kaderbedarfe"
      view={view}
      needs={needs}
      filters={filters}
      agencyCount={agencyCount ?? 0}
      detailHref={(id) => `/admin/needs/${id}`}
      clubHref={(id) => `/admin/clubs/${id}`}
      actions={
        <>
          <LinkButton href="/admin/needs/new" variant="accent">
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Bedarf anlegen
          </LinkButton>
          <LinkButton href="/admin/users" variant="secondary">
            <Users className="h-4 w-4" aria-hidden="true" />
            Nutzer
          </LinkButton>
          <LinkButton href={`/admin/export${exportQuery ? `?${exportQuery}` : ""}`} variant="secondary">
            <Download className="h-4 w-4" aria-hidden="true" />
            CSV
          </LinkButton>
          <LinkButton href={`/admin/export/xlsx${exportQuery ? `?${exportQuery}` : ""}`} variant="secondary">
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            Excel
          </LinkButton>
        </>
      }
      quickFilters={<AdminQuickFilters activeFilters={filters} />}
      inbox={<AdminNeedsInbox needs={inboxNeeds} />}
      summary={<AdminVisualSummary needs={summaryNeeds} />}
      filterFields={
        <>
          <Field label="Land" htmlFor="country">
            <Select id="country" name="country" defaultValue={filters.country || ""}>
              <option value="">Alle</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Liga" htmlFor="league">
            <Select id="league" name="league" defaultValue={filters.league || ""}>
              <option value="">Alle</option>
              {LEAGUES.map((league) => (
                <option key={league} value={league}>
                  {league}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Saison" htmlFor="season">
            <Select id="season" name="season" defaultValue={filters.season || ""}>
              <option value="">Alle</option>
              {SEASONS.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Art" htmlFor="type">
            <Select id="type" name="type" defaultValue={filters.type || ""}>
              <option value="">Alle</option>
              {NEED_TYPES.map((needType) => (
                <option key={needType} value={needType}>
                  {CLUB_NEED_TYPE_LABELS.de[needType]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Abwehr" htmlFor="defense">
            <Select id="defense" name="defense" defaultValue={filters.defense || ""}>
              <option value="">Alle</option>
              {DEFENSE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {CLUB_DEFENSE_GROUP_LABELS.de[group]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={filters.status || ""}>
              <option value="">Alle</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priorität" htmlFor="priority">
            <Select id="priority" name="priority" defaultValue={filters.priority || ""}>
              <option value="">Alle</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </Select>
          </Field>
        </>
      }
    />
  );
}
