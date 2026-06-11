import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Eye, PlusCircle, Trash2, UserX } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { deleteClubAction, revokeClubUserAction } from "@/features/admin/club-actions";
import { NeedBadges } from "@/features/player-needs/need-badges";
import { ROLE_LABELS } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { Club, PlayerNeed, Profile } from "@/types/domain";

export default async function AdminClubDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; revoked?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: club }, { data: needs = [] }, { data: users = [] }] = await Promise.all([
    supabase.from("clubs").select("*").eq("id", id).single(),
    supabase.from("player_needs").select("*").eq("club_id", id).order("created_at", { ascending: false }),
    supabase.from("users").select("*").eq("club_id", id).order("name", { ascending: true })
  ]);

  if (!club) redirect("/admin");

  const typedClub = club as Club;
  const typedNeeds = needs as PlayerNeed[];
  const typedUsers = users as Profile[];
  const activeNeeds = typedNeeds.filter((need) => need.status !== "archiviert" && need.status !== "besetzt").length;
  const filledNeeds = typedNeeds.filter((need) => need.status === "besetzt").length;
  const lastUpdated = getLatestDate([typedClub.updated_at, ...typedNeeds.map((need) => need.updated_at)]);
  const profileScore = getProfileScore(typedClub, typedUsers);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={typedClub.league}
        title={typedClub.name}
        description={`${typedClub.city}, ${typedClub.country}`}
        actions={
          <LinkButton href={`/admin/needs/new?club_id=${typedClub.id}`} variant="primary">
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Bedarf anlegen
          </LinkButton>
        }
      />

      {query.error ? (
        <div className="alert-error">{clubErrorMessage(query.error)}</div>
      ) : null}
      {query.revoked ? (
        <div className="alert-success">Zugang wurde widerrufen.</div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Aktive Bedarfe" value={activeNeeds} />
        <Metric label="Besetzt" value={filledNeeds} />
        <Metric label="Nutzer" value={typedUsers.length} />
        <Metric label="Profil" value={`${profileScore}%`} />
        <Metric label="Letztes Update" value={formatDate(lastUpdated)} compact />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <div className="panel p-5">
            <h2 className="section-heading">Verein</h2>
            <dl className="mt-5 space-y-4">
              <InfoRow label="Liga" value={typedClub.league} />
              <InfoRow label="Stadt" value={typedClub.city} />
              <InfoRow label="Land" value={typedClub.country} />
              <InfoRow
                label="Website"
                value={
                  typedClub.website ? (
                    <a href={typedClub.website} target="_blank" rel="noreferrer">
                      {typedClub.website}
                    </a>
                  ) : (
                    "-"
                  )
                }
              />
            </dl>
          </div>

          <div className="panel p-5">
            <h2 className="section-heading">Vereinsnutzer</h2>
            <div className="mt-4 space-y-3">
              {typedUsers.length === 0 ? (
                <p className="text-sm text-slate-500">Noch keine Nutzer für diesen Verein.</p>
              ) : (
                typedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-950">{user.name}</p>
                      <p className="break-words text-sm text-slate-500">{user.email}</p>
                      <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{ROLE_LABELS[user.role]}</p>
                    </div>
                    <form action={revokeClubUserAction}>
                      <input type="hidden" name="user_id" value={user.id} />
                      <input type="hidden" name="club_id" value={typedClub.id} />
                      <Button type="submit" variant="secondary" className="w-full border-red-200 text-red-700 hover:bg-red-50 sm:w-auto">
                        <UserX className="h-4 w-4" aria-hidden="true" />
                        Zugang revoken
                      </Button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>

          <details className="panel overflow-hidden border-red-200">
            <summary className="cursor-pointer bg-red-50 px-5 py-4 text-sm font-black uppercase text-red-700 transition hover:bg-red-100">
              Verein löschen
            </summary>
            <form action={deleteClubAction} className="space-y-4 border-t border-red-100 p-5">
              <input type="hidden" name="club_id" value={typedClub.id} />
              <input type="hidden" name="club_name" value={typedClub.name} />
              <p className="text-sm leading-6 text-slate-600">
                Löscht den Verein, alle Bedarfe und widerruft alle Zugänge dieses Vereins. Zur Bestätigung den Vereinsnamen exakt eingeben.
              </p>
              <Field label="Vereinsname bestätigen" htmlFor="confirmation">
                <Input id="confirmation" name="confirmation" placeholder={typedClub.name} required />
              </Field>
              <Button type="submit" className="bg-red-700 hover:bg-red-800">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Verein endgültig löschen
              </Button>
            </form>
          </details>
        </div>

        <section className="panel overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <h2 className="section-heading">Bedarfe</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {typedNeeds.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">Keine Bedarfe gespeichert.</p>
            ) : (
              typedNeeds.map((need) => (
                <article key={need.id} className="data-row grid gap-4 md:grid-cols-[1fr_1fr_1.2fr_0.5fr] md:items-center">
                  <div>
                    <p className="font-bold text-navy-950">{need.position}</p>
                    <p className="mt-1 text-sm text-slate-500">{need.season}</p>
                  </div>
                  <p className="text-sm text-slate-700">{formatDate(need.needed_from_date)}</p>
                  <NeedBadges need={need} />
                  <Link
                    href={`/admin/needs/${need.id}`}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Öffnen
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function clubErrorMessage(error: string) {
  if (error === "confirm") return "Bitte den Vereinsnamen exakt eingeben.";
  if (error === "revoke") return "Zugang konnte nicht widerrufen werden.";
  if (error === "delete") return "Verein konnte nicht gelöscht werden.";
  return "Aktion konnte nicht ausgeführt werden.";
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-navy-950 [&_a]:text-navy-700 [&_a]:underline">{value}</dd>
    </div>
  );
}

function Metric({ label, value, compact = false }: { label: string; value: ReactNode; compact?: boolean }) {
  return (
    <div className="metric-card">
      <p className="metric-kicker">{label}</p>
      <p className={compact ? "mt-2 text-xl font-black text-navy-950" : "mt-2 text-3xl font-black text-navy-950"}>
        {value}
      </p>
    </div>
  );
}

function getLatestDate(values: string[]) {
  return values
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]
    ?.toISOString();
}

function getProfileScore(club: Club, users: Profile[]) {
  const checks = [club.name, club.city, club.country, club.league, club.website, users.length > 0 ? "user" : ""];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}
