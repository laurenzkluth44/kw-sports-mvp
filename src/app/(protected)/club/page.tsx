import Link from "next/link";
import { Copy, Edit, Plus } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { NeedBadges } from "@/features/player-needs/need-badges";
import { NeedStatusForm } from "@/features/player-needs/need-status-form";
import { duplicateClubNeedAction } from "@/features/player-needs/actions";
import { STATUS_LABELS } from "@/lib/constants";
import { requireClubUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { PlayerNeed } from "@/types/domain";

export default async function ClubDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, profile } = await requireClubUser();
  const params = await searchParams;

  const { data: needs = [] } = await supabase
    .from("player_needs")
    .select("*")
    .eq("club_id", profile.club_id!)
    .neq("status", "archiviert")
    .order("needed_from_date", { ascending: true });

  const typedNeeds = needs as PlayerNeed[];
  const openCount = typedNeeds.filter((need) => need.status === "offen").length;
  const talksCount = typedNeeds.filter((need) => need.status === "in_gespraechen").length;
  const highCount = typedNeeds.filter((need) => need.priority === "hoch").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={profile.clubs?.name || "Club Dashboard"}
        title="Eigene Kaderbedarfe"
        description="Aktive Suchaufträge deines Vereins."
        actions={
          <LinkButton href="/club/needs/new" variant="accent">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Neuer Bedarf
          </LinkButton>
        }
      />

      {params.error === "status" ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Status konnte nicht geändert werden.
        </div>
      ) : null}
      {params.error === "duplicate" ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Bedarf konnte nicht dupliziert werden.
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric label="Offen" value={openCount} />
        <Metric label="In Gesprächen" value={talksCount} />
        <Metric label="Hohe Priorität" value={highCount} />
      </section>

      {typedNeeds.length === 0 ? (
        <EmptyState
          title="Keine aktiven Bedarfe"
          body="Aktive Suchaufträge erscheinen hier, sobald ein Bedarf angelegt wurde."
          action={
            <LinkButton href="/club/needs/new" variant="accent">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Neuer Bedarf
            </LinkButton>
          }
        />
      ) : (
        <section className="panel overflow-hidden">
          <div className="hidden grid-cols-[0.7fr_0.7fr_0.8fr_1.35fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase text-slate-500 lg:grid">
            <span>Position</span>
            <span>Saison</span>
            <span>Benötigt ab</span>
            <span>Status</span>
            <span className="text-right">Aktion</span>
          </div>

          <div className="divide-y divide-slate-200">
            {typedNeeds.map((need) => {
              const stale = isStaleNeed(need.last_confirmed_at);

              return (
                <article
                  key={need.id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[0.7fr_0.7fr_0.8fr_1.35fr_auto] lg:items-center"
                >
                  <div>
                    <p className="text-base font-bold text-navy-950">{need.position}</p>
                    <p className="mt-1 text-sm text-slate-500 lg:hidden">{need.season}</p>
                    {stale ? (
                      <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        Bitte aktualisieren
                      </p>
                    ) : null}
                  </div>
                  <p className="hidden text-sm font-medium text-slate-700 lg:block">{need.season}</p>
                  <p className="text-sm text-slate-700">{formatDate(need.needed_from_date)}</p>
                  <div className="space-y-3">
                    <NeedBadges need={need} />
                    {need.status_note ? <p className="text-xs text-slate-500">{need.status_note}</p> : null}
                    <NeedStatusForm need={need} />
                  </div>
                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    <form action={duplicateClubNeedAction}>
                      <input type="hidden" name="id" value={need.id} />
                      <Button type="submit" variant="secondary" className="px-3" title="Bedarf als Vorlage kopieren">
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        Als Vorlage kopieren
                      </Button>
                    </form>
                    <Link
                      href={`/club/needs/${need.id}/edit`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-navy-900 hover:bg-slate-50"
                      title="Bedarf bearbeiten"
                    >
                      <Edit className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Bedarf bearbeiten</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="panel px-5 py-4 text-sm text-slate-600">
        Archivierte und besetzte Suchaufträge bleiben gespeichert. Besetzte Bedarfe erscheinen weiterhin, archivierte nicht.
        Aktueller Statusfilter: {STATUS_LABELS.offen}, {STATUS_LABELS.in_gespraechen}, {STATUS_LABELS.besetzt}.
      </section>
    </div>
  );
}

function isStaleNeed(lastConfirmedAt: string) {
  const lastConfirmed = new Date(lastConfirmedAt).getTime();
  if (Number.isNaN(lastConfirmed)) return false;

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - lastConfirmed > thirtyDays;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel px-5 py-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-navy-950">{value}</p>
    </div>
  );
}
