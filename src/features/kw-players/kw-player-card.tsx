import type { ReactNode } from "react";
import { playerAge } from "@/features/matching/engine";
import { CLUB_COACH_ROLE_LABELS, CLUB_POSITION_SHORT_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { ATTACK_POSITIONS } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { KwPlayer } from "@/types/domain";

const copy = {
  de: { age: "Alter", height: "Größe", free: "Frei ab", contract: "Vertrag bis", open: "offen", coach: "Trainer", years: "J." },
  en: { age: "Age", height: "Height", free: "Free from", contract: "Contract until", open: "open", coach: "Coach", years: "y" },
  fr: { age: "Âge", height: "Taille", free: "Libre dès", contract: "Contrat jusqu’à", open: "ouvert", coach: "Entraîneur", years: "ans" },
  es: { age: "Edad", height: "Altura", free: "Libre desde", contract: "Contrato hasta", open: "abierto", coach: "Entrenador", years: "a." }
} as const;

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
  className
}: {
  player: KwPlayer;
  photoUrl?: string | null;
  locale?: ClubLocale;
  topRight?: ReactNode;
  footer?: ReactNode;
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
        <div className="relative h-24 w-[4.5rem] shrink-0">
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
            <span className="bg-brand-500 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.16em]">
              {kwPlayerHeadline(player, locale)}
            </span>
            {topRight}
          </div>
          <p className="mt-2 font-display text-[1.9rem] leading-[0.88]">
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
      {footer ? <div className="relative mt-auto border-t border-white/10 p-4">{footer}</div> : null}
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-l border-white/10 px-4 py-3 first:border-l-0">
      <dt className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/55">{label}</dt>
      <dd className="font-display text-xl leading-none">{value}</dd>
    </div>
  );
}
