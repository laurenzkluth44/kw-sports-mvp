import { notFound } from "next/navigation";
import { PlusCircle, Trash2, UserPlus, UserX } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button, LinkButton } from "@/components/ui/button";
import { Flash } from "@/components/ui/flash";
import { Field, Input } from "@/components/ui/form";
import { deleteClubAction, revokeClubUserAction } from "@/features/admin/club-actions";
import { buildKwInfo } from "@/features/matching/kw-queue";
import { ClubCrest, NeedCard, clubInitials, clubLogoUrl } from "@/features/needs-overview/need-card";
import { overviewCopy } from "@/lib/overview-i18n";
import { requireAdmin } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import type { Club, KwPlayer, NeedMatchStatus, PlayerNeedWithClub, Profile } from "@/types/domain";

const CLUB_COLUMNS = "id,name,country,league,city,website,logo_path,created_at,updated_at";

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

  const [{ data: club }, { data: needs = [] }, { data: users = [] }, { data: playerRows }] = await Promise.all([
    supabase.from("clubs").select("*").eq("id", id).single(),
    supabase.from("player_needs").select(`*, clubs!inner(${CLUB_COLUMNS})`).eq("club_id", id).order("needed_from_date", { ascending: true }),
    supabase.from("users").select("*").eq("club_id", id).order("name", { ascending: true }),
    supabase.from("kw_players").select("*")
  ]);

  if (!club) notFound();

  const typedClub = club as Club;
  const typedNeeds = needs as PlayerNeedWithClub[];
  const typedUsers = users as Profile[];
  const needIds = typedNeeds.map((need) => need.id);
  const { data: matchRows } = needIds.length
    ? await supabase.from("need_matches").select("need_id, player_id, status").in("need_id", needIds)
    : { data: [] };
  const matches = (matchRows ?? []) as { need_id: string; player_id: string; status: NeedMatchStatus }[];
  const { info: kwInfo } = buildKwInfo(typedNeeds, (playerRows ?? []) as KwPlayer[], matches);

  const active = typedNeeds.filter((need) => need.status === "offen" || need.status === "in_gespraechen");
  const closed = typedNeeds.filter((need) => need.status === "besetzt" || need.status === "archiviert");
  const interested = matches.filter((match) => match.status === "interessiert").length;
  const lastUpdated = getLatestDate([typedClub.updated_at, ...typedNeeds.map((need) => need.updated_at)]);
  const logoUrl = clubLogoUrl(typedClub.logo_path);
  const [firstWord, ...restWords] = typedClub.name.split(" ");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Bedarfe", href: "/admin" }, { label: typedClub.name }]} />

      {query.error ? <div className="alert-error">{clubErrorMessage(query.error)}</div> : null}
      <Flash message={query.revoked ? "Zugang wurde widerrufen." : null} />

      <section className="relative overflow-hidden bg-navy-950 text-white">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-6 whitespace-nowrap font-display text-[9rem] leading-[0.8] text-white/[0.05] sm:text-[12rem]"
        >
          {clubInitials(typedClub.name)}
        </span>
        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <ClubCrest name={typedClub.name} logoUrl={logoUrl} size="lg" />
            <div className="min-w-0">
              <p className="eyebrow eyebrow-light">{typedClub.league}</p>
              <h1 className="mt-2 font-display text-[2.6rem] uppercase leading-[0.9] sm:text-[3.4rem]">
                {firstWord} {restWords.length ? <span className="text-brand-500">{restWords.join(" ")}</span> : null}
              </h1>
              <p className="mt-2 text-sm text-white/65">
                {[typedClub.city, typedClub.country].filter(Boolean).join(", ")}
                {typedClub.website ? (
                  <>
                    {" · "}
                    <a href={typedClub.website} target="_blank" rel="noreferrer" className="text-brand-300 underline-offset-2 hover:underline">
                      {typedClub.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </>
                ) : null}
                {lastUpdated ? ` · zuletzt aktiv ${formatDate(lastUpdated)}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href={`/admin/needs/new?club_id=${typedClub.id}`} variant="accent">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Bedarf anlegen
            </LinkButton>
            <LinkButton href="/admin/users" variant="ghost" className="border-white/20 text-white">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Nutzer einladen
            </LinkButton>
          </div>
        </div>
        <dl className="relative grid grid-cols-2 border-t border-white/10 sm:grid-cols-5">
          <HeroStat label="Aktive Bedarfe" value={active.length} />
          <HeroStat label="Besetzt" value={typedNeeds.filter((need) => need.status === "besetzt").length} />
          <HeroStat label="KW-Vorschläge" value={matches.length} />
          <HeroStat label="Interessiert" value={interested} highlight={interested > 0} />
          <HeroStat label="Nutzer" value={typedUsers.length} warn={typedUsers.length === 0} />
        </dl>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-2 border-b-2 border-navy-950 pb-2">
          <h2 className="font-display text-[2rem] uppercase leading-none text-navy-950">Bedarfe</h2>
          <p className="text-xs text-slate-500">{typedNeeds.length} insgesamt</p>
        </div>
        {active.length === 0 ? (
          <p className="border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-600">Keine aktiven Bedarfe.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {active.map((need) => (
              <NeedCard key={need.id} need={need} href={`/admin/needs/${need.id}`} locale="de" copy={overviewCopy.de} kw={kwInfo[need.id]} />
            ))}
          </div>
        )}
        {closed.length > 0 ? (
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600 hover:text-navy-950 [&::-webkit-details-marker]:hidden">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
                ›
              </span>
              Geschlossene Bedarfe · {closed.length}
            </summary>
            <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {closed.map((need) => (
                <NeedCard key={need.id} need={need} href={`/admin/needs/${need.id}`} locale="de" copy={overviewCopy.de} kw={kwInfo[need.id]} />
              ))}
            </div>
          </details>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <h2 className="section-heading">Vereinsnutzer</h2>
            <span className="text-xs font-bold text-slate-500">{typedUsers.length}</span>
          </div>
          {typedUsers.length === 0 ? (
            <div className="flex flex-col items-start gap-3 px-5 py-6 text-sm text-slate-600">
              <p>Noch niemand vom Verein hat Zugang. Lade eine Ansprechperson ein, damit der Verein Kader und Bedarfe selbst pflegt.</p>
              <LinkButton href="/admin/users" variant="secondary">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Nutzer einladen
              </LinkButton>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {typedUsers.map((user) => (
                <li key={user.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-navy-950 font-display text-lg text-white">
                      {clubInitials(user.name || user.email)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-navy-950">{user.name}</p>
                      <a href={`mailto:${user.email}`} className="block truncate text-sm text-slate-500 hover:text-brand-600">
                        {user.email}
                      </a>
                    </div>
                  </div>
                  <details className="group relative shrink-0">
                    <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 px-2 text-xs font-bold text-slate-500 hover:text-red-700 [&::-webkit-details-marker]:hidden">
                      <UserX className="h-4 w-4" aria-hidden="true" />
                      Zugang widerrufen
                    </summary>
                    <form action={revokeClubUserAction} className="mt-2 flex flex-col gap-2 border border-red-200 bg-red-50 p-3 sm:w-72">
                      <input type="hidden" name="user_id" value={user.id} />
                      <input type="hidden" name="club_id" value={typedClub.id} />
                      <p className="text-xs leading-5 text-red-900">
                        {user.name} kann sich danach nicht mehr anmelden. Kader und Bedarfe des Vereins bleiben erhalten.
                      </p>
                      <Button type="submit" variant="secondary" className="border-red-300 text-red-700 hover:border-red-400 hover:bg-red-100 hover:text-red-800">
                        Ja, Zugang widerrufen
                      </Button>
                    </form>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>

        <details className="panel h-fit overflow-hidden border-red-200">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-extrabold uppercase tracking-[0.06em] text-red-700 hover:bg-red-50 [&::-webkit-details-marker]:hidden">
            Verein löschen
          </summary>
          <form action={deleteClubAction} className="space-y-4 border-t border-red-100 p-5">
            <input type="hidden" name="club_id" value={typedClub.id} />
            <input type="hidden" name="club_name" value={typedClub.name} />
            <p className="text-sm leading-6 text-slate-600">
              Löscht den Verein mit Kader, allen Bedarfen und Spielervorschlägen und widerruft alle Zugänge. Zur Bestätigung den Vereinsnamen exakt eingeben.
            </p>
            <Field label="Vereinsname bestätigen" htmlFor="confirmation">
              <Input id="confirmation" name="confirmation" placeholder={typedClub.name} required />
            </Field>
            <Button type="submit" className="border-red-700 bg-red-700 hover:bg-red-800">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Verein endgültig löschen
            </Button>
          </form>
        </details>
      </section>
    </div>
  );
}

function HeroStat({ label, value, highlight, warn }: { label: string; value: number; highlight?: boolean; warn?: boolean }) {
  return (
    <div className="border-l border-t border-white/10 px-5 py-4 first:border-l-0 sm:border-t-0">
      <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/55">{label}</dt>
      <dd className={cn("mt-1 font-display text-3xl leading-none", highlight ? "text-brand-300" : warn ? "text-amber-300" : "text-white")}>{value}</dd>
    </div>
  );
}

function clubErrorMessage(error: string) {
  if (error === "confirm") return "Bitte den Vereinsnamen exakt eingeben.";
  if (error === "revoke") return "Zugang konnte nicht widerrufen werden.";
  if (error === "delete") return "Verein konnte nicht gelöscht werden.";
  return "Aktion konnte nicht ausgeführt werden.";
}

function getLatestDate(values: string[]) {
  return values
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]
    ?.toISOString();
}
