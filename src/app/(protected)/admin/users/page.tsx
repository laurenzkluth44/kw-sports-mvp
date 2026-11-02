import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Flash } from "@/components/ui/flash";
import { PageHeader } from "@/components/ui/page-header";
import { ClubCascadeSelect } from "@/features/admin/club-cascade-select";
import { InviteUserForm } from "@/features/admin/invite-user-form";
import { createUserAction } from "@/features/admin/user-actions";
import { ROLE_LABELS } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Club, Profile } from "@/types/domain";

const errorMessages: Record<string, string> = {
  validation: "Bitte alle Pflichtfelder ausfüllen.",
  club: "Club User benötigen einen Verein.",
  agency: "Agency User benötigen einen Agency-Namen.",
  service: "Nutzer konnte nicht angelegt werden. Service Role Key und Supabase Auth prüfen.",
  invite: "Einladung konnte nicht gesendet werden. Supabase Auth, SMTP und Site URL prüfen.",
  invite_config: "Einladung konnte nicht gesendet werden. Service Role Key oder Supabase URL fehlt.",
  invite_exists: "Für diese E-Mail existiert bereits ein Nutzer. Bitte den bestehenden Zugang prüfen oder ihn auf der Vereinsseite widerrufen.",
  invite_smtp: "Supabase konnte die E-Mail nicht senden. Bitte SMTP, Sender-Adresse und Rate Limits prüfen.",
  invite_url: "Supabase hat die Redirect URL abgelehnt. Bitte Site URL und Redirect URLs prüfen."
};

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; detail?: string; created?: string; invited?: string; role?: string; q?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  const [{ data: users = [] }, { data: clubs = [] }] = await Promise.all([
    supabase.from("users").select("*, clubs(*)").order("created_at", { ascending: false }),
    supabase.from("clubs").select("*").order("name", { ascending: true })
  ]);

  const profiles = users as Profile[];
  const clubRows = clubs as Club[];
  const role = params.role === "club" || params.role === "agency" || params.role === "admin" ? params.role : null;
  const search = (params.q ?? "").trim().toLowerCase();
  const counts = {
    club: profiles.filter((user) => user.role === "club").length,
    agency: profiles.filter((user) => user.role === "agency").length,
    admin: profiles.filter((user) => user.role === "admin").length
  };
  const clubsWithAccess = new Set(profiles.filter((user) => user.club_id).map((user) => user.club_id)).size;
  const shown = profiles.filter(
    (user) =>
      (!role || user.role === role) &&
      (!search ||
        [user.name, user.email, user.agency_name, user.clubs?.name].some((value) => value?.toLowerCase().includes(search)))
  );
  const tabHref = (next: string | null) => {
    const query = new URLSearchParams();
    if (next) query.set("role", next);
    if (search) query.set("q", params.q!.trim());
    const text = query.toString();
    return text ? `/admin/users?${text}#nutzer` : "/admin/users#nutzer";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="KW Sports Admin"
        title="Nutzer verwalten"
        description="Vereine, Agenturen und KW-Team einladen und Zugänge im Blick behalten."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Vereine mit Zugang" value={clubsWithAccess} sub={`von ${clubRows.length} Vereinen`} />
        <Kpi label="Vereinsnutzer" value={counts.club} />
        <Kpi label="Agenturen" value={counts.agency} />
        <Kpi label="KW-Admins" value={counts.admin} />
      </section>

      {params.error ? (
        <div className="alert-error">
          <p>{errorMessages[params.error] || errorMessages.validation}</p>
          {params.detail ? <p className="mt-1 text-xs text-red-600">Supabase: {params.detail}</p> : null}
        </div>
      ) : null}

      <Flash message={params.created ? "Nutzer wurde angelegt." : params.invited ? "Einladung verschickt." : null} />

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
                <option value="agency">{ROLE_LABELS.agency}</option>
                <option value="admin">{ROLE_LABELS.admin}</option>
              </Select>
            </Field>
            <Field label="Agency Name" htmlFor="agency_name">
              <Input id="agency_name" name="agency_name" placeholder="Nur für Agency User" />
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
              emptyClubLabel="Kein Verein / Admin / Agency"
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

      <section id="nutzer" className="panel scroll-mt-32 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-4 lg:flex-row lg:items-end lg:justify-between">
          <nav aria-label="Rolle" className="-mb-px flex gap-1 overflow-x-auto">
            {([
              [null, "Alle", profiles.length],
              ["club", "Vereine", counts.club],
              ["agency", "Agenturen", counts.agency],
              ["admin", "KW-Admins", counts.admin]
            ] as const).map(([value, label, count]) => (
              <Link
                key={label}
                href={tabHref(value)}
                aria-current={role === value ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-xs font-extrabold uppercase tracking-[0.1em]",
                  role === value ? "border-brand-500 text-navy-950" : "border-transparent text-slate-500 hover:text-navy-950"
                )}
              >
                {label}
                <span className={cn("px-1.5 py-0.5 text-[0.7rem]", role === value ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600")}>
                  {count}
                </span>
              </Link>
            ))}
          </nav>
          <form action="/admin/users#nutzer" className="flex gap-2 pb-3">
            {role ? <input type="hidden" name="role" value={role} /> : null}
            <label htmlFor="user-search" className="sr-only">
              Nutzer suchen
            </label>
            <Input id="user-search" name="q" type="search" defaultValue={params.q ?? ""} placeholder="Name, E-Mail oder Verein" className="lg:w-72" />
            <Button type="submit" variant="secondary" className="shrink-0 px-3">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Suchen</span>
            </Button>
          </form>
        </div>
        {shown.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">Keine Nutzer für diese Auswahl.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {shown.map((user) => (
              <li key={user.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.2fr)_auto_minmax(0,1fr)] md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 font-display text-lg text-navy-950">
                    {initials(user.name || user.email)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-navy-950">{user.name}</p>
                    <a href={`mailto:${user.email}`} className="block truncate text-sm text-slate-500 hover:text-brand-600">
                      {user.email}
                    </a>
                  </div>
                </div>
                <span className={cn("w-fit px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.12em]", ROLE_TAG[user.role])}>
                  {ROLE_NAMES[user.role]}
                </span>
                <AccessCell user={user} supabaseUrl={supabaseUrl} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AccessCell({ user, supabaseUrl }: { user: Profile; supabaseUrl: string }) {
  if (user.role === "agency") {
    return (
      <p className="min-w-0 truncate text-sm font-semibold text-navy-950">
        {user.agency_name || "Agency"}
      </p>
    );
  }

  if (user.role === "admin") {
    return <p className="text-sm text-slate-500">KW Sports</p>;
  }

  return <ClubCell club={user.clubs ?? null} supabaseUrl={supabaseUrl} />;
}

function ClubCell({ club, supabaseUrl }: { club: Club | null; supabaseUrl: string }) {
  if (!club) {
    return <p className="text-sm text-slate-500">–</p>;
  }

  const logoUrl = club.logo_path && supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/club-logos/${club.logo_path}`
    : null;
  const initial = club.name.trim().slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2.5">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className="h-9 w-9 shrink-0 rounded-sm border border-slate-200 bg-white object-contain p-0.5"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-navy-950 font-display text-base leading-none text-white">
          {initial}
        </span>
      )}
      <Link href={`/admin/clubs/${club.id}`} className="min-w-0 truncate text-sm font-semibold text-navy-950 hover:text-brand-600">
        {club.name}
      </Link>
    </div>
  );
}

const ROLE_NAMES = { club: "Verein", agency: "Agentur", admin: "KW-Admin" } as const;
const ROLE_TAG = {
  club: "bg-brand-500 text-white",
  agency: "border border-slate-300 text-slate-700",
  admin: "bg-navy-950 text-white"
} as const;

function initials(value: string) {
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function Kpi({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="border-l-[3px] border-brand-500 bg-white px-4 py-3 shadow-card">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 font-display text-3xl leading-none text-navy-950">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}
