import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { ClubCascadeSelect } from "@/features/admin/club-cascade-select";
import { InviteUserForm } from "@/features/admin/invite-user-form";
import { createUserAction } from "@/features/admin/user-actions";
import { ROLE_LABELS } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import type { Club, Profile } from "@/types/domain";

const errorMessages: Record<string, string> = {
  validation: "Bitte alle Pflichtfelder ausfüllen.",
  club: "Club User benötigen einen Verein.",
  service: "Nutzer konnte nicht angelegt werden. Service Role Key und Supabase Auth prüfen.",
  invite: "Einladung konnte nicht gesendet werden. Supabase Auth, SMTP und Site URL prüfen.",
  invite_config: "Einladung konnte nicht gesendet werden. Service Role Key oder Supabase URL fehlt.",
  invite_exists: "Für diese E-Mail existiert bereits ein Nutzer. Bitte Zugang prüfen oder den alten Zugang revoken.",
  invite_smtp: "Supabase konnte die E-Mail nicht senden. Bitte SMTP, Sender-Adresse und Rate Limits prüfen.",
  invite_url: "Supabase hat die Redirect URL abgelehnt. Bitte Site URL und Redirect URLs prüfen."
};

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; detail?: string; created?: string; invited?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  const [{ data: users = [] }, { data: clubs = [] }] = await Promise.all([
    supabase.from("users").select("*, clubs(*)").order("created_at", { ascending: false }),
    supabase.from("clubs").select("*").order("name", { ascending: true })
  ]);

  const profiles = users as Profile[];
  const clubRows = clubs as Club[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="KW Sports Admin"
        title="Vereinsnutzer verwalten"
        description="Accounts für Club User und Admins anlegen."
      />

      {params.error ? (
        <div className="alert-error">
          <p>{errorMessages[params.error] || errorMessages.validation}</p>
          {params.detail ? <p className="mt-1 text-xs text-red-600">Supabase: {params.detail}</p> : null}
        </div>
      ) : null}

      {params.created ? (
        <div className="alert-success">Nutzer wurde angelegt.</div>
      ) : null}
      {params.invited ? (
        <div className="alert-success">Einladung wurde an Supabase übergeben.</div>
      ) : null}

      <section className="space-y-5">
        <InviteUserForm
          clubs={clubRows.map((club) => ({
            id: club.id,
            name: club.name,
            country: club.country,
            league: club.league
          }))}
        />

        <details className="panel overflow-hidden">
          <summary className="cursor-pointer bg-slate-50/80 px-5 py-4 text-sm font-black uppercase text-navy-950 transition hover:bg-brand-50">
            Account direkt anlegen
          </summary>
          <form action={createUserAction} className="grid gap-5 border-t border-slate-200 p-5 md:grid-cols-2">
            <p className="text-sm text-slate-500 md:col-span-2">
              Für Tests oder wenn KW Sports ein Startpasswort vergibt.
            </p>
            <Field label="Name" htmlFor="name">
              <Input id="name" name="name" required />
            </Field>
            <Field label="E-Mail" htmlFor="email">
              <Input id="email" name="email" type="email" required />
            </Field>
            <Field label="Passwort" htmlFor="password">
              <Input id="password" name="password" type="password" minLength={8} required />
            </Field>
            <Field label="Rolle" htmlFor="role">
              <Select id="role" name="role" defaultValue="club" required>
                <option value="club">{ROLE_LABELS.club}</option>
                <option value="admin">{ROLE_LABELS.admin}</option>
              </Select>
            </Field>
            <ClubCascadeSelect
              clubs={clubRows.map((club) => ({
                id: club.id,
                name: club.name,
                country: club.country,
                league: club.league
              }))}
              fieldName="club_id"
              idPrefix="direct_club"
              emptyClubLabel="Kein Verein / Admin"
              clubClassName="md:col-span-2"
            />
            <div className="md:col-span-2">
              <Button type="submit">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Nutzer anlegen
              </Button>
            </div>
          </form>
        </details>
      </section>

      <section className="panel overflow-hidden">
        <div className="table-header hidden grid-cols-[1fr_1fr_0.7fr_1fr] gap-4 md:grid">
          <span>Name</span>
          <span>E-Mail</span>
          <span>Rolle</span>
          <span>Verein</span>
        </div>
        <div className="divide-y divide-slate-200">
          {profiles.map((user) => (
            <article key={user.id} className="data-row grid gap-3 md:grid-cols-[1fr_1fr_0.7fr_1fr] md:items-center">
              <p className="font-semibold text-navy-950">{user.name}</p>
              <p className="break-words text-sm text-slate-600">{user.email}</p>
              <p className="text-sm font-medium text-slate-700">{ROLE_LABELS[user.role]}</p>
              <p className="text-sm text-slate-600">{user.clubs?.name || "-"}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
