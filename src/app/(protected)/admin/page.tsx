import Link from "next/link";
import { Download, Eye, FileSpreadsheet, Search, Users } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNeedsInbox, AdminQuickFilters } from "@/features/admin/dashboard-widgets";
import { AdminVisualSummary } from "@/features/admin/visual-summary";
import { NeedBadges } from "@/features/player-needs/need-badges";
import { normalizeAdminNeedFilters, filtersToQuery } from "@/features/admin/filters";
import {
  LEAGUES,
  POSITIONS,
  PRIORITIES,
  SEASONS,
  STATUSES,
  PRIORITY_LABELS,
  STATUS_LABELS
} from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { PlayerNeedWithClub } from "@/types/domain";

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const filters = normalizeAdminNeedFilters(params);
  const exportQuery = filtersToQuery(filters);

  let query = supabase
    .from("player_needs")
    .select("*, clubs!inner(id,name,country,league,city,website,created_at,updated_at)")
    .order("created_at", { ascending: false });

  if (filters.q) query = query.ilike("clubs.name", `%${filters.q}%`);
  if (filters.league) query = query.eq("clubs.league", filters.league);
  if (filters.season) query = query.eq("season", filters.season);
  if (filters.position) query = query.eq("position", filters.position);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);

  const { data = [] } = await query;
  const needs = data as PlayerNeedWithClub[];
  const { data: inboxRows = [] } = await supabase
    .from("player_needs")
    .select("*, clubs!inner(id,name,country,league,city,website,created_at,updated_at)")
    .order("updated_at", { ascending: false })
    .limit(5);
  const inboxNeeds = inboxRows as PlayerNeedWithClub[];
  const openCount = needs.filter((need) => need.status === "offen").length;
  const highCount = needs.filter((need) => need.priority === "hoch").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="KW Sports Admin"
        title="Alle Kaderbedarfe"
        description="Zentrale Übersicht über offene Positionen, Saison, Liga und Status."
        actions={
          <>
            <LinkButton href="/admin/users" variant="secondary">
              <Users className="h-4 w-4" aria-hidden="true" />
              Nutzer
            </LinkButton>
            <LinkButton
              href={`/admin/export${exportQuery ? `?${exportQuery}` : ""}`}
              variant="accent"
              className="border border-[#0b55e8] bg-[#0b55e8] text-white shadow-md shadow-[#0b55e8]/25 hover:bg-[#074bd3]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              CSV Export
            </LinkButton>
            <LinkButton
              href={`/admin/export/xlsx${exportQuery ? `?${exportQuery}` : ""}`}
              variant="primary"
              className="border border-navy-950 bg-navy-950 text-white shadow-md shadow-black/20 hover:bg-navy-800"
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              Excel Export
            </LinkButton>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric label="Treffer" value={needs.length} />
        <Metric label="Offen" value={openCount} />
        <Metric label="Hohe Priorität" value={highCount} />
      </section>

      <AdminVisualSummary needs={needs} />

      <AdminQuickFilters activeFilters={filters} />

      <form action="/admin" className="panel grid gap-4 p-5 md:grid-cols-4 lg:grid-cols-6">
        <Field label="Verein" htmlFor="q" className="md:col-span-2">
          <Input id="q" name="q" defaultValue={filters.q || ""} placeholder="Vereinsname" />
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

        <Field label="Position" htmlFor="position">
          <Select id="position" name="position" defaultValue={filters.position || ""}>
            <option value="">Alle</option>
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
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

        <div className="flex items-end gap-2 md:col-span-4 lg:col-span-6">
          <Button type="submit">
            <Search className="h-4 w-4" aria-hidden="true" />
            Filtern
          </Button>
          <LinkButton href="/admin" variant="secondary">
            Zurücksetzen
          </LinkButton>
        </div>
      </form>

      <AdminNeedsInbox needs={inboxNeeds} />

      <section className="panel overflow-hidden">
        <div className="hidden grid-cols-[1.25fr_0.8fr_0.7fr_0.8fr_1fr_0.5fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase text-slate-500 lg:grid">
          <span>Verein</span>
          <span>Liga</span>
          <span>Position</span>
          <span>Saison</span>
          <span>Status</span>
          <span className="text-right">Detail</span>
        </div>

        <div className="divide-y divide-slate-200">
          {needs.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">Keine Bedarfe für diese Filter.</div>
          ) : (
            needs.map((need) => (
              <article
                key={need.id}
                className="grid gap-4 px-5 py-4 lg:grid-cols-[1.25fr_0.8fr_0.7fr_0.8fr_1fr_0.5fr] lg:items-center"
              >
                <div>
                  <Link
                    href={`/admin/clubs/${need.clubs.id}`}
                    className="font-bold text-navy-950 hover:text-navy-700"
                  >
                    {need.clubs.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    {need.clubs.city} · benötigt ab {formatDate(need.needed_from_date)}
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-700">{need.clubs.league}</p>
                <p className="text-base font-bold text-navy-950">{need.position}</p>
                <p className="text-sm text-slate-700">{need.season}</p>
                <NeedBadges need={need} />
                <div className="flex justify-start lg:justify-end">
                  <Link
                    href={`/admin/needs/${need.id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-navy-900 hover:bg-slate-50"
                    title="Bedarf öffnen"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Bedarf öffnen</span>
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel px-5 py-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-navy-950">{value}</p>
    </div>
  );
}
