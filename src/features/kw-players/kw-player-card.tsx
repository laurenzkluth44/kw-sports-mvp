import type { ReactNode } from "react";
import { playerAge } from "@/features/matching/engine";
import { CLUB_COACH_ROLE_LABELS, CLUB_POSITION_SHORT_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { ATTACK_POSITIONS } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { KwPlayer } from "@/types/domain";
import { headlineLine } from "@/features/kw-players/stats-model";

const copy = {
  de: { age: "Alter", height: "Größe", free: "Frei ab", contract: "Vertrag bis", open: "offen", coach: "Trainer", years: "J.",
    season: "Saison", asOf: "Stand", games: "Spiele", goals: "Tore", shotPct: "Wurf %", assists: "Assists", hpi: "HPI ⌀", saves: "Paraden", savePct: "Quote %" },
  en: { age: "Age", height: "Height", free: "Free from", contract: "Contract until", open: "open", coach: "Coach", years: "y",
    season: "Season", asOf: "as of", games: "Games", goals: "Goals", shotPct: "Shot %", assists: "Assists", hpi: "HPI avg", saves: "Saves", savePct: "Save %" },
  fr: { age: "Âge", height: "Taille", free: "Libre dès", contract: "Contrat jusqu’à", open: "ouvert", coach: "Entraîneur", years: "ans",
    season: "Saison", asOf: "au", games: "Matchs", goals: "Buts", shotPct: "Tirs %", assists: "Passes déc.", hpi: "HPI moy.", saves: "Arrêts", savePct: "Arrêts %" },
  es: { age: "Edad", height: "Altura", free: "Libre desde", contract: "Contrato hasta", open: "abierto", coach: "Entrenador", years: "a.",
    season: "Temporada", asOf: "a", games: "Partidos", goals: "Goles", shotPct: "Tiro %", assists: "Asist.", hpi: "HPI med.", saves: "Paradas", savePct: "Paradas %" }
} as const;

/** Current season numbers from the match reports (kw_player_games), if the player has any. */
function SeasonStats({ player, locale }: { player: KwPlayer; locale: ClubLocale }) {
  const line = player.kind === "spieler" ? headlineLine(player.kw_player_games ?? []) : null;
  if (!line) return null;
  const t = copy[locale];
  const keeper = player.attack_positions.length > 0 && player.attack_positions.every((position) => position === "TW");
  const cells = keeper
    ? [
        { label: t.games, value: line.games },
        { label: t.saves, value: line.saves },
        { label: t.savePct, value: line.savePct },
        { label: t.hpi, value: line.hpi }
      ]
    : [
        { label: t.games, value: line.games },
        { label: t.goals, value: line.goals },
        { label: t.shotPct, value: line.shotPct },
        { label: t.assists, value: line.assists },
        { label: t.hpi, value: line.hpi }
      ];
  const shown = cells.filter((cell) => cell.value !== null && cell.value !== undefined);

  return (
    <div className="relative border-t border-white/10 px-4 pb-3 pt-2.5">
      <p className="flex justify-between gap-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/60">
        <span className="truncate">
          <span className="text-brand-300">{t.season} {line.season}</span> · {line.competition}
        </span>
        <span className="shrink-0">
          {t.asOf} {formatDate(line.lastGame, locale)}
        </span>
      </p>
      <dl className="mt-2 flex justify-between gap-2">
        {shown.map((cell) => (
          <div key={cell.label} className="min-w-0">
            <dt className="truncate text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white/55">{cell.label}</dt>
            <dd className="font-display text-xl leading-none">{String(cell.value).replace(".", locale === "en" ? "." : ",")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function kwPlayerHeadline(player: KwPlayer, locale: ClubLocale) {
  if (player.kind === "trainer") {
    return player.coach_roles.map((role) => CLUB_COACH_ROLE_LABELS[locale][role]).join(" · ") || copy[locale].coach;
  }
  const attack = ATTACK_POSITIONS.filter((position) => player.attack_positions.includes(position)).map(
    (position) => CLUB_POSITION_SHORT_LABELS[locale][position]
  );
  return attack.join(" · ") || player.defense_positions.map((position) => `A${position}`).join(" · ") || "–";
}

/**
 * KW player card in the style of the KW CV front page: dark, photo with blue corner,
 * name in Bebas, three key facts. Used in the admin player list and for club suggestions.
 */
export function KwPlayerCard({
  player,
  photoUrl,
  locale = "de",
  topRight,
  footer,
  details,
  size = "md",
  className
}: {
  player: KwPlayer;
  photoUrl?: string | null;
  locale?: ClubLocale;
  topRight?: ReactNode;
  footer?: ReactNode;
  /** Extra dark section between the facts and the footer (e.g. positions on the court). */
  details?: ReactNode;
  /** "lg": bigger photo and name, for the detailed suggestion view. */
  size?: "md" | "lg";
  className?: string;
}) {
  const t = copy[locale];
  const age = playerAge(player);
  const freeFrom = player.available_from ?? null;

  return (
    <article className={cn("relative flex flex-col overflow-hidden bg-navy-950 text-white", className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -top-4 whitespace-nowrap font-display text-[7.5rem] leading-[0.8] text-white/[0.06]"
      >
        {player.kind === "trainer" ? "CO" : player.attack_positions[0] ?? "KW"}
      </span>
      <div className="relative flex gap-4 p-5">
        <div className={cn("relative shrink-0", size === "lg" ? "h-36 w-[6.75rem]" : "h-24 w-[4.5rem]")}>
          <span aria-hidden="true" className="absolute -left-1.5 -top-1.5 h-4 w-4 border-l-2 border-t-2 border-brand-500" />
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full bg-white object-cover object-top" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-white/10 font-display text-2xl text-white/70">
              {player.first_name[0]}
              {player.last_name[0]}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="bg-brand-500 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.16em]">
              {kwPlayerHeadline(player, locale)}
            </span>
            {topRight}
          </div>
          <p className={cn("mt-2 font-display leading-[0.88]", size === "lg" ? "text-[2.4rem]" : "text-[1.9rem]")}>
            {player.first_name} <span className="block text-brand-500">{player.last_name}</span>
          </p>
          <p className="mt-1 truncate text-xs text-white/65">
            {[player.current_club, player.current_league].filter(Boolean).join(" · ") || "–"}
          </p>
        </div>
      </div>
      <dl className="relative grid grid-cols-3 border-t border-white/10">
        <Fact label={t.age} value={age !== null ? `${age}` : "–"} />
        <Fact label={t.height} value={player.height_cm ? `${player.height_cm}` : "–"} />
        <Fact
          label={freeFrom ? t.free : t.contract}
          value={freeFrom ? formatDate(freeFrom, locale) : player.contract_until ? formatDate(player.contract_until, locale) : t.open}
        />
      </dl>
      <SeasonStats player={player} locale={locale} />
      {details}
      {footer ? <div className="relative mt-auto border-t border-white/10 p-4">{footer}</div> : null}
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-l border-white/10 px-4 py-3 first:border-l-0">
      <dt className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/70">{label}</dt>
      <dd className="font-display text-xl leading-none">{value}</dd>
    </div>
  );
}
