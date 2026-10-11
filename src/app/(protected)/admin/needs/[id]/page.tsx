import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Edit, History, Lock, MessageSquarePlus } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { createAdminNoteAction } from "@/features/admin/productivity-actions";
import { NeedBadges } from "@/features/player-needs/need-badges";
import { TagList, needHeadline, needProfileLabels } from "@/features/player-needs/need-summary";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminNote, AuditLog, PlayerNeedWithClub } from "@/types/domain";

export default async function AdminNeedDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data }, { data: noteRows }, { data: auditLogRows }] = await Promise.all([
    supabase
      .from("player_needs")
      .select("*, clubs!inner(id,name,country,league,city,website,created_at,updated_at), player_need_confidential(note)")
      .eq("id", id)
      .single(),
    supabase
      .from("admin_notes")
      .select("*, users(*)")
      .eq("player_need_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select("*, users(*)")
      .eq("player_need_id", id)
      .order("created_at", { ascending: false })
      .limit(12)
  ]);

  if (!data) redirect("/admin");

  const need = data as PlayerNeedWithClub;
  const confidentialNote = data.player_need_confidential?.note ?? null;
  const labels = needProfileLabels(need);
  const isCoach = need.need_type === "trainer";
  const typedNotes = (noteRows || []) as AdminNote[];
  const typedAuditLogs = (auditLogRows || []) as AuditLog[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={need.clubs.name}
        title={`${needHeadline(need)} · ${need.season}`}
        description={`${need.clubs.league} · ${need.clubs.city} · benötigt ab ${formatDate(need.needed_from_date)}`}
        actions={
          <LinkButton href={`/admin/needs/${need.id}/edit`} variant="accent">
            <Edit className="h-4 w-4" aria-hidden="true" />
            Bearbeiten
          </LinkButton>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryItem label="Verein" value={need.clubs.name} />
        <SummaryItem label="Bedarf" value={needHeadline(need)} />
        <SummaryItem label="Saison" value={need.season} />
        <SummaryItem label="Status" value={STATUS_LABELS[need.status]} />
        <SummaryItem label="Priorität" value={PRIORITY_LABELS[need.priority]} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel p-5">
          <div className="flex flex-wrap gap-2">
            <NeedBadges need={need} />
          </div>
          <dl className="mt-5 space-y-4">
            <InfoRow label="Verein" value={<Link href={`/admin/clubs/${need.clubs.id}`}>{need.clubs.name}</Link>} />
            <InfoRow label="Liga" value={need.clubs.league} />
            <InfoRow label="Art" value={labels.needType} />
            {isCoach ? (
              <InfoRow label="Trainerrolle" value={labels.coachRole || "-"} />
            ) : (
              <>
                <InfoRow label="Angriffspositionen" value={<TagList items={labels.attackPositions} />} />
                <InfoRow label="Abwehrpositionen" value={<TagList items={labels.defensePositions} />} />
              </>
            )}
            <InfoRow label="Saison" value={need.season} />
            <InfoRow label="Benötigt ab" value={formatDate(need.needed_from_date)} />
            <InfoRow label="Budget" value={formatCurrency(need.budget_amount, need.budget_currency)} />
            <InfoRow label="Abgeschlossen am" value={need.closed_at ? formatDate(need.closed_at) : "-"} />
          </dl>
        </div>

        <div className="panel p-5">
          <h2 className="section-heading">Profil</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoRow label="Beschreibung" value={need.description || "-"} wide />
            {isCoach ? null : (
              <>
                <InfoRow label="Spielertyp" value={<TagList items={labels.playerTypes} />} wide />
                <InfoRow label="Anvisierte Rolle" value={<TagList items={labels.targetRoles} />} wide />
                <InfoRow label="Weitere Merkmale" value={need.player_type || "-"} wide />
                <InfoRow label="Alter" value={formatRange(need.age_min, need.age_max)} />
                <InfoRow label="Größe min." value={need.height_min ? `${need.height_min} cm` : "-"} />
              </>
            )}
            <InfoRow label="Sprachkenntnisse" value={<TagList items={labels.languages} />} wide />
            <InfoRow label="Nationalität" value={need.nationality_preference || "-"} />
            <InfoRow label="Liga-Erfahrung" value={need.league_experience || "-"} />
            <InfoRow label="Vertragsstatus" value={need.contract_status_preference || "-"} />
            <InfoRow label="Statusnotiz" value={need.status_note || "-"} wide />
            <InfoRow label="Budgetnotiz" value={need.budget_note || "-"} wide />
          </dl>
        </div>
      </section>

      <section className="panel flex items-start gap-3 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-950 text-white">
          <Lock className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="section-heading">Vertraulich · nur KW Sports &amp; Verein</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-navy-950">{confidentialNote || "-"}</p>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-3 text-xs font-black uppercase text-slate-500">
          <span className="rounded-md bg-white px-3 py-2 text-navy-950 shadow-sm">Notizen</span>
          <span className="px-3 py-2">Verlauf</span>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section>
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <h2 className="text-lg font-bold text-navy-950">Interne Admin-Notizen</h2>
            </div>

            {query.error === "note" ? (
              <div className="alert-error mt-4">Notiz konnte nicht gespeichert werden.</div>
            ) : null}

            <form action={createAdminNoteAction} className="mt-4 space-y-3">
              <input type="hidden" name="player_need_id" value={need.id} />
              <Textarea name="body" placeholder="Interne Notiz für KW Sports" required />
              <Button type="submit">
                <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                Notiz speichern
              </Button>
            </form>

            <div className="mt-5 space-y-3">
              {typedNotes.length === 0 ? (
                <p className="text-sm text-slate-500">Noch keine internen Notizen.</p>
              ) : (
                typedNotes.map((note) => (
                  <article key={note.id} className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="whitespace-pre-wrap text-sm text-navy-950">{note.body}</p>
                    <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                      {note.users?.name || "KW Sports"} · {formatDate(note.created_at)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <h2 className="text-lg font-bold text-navy-950">Änderungsverlauf</h2>
            </div>
            <div className="mt-5 space-y-3">
              {typedAuditLogs.length === 0 ? (
                <p className="text-sm text-slate-500">Noch keine Änderungen protokolliert.</p>
              ) : (
                typedAuditLogs.map((entry) => (
                  <article key={entry.id} className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="text-sm font-semibold text-navy-950">{describeAuditEntry(entry)}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.users?.name || "System"} · {formatDate(entry.created_at)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="metric-card px-4 py-3">
      <p className="metric-kicker">{label}</p>
      <p className="mt-1 truncate text-base font-black text-navy-950">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, wide = false }: { label: string; value: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-navy-950 [&_a]:text-navy-700 [&_a]:underline">{value}</dd>
    </div>
  );
}

function formatRange(min: number | null, max: number | null) {
  if (min && max) return `${min}-${max}`;
  if (min) return `ab ${min}`;
  if (max) return `bis ${max}`;
  return "-";
}

function describeAuditEntry(entry: AuditLog) {
  if (entry.action === "player_need.created") return "Bedarf wurde angelegt";
  if (entry.action === "player_need.deleted") return "Bedarf wurde gelöscht";

  const oldData = entry.old_data || {};
  const newData = entry.new_data || {};
  const changedLabels = [
    ["need_type", "Art"],
    ["attack_positions", "Angriffspositionen"],
    ["defense_positions", "Abwehrpositionen"],
    ["coach_role", "Trainerrolle"],
    ["season", "Saison"],
    ["needed_from_date", "Benötigt ab"],
    ["priority", "Priorität"],
    ["status", "Status"],
    ["status_note", "Statusnotiz"],
    ["budget_amount", "Budget"],
    ["club_id", "Verein"]
  ]
    // Array columns arrive as fresh objects, so compare serialized values.
    .filter(([key]) => JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]))
    .map(([, label]) => label);

  if (changedLabels.length === 0) return "Bedarf wurde aktualisiert";
  return `Geändert: ${changedLabels.slice(0, 4).join(", ")}${changedLabels.length > 4 ? " ..." : ""}`;
}
