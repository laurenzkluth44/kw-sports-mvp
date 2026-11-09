import { COURT_ASPECT, CourtLines, attackSpot, defenseSpot } from "@/features/court/court";
import { CLUB_PLAYER_TYPE_LABELS, CLUB_POSITION_SHORT_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { ATTACK_POSITIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AttackPosition, DefensePosition, KwPlayer, MatchReason } from "@/types/domain";

const copy = {
  de: { positions: "Positionen", attack: "Angriff", defense: "Abwehr", fits: "passt zum Bedarf", types: "Spielertyp", noDefense: "Abwehrposition nicht hinterlegt" },
  en: { positions: "Positions", attack: "Attack", defense: "Defence", fits: "fits your need", types: "Player type", noDefense: "Defence position not on file" },
  fr: { positions: "Postes", attack: "Attaque", defense: "Défense", fits: "correspond au besoin", types: "Profil", noDefense: "Poste défensif non renseigné" },
  es: { positions: "Puestos", attack: "Ataque", defense: "Defensa", fits: "encaja con la necesidad", types: "Tipo de jugador", noDefense: "Puesto defensivo sin datos" }
} as const;

/** Codes from the "position" match reason ("RM · A2 · A5") – the ones that fit the club's need. */
export function matchedPositions(reasons: MatchReason[]) {
  const value = reasons.find((reason) => reason.key === "position")?.value ?? "";
  const codes = value.split(" · ").filter(Boolean);
  return {
    attack: codes.filter((code): code is AttackPosition => (ATTACK_POSITIONS as readonly string[]).includes(code)),
    defense: codes.filter((code) => /^A\d$/.test(code)).map((code) => Number(code.slice(1)) as DefensePosition)
  };
}

/**
 * The player's positions on the KW tactics board (dark), for the CV-style card: attack as
 * circles, 6:0 defence as squares; positions that fit the club's need are blue. Below, his
 * player types as chips. Renders nothing for coaches or players without positions.
 */
export function KwPlayerPositions({
  player,
  locale,
  matched
}: {
  player: KwPlayer;
  locale: ClubLocale;
  matched?: { attack: AttackPosition[]; defense: DefensePosition[] };
}) {
  const t = copy[locale];
  if (player.kind !== "spieler") return null;
  const attack = ATTACK_POSITIONS.filter((code) => player.attack_positions.includes(code));
  const defense = [...player.defense_positions].sort();
  if (attack.length === 0 && defense.length === 0 && player.player_types.length === 0) return null;
  const hasMatch = Boolean(matched && (matched.attack.length || matched.defense.length));

  return (
    <div className="relative flex flex-col gap-4 border-t border-white/10 p-5">
      {attack.length || defense.length ? (
        <div>
          <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand-500">
            <span aria-hidden="true" className="h-px w-6 bg-brand-500" />
            {t.positions}
          </p>
          <div className="relative mx-auto mt-3 w-full max-w-[18rem]" style={{ aspectRatio: COURT_ASPECT.full }}>
            <CourtLines crop="full" />
            {defense.map((position) => {
              const fit = matched?.defense.includes(position);
              return (
                <span
                  key={`d${position}`}
                  className={cn(
                    "absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center font-display text-sm leading-none",
                    fit ? "bg-brand-500 text-white" : "border border-white/70 bg-navy-950 text-white"
                  )}
                  style={defenseSpot(position, "full")}
                  title={`${t.defense} ${position}`}
                >
                  {position}
                </span>
              );
            })}
            {attack.map((code) => {
              const fit = matched?.attack.includes(code);
              return (
                <span
                  key={code}
                  className={cn(
                    "absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-[0.95rem] leading-none",
                    fit ? "bg-brand-500 text-white ring-4 ring-brand-500/30" : "border-2 border-white bg-navy-950 text-white"
                  )}
                  style={attackSpot(code, "full")}
                  title={CLUB_POSITION_SHORT_LABELS[locale][code]}
                >
                  {CLUB_POSITION_SHORT_LABELS[locale][code]}
                </span>
              );
            })}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/70">
            <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 rounded-full border-2 border-white" />{t.attack}</li>
            <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 border border-white/70" />{t.defense}</li>
            {hasMatch ? <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 bg-brand-500" />{t.fits}</li> : null}
          </ul>
          {defense.length === 0 ? <p className="mt-1 text-xs text-white/60">{t.noDefense}</p> : null}
        </div>
      ) : null}

      {player.player_types.length ? (
        <div>
          <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand-500">
            <span aria-hidden="true" className="h-px w-6 bg-brand-500" />
            {t.types}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {player.player_types.map((type) => (
              <li key={type} className="border border-white/20 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white">
                {CLUB_PLAYER_TYPE_LABELS[locale][type]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
