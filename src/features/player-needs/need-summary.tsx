import { ATTACK_POSITIONS } from "@/lib/constants";
import {
  CLUB_COACH_ROLE_LABELS,
  CLUB_NEED_TYPE_LABELS,
  CLUB_PLAYER_TYPE_LABELS,
  CLUB_POSITION_LABELS,
  CLUB_POSITION_SHORT_LABELS,
  CLUB_TARGET_ROLE_LABELS,
  clubCopy,
  defensePositionLabel,
  languageLabel,
  type ClubLocale
} from "@/lib/club-i18n";
import { cn } from "@/lib/utils";
import type { PlayerNeed } from "@/types/domain";

type NeedPositionFields = Pick<PlayerNeed, "need_type" | "attack_positions" | "defense_positions" | "coach_role">;

export function attackPositionsText(need: NeedPositionFields, locale: ClubLocale = "de") {
  return ATTACK_POSITIONS.filter((position) => need.attack_positions.includes(position))
    .map((position) => CLUB_POSITION_SHORT_LABELS[locale][position])
    .join(" / ");
}

export function defensePositionsText(need: NeedPositionFields, locale: ClubLocale = "de") {
  if (need.defense_positions.length === 0) return "";
  const positions = [...need.defense_positions].sort((a, b) => a - b).join(", ");
  return `${clubCopy[locale].dashboard.defense} ${positions}`;
}

export function hasNeedPosition(need: NeedPositionFields) {
  if (need.need_type === "trainer") return Boolean(need.coach_role);
  return need.attack_positions.length > 0 || need.defense_positions.length > 0;
}

/** One-line label for headers, inbox rows and exports: "RL / RM · Abwehr 3, 4" or "Co-Trainer". */
export function needHeadline(need: NeedPositionFields, locale: ClubLocale = "de") {
  if (need.need_type === "trainer") {
    return need.coach_role ? CLUB_COACH_ROLE_LABELS[locale][need.coach_role] : CLUB_NEED_TYPE_LABELS[locale].trainer;
  }

  const parts = [attackPositionsText(need, locale), defensePositionsText(need, locale)].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : clubCopy[locale].dashboard.noPosition;
}

export function NeedPositionCell({
  need,
  locale = "de",
  className
}: {
  need: NeedPositionFields;
  locale?: ClubLocale;
  className?: string;
}) {
  if (need.need_type === "trainer") {
    return (
      <div className={className}>
        <p className="text-xs font-black uppercase tracking-[0.08em] text-brand-700">
          {CLUB_NEED_TYPE_LABELS[locale].trainer}
        </p>
        <p className="text-base font-bold text-navy-950">{needHeadline(need, locale)}</p>
      </div>
    );
  }

  if (!hasNeedPosition(need)) {
    return (
      <p className={cn("w-fit rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700", className)}>
        {clubCopy[locale].dashboard.noPosition}
      </p>
    );
  }

  const attack = attackPositionsText(need, locale);
  const defense = defensePositionsText(need, locale);

  return (
    <div className={className}>
      <p className="text-base font-bold text-navy-950">{attack || defense}</p>
      {attack && defense ? <p className="mt-0.5 text-xs font-semibold text-slate-500">{defense}</p> : null}
    </div>
  );
}

/** Localized label lists for the detail pages and exports. */
export function needProfileLabels(
  need: NeedPositionFields & Pick<PlayerNeed, "player_types" | "target_roles" | "languages">,
  locale: ClubLocale = "de"
) {
  return {
    needType: CLUB_NEED_TYPE_LABELS[locale][need.need_type],
    coachRole: need.coach_role ? CLUB_COACH_ROLE_LABELS[locale][need.coach_role] : null,
    attackPositions: ATTACK_POSITIONS.filter((position) => need.attack_positions.includes(position)).map(
      (position) => CLUB_POSITION_LABELS[locale][position]
    ),
    defensePositions: [...need.defense_positions]
      .sort((a, b) => a - b)
      .map((position) => defensePositionLabel(position, locale)),
    playerTypes: need.player_types.map((type) => CLUB_PLAYER_TYPE_LABELS[locale][type]),
    targetRoles: need.target_roles.map((role) => CLUB_TARGET_ROLE_LABELS[locale][role]),
    languages: need.languages.map((language) => languageLabel(language, locale))
  };
}

export function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return <>-</>;

  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-sm border border-brand-100 bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700"
        >
          {item}
        </span>
      ))}
    </span>
  );
}
