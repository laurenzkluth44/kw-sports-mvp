import { MailPlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { createUserAction, inviteUserAction } from "@/features/admin/user-actions";
import { ROLE_LABELS } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import type { Club, Profile } from "@/types/domain";

const errorMessages: Record<string, string> = {
  validation: "Bitte alle Pflichtfelder ausfüllen.",
  club: "Club User benötigen einen Verein.",
  service: "Nutzer konnte nicht angelegt werden. Service Role Key und Supabase Auth prüfen.",
  invite: "Einladung konnte nicht gesendet werden. Supabase Auth, SMTP und Site URL prüfen."
};

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; created?: string; invited?: string }>;
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
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessages[params.error] || errorMessages.validation}
        </div>
      ) : null}

      {params.created ? (
        <div className="rounded-md border border-brand-100 bg-brand-100 px-3 py-2 text-sm text-brand-700">
          Nutzer wurde angelegt.
        </div>
      ) : null}
      {params.invited ? (
        <div className="rounded-md border border-brand-100 bg-brand-100 px-3 py-2 text-sm text-brand-700">
          Einladung wurde an Supabase übergeben.
        </div>
      ) : null}

      <section className="space-y-5">
        <form action={inviteUserAction} className="panel grid gap-5 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-navy-950">Einladung senden</h2>
            <p className="mt-1 text-sm text-slate-500">Für den produktiven Betrieb mit Supabase SMTP.</p>
          </div>
          <Field label="Name" htmlFor="invite_name">
            <Input id="invite_name" name="invite_name" required />
          </Field>
          <Field label="E-Mail" htmlFor="invite_email">
            <Input id="invite_email" name="invite_email" type="email" required />
          </Field>
          <Field label="Rolle" htmlFor="invite_role">
            <Select id="invite_role" name="invite_role" defaultValue="club" required>
              <option value="club">{ROLE_LABELS.club}</option>
              <option value="admin">{ROLE_LABELS.admin}</option>
            </Select>
          </Field>
          <Field label="Verein" htmlFor="invite_club_id">
            <Select id="invite_club_id" name="invite_club_id" defaultValue="">
              <option value="">Kein Verein</option>
              {clubRows.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} · {club.league}
                </option>
              ))}
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Button type="submit">
              <MailPlus className="h-4 w-4" aria-hidden="true" />
              Einladung senden
            </Button>
          </div>
        </form>

        <details className="panel overflow-hidden">
          <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-navy-950">
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
            <Field label="Verein" htmlFor="club_id" className="md:col-span-2">
              <Select id="club_id" name="club_id" defaultValue="">
                <option value="">Kein Verein</option>
                {clubRows.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name} · {club.league}
                  </option>
                ))}
              </Select>
            </Field>
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
        <div className="hidden grid-cols-[1fr_1fr_0.7fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
          <span>Name</span>
          <span>E-Mail</span>
          <span>Rolle</span>
          <span>Verein</span>
        </div>
        <div className="divide-y divide-slate-200">
          {profiles.map((user) => (
            <article key={user.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_0.7fr_1fr] md:items-center">
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
