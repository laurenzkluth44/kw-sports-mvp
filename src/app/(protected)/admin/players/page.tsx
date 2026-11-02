import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, Clock3, FileText, ImageOff, Plus, Upload, UserPlus } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Flash } from "@/components/ui/flash";
import { PageHeader } from "@/components/ui/page-header";
import { signedFileUrls } from "@/features/kw-players/files";
import { playerFreshness, type Freshness } from "@/features/kw-players/freshness";
import { KwPlayerCard } from "@/features/kw-players/kw-player-card";
import { requireAdmin } from "@/lib/auth";
import { ATTACK_POSITIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AttackPosition, KwPlayer } from "@/types/domain";

const FLASH: Record<string, string> = {
  created: "Spieler angelegt.",
  updated: "Änderungen gespeichert.",
  deleted: "Spieler gelöscht."
};

export default async function AdminPlayersPage({
  searchParams
}: {
  searchParams: Promise<{ done?: string; position?: string; kind?: string; check?: string; incomplete?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const position = ATTACK_POSITIONS.find((value) => value === params.position);
  const kind = params.kind === "trainer" ? "trainer" : params.kind === "spieler" ? "spieler" : undefined;

  const { data } = await supabase.from("kw_players").select("*").order("last_name", { ascending: true });
  const all = (data ?? []) as KwPlayer[];
  const now = new Date();
  const freshness = new Map(all.map((player) => [player.id, playerFreshness(player, now)]));
  const toCheck = all.filter((player) => freshness.get(player.id)!.stale).length;
  const checkOnly = params.check === "1";
  // Clubs open profiles with photo and CV far more often; these are the ones to complete first.
  const isIncomplete = (player: KwPlayer) => !player.photo_path || !player.cv_path;
  const incompleteCount = all.filter(isIncomplete).length;
  const incompleteOnly = params.incomplete === "1";
  const players = all.filter(
    (player) =>
      (!position || player.attack_positions.includes(position)) &&
      (!kind || player.kind === kind) &&
      (!checkOnly || freshness.get(player.id)!.stale) &&
      (!incompleteOnly || isIncomplete(player))
  );
  const photos = await signedFileUrls(supabase, players.map((player) => player.photo_path));
  const released = all.filter((player) => player.visible_to_clubs).length;

  const filterHref = (next: { position?: AttackPosition; kind?: string; check?: boolean; incomplete?: boolean }) => {
    const query = new URLSearchParams();
    if (next.position) query.set("position", next.position);
    if (next.kind) query.set("kind", next.kind);
    if (next.check) query.set("check", "1");
    if (next.incomplete) query.set("incomplete", "1");
    const text = query.toString();
    return text ? `/admin/players?${text}` : "/admin/players";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="KW Sports Admin"
        title="Spielerdatenbank"
        description={`${all.length} Spieler und Trainer · ${released} für Vereine freigegeben. Vereine sehen nur Spieler, die du für ihren Bedarf vorschlägst.`}
        actions={
          <>
            <LinkButton href="/admin/players/upload" variant="secondary">
              <Upload className="h-4 w-4" aria-hidden="true" />
              CVs & Fotos hochladen
            </LinkButton>
            <LinkButton href="/admin/players/new" variant="accent">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Spieler anlegen
            </LinkButton>
          </>
        }
      />

      <Flash message={params.done ? FLASH[params.done] : null} />

      <nav aria-label="Filter" className="flex flex-wrap gap-2">
        <FilterChip href={filterHref({})} active={!position && !kind && !checkOnly && !incompleteOnly}>
          Alle
        </FilterChip>
        {ATTACK_POSITIONS.map((code) => (
          <FilterChip key={code} href={filterHref({ position: code })} active={position === code}>
            {code}
          </FilterChip>
        ))}
        <FilterChip href={filterHref({ kind: "trainer" })} active={kind === "trainer"}>
          Trainer
        </FilterChip>
        {toCheck > 0 || checkOnly ? (
          <FilterChip href={filterHref({ check: true })} active={checkOnly} tone="warn">
            Zu prüfen · {toCheck}
          </FilterChip>
        ) : null}
        {incompleteCount > 0 || incompleteOnly ? (
          <FilterChip href={filterHref({ incomplete: true })} active={incompleteOnly} tone="warn">
            Foto oder CV fehlt · {incompleteCount}
          </FilterChip>
        ) : null}
      </nav>

      {players.length === 0 ? (
        <EmptyState
          title={all.length === 0 ? "Noch keine Spieler" : "Keine Treffer"}
          body={
            all.length === 0
              ? "Lege deine Spieler mit Positionen, Vertragsende und CV an. Danach schlägt das System sie automatisch für passende Vereinsbedarfe vor."
              : "Für diesen Filter gibt es keine Spieler."
          }
          action={
            <LinkButton href="/admin/players/new" variant="accent">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Spieler anlegen
            </LinkButton>
          }
        />
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/admin/players/${player.id}/edit`}
              className="block transition duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-cardHover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <KwPlayerCard
                player={player}
                photoUrl={player.photo_path ? photos.get(player.photo_path) : null}
                className="h-full"
                footer={
                  <div className="flex flex-wrap items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.1em]">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1",
                        player.visible_to_clubs ? "bg-brand-500 text-white" : "bg-white/10 text-white/70"
                      )}
                    >
                      {player.visible_to_clubs ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                      {player.visible_to_clubs ? "Für Vereine freigegeben" : "Nicht freigegeben"}
                    </span>
                    {player.photo_path ? null : (
                      <span className="inline-flex items-center gap-1 bg-amber-400/20 px-2 py-1 text-amber-200">
                        <ImageOff className="h-3.5 w-3.5" aria-hidden="true" />
                        Foto fehlt
                      </span>
                    )}
                    <span className={cn("inline-flex items-center gap-1 px-2 py-1", player.cv_path ? "bg-white/10 text-white" : "bg-amber-400/20 text-amber-200")}>
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      {player.cv_path ? "CV" : "CV fehlt"}
                    </span>
                    <FreshnessTag freshness={freshness.get(player.id)!} />
                  </div>
                }
              />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function FreshnessTag({ freshness }: { freshness: Freshness }) {
  if (!freshness.stale) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-amber-400 px-2 py-1 text-navy-950">
      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
      {freshness.reason === "contract" ? "Vertrag abgelaufen" : "Profil prüfen"}
    </span>
  );
}

function FilterChip({ href, active, children, tone }: { href: string; active: boolean; children: ReactNode; tone?: "warn" }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center border px-4 text-xs font-extrabold uppercase tracking-[0.1em] transition-colors",
        active
          ? "border-navy-950 bg-navy-950 text-white"
          : tone === "warn"
            ? "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400"
            : "border-slate-200 bg-white text-navy-950 hover:border-brand-300"
      )}
    >
      {children}
    </Link>
  );
}
