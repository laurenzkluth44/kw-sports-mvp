import { Flash, flashKind } from "@/components/ui/flash";
import { AdminNeedMatches } from "@/features/matching/admin-need-matches";
import { AdminNeedOutcome } from "@/features/matching/admin-need-outcome";
import { guideCopy } from "@/lib/guide-i18n";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { notFound } from "next/navigation";
import { Building2, Edit, History, Lock, MessageSquarePlus } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { createAdminNoteAction } from "@/features/admin/productivity-actions";
import { needHeadline, needProfileLabels } from "@/features/player-needs/need-summary";
import { NeedFacts, NeedHero, chips } from "@/features/player-needs/need-hero";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminNote, AuditLog, KwPlayer, NeedOutcome, PlayerNeedWithClub } from "@/types/domain";

export default async function AdminNeedDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; done?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data }, { data: noteRows }, { data: auditLogRows }, { data: outcomeRow }, { data: playerRows }, { data: matchRows }] = await Promise.all([
    supabase
      .from("player_needs")
      .select("*, clubs!inner(id,name,country,league,city,website,logo_path,created_at,updated_at), player_need_confidential(note)")
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
      .limit(12),
    supabase.from("need_outcomes").select("*").eq("need_id", id).maybeSingle(),
    supabase.from("kw_players").select("*, kw_player_games(*)").order("last_name"),
    supabase.from("need_matches").select("player_id").eq("need_id", id)
  ]);

  if (!data) notFound();

  const need = data as PlayerNeedWithClub;
  const confidentialNote = data.player_need_confidential?.note ?? null;
  const labels = needProfileLabels(need);
  const isCoach = need.need_type === "trainer";
  const typedNotes = (noteRows || []) as AdminNote[];
  const typedAuditLogs = (auditLogRows || []) as AuditLog[];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Bedarfe", href: "/admin" }, { label: need.clubs.name, href: `/admin/clubs/${need.clubs.id}` }, { label: needHeadline(need) }]} />
      <Flash message={flashKind(query.done) === "created" ? guideCopy.de.flash.needCreated : flashKind(query.done) === "updated" ? guideCopy.de.flash.needUpdated : null} />

      <NeedHero
        need={need}
        locale="de"
        actions={
          <>
            <LinkButton href={`/admin/needs/${need.id}/edit`} variant="accent">
              <Edit className="h-4 w-4" aria-hidden="true" />
              Bearbeiten
            </LinkButton>
            <LinkButton href={`/admin/clubs/${need.clubs.id}`} variant="secondary">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Verein
            </LinkButton>
          </>
        }
      />

      <AdminNeedOutcome
        need={need}
        outcome={(outcomeRow ?? null) as NeedOutcome | null}
        players={(playerRows ?? []) as KwPlayer[]}
        matchedPlayerIds={(matchRows ?? []).map((row) => row.player_id)}
        done={query.done}
        error={query.error}
      />

      <AdminNeedMatches supabase={supabase} need={need} done={query.done} error={query.error} />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <NeedFacts
          title="Anforderungsprofil"
          empty="Der Verein hat keine weiteren Anforderungen angegeben."
          rows={[
            { label: "Beschreibung", value: need.description, wide: true },
            ...(isCoach
              ? [{ label: "Trainerrolle", value: labels.coachRole }]
              : [
                  { label: "Angriffspositionen", value: chips(labels.attackPositions) },
                  { label: "Abwehrpositionen", value: chips(labels.defensePositions) },
                  { label: "Spielertyp", value: chips(labels.playerTypes) },
                  { label: "Anvisierte Rolle", value: chips(labels.targetRoles) },
                  { label: "Alter", value: formatRange(need.age_min, need.age_max) },
                  { label: "Größe min.", value: need.height_min ? `${need.height_min} cm` : null },
                  { label: "Weitere Merkmale", value: need.player_type, wide: true }
                ]),
            { label: "Sprachkenntnisse", value: chips(labels.languages) },
            { label: "Nationalität", value: need.nationality_preference },
            { label: "Liga-Erfahrung", value: need.league_experience },
            { label: "Vertragsstatus", value: need.contract_status_preference }
          ]}
        />

        <div className="flex flex-col gap-5">
          <NeedFacts
            title="Budget & Status"
            empty="Keine Angaben zu Budget oder Status."
            rows={[
              { label: "Budget", value: need.budget_amount ? formatCurrency(need.budget_amount, need.budget_currency) : null },
              { label: "Budgetnotiz", value: need.budget_note, wide: true },
              { label: "Statusnotiz", value: need.status_note, wide: true },
              { label: "Abgeschlossen am", value: need.closed_at ? formatDate(need.closed_at) : null }
            ]}
          />
          <div className="panel flex items-start gap-3 border-l-[3px] border-l-navy-950 p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-navy-950 text-white">
              <Lock className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="section-heading">Vertraulich · nur KW Sports &amp; Verein</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-navy-950">{confidentialNote || "Keine vertrauliche Notiz."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
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

function formatRange(min: number | null, max: number | null) {
  if (min && max) return `${min}–${max} Jahre`;
  if (min) return `ab ${min} Jahre`;
  if (max) return `bis ${max} Jahre`;
  return null;
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
