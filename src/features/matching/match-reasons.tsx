import { Check, HelpCircle, X } from "lucide-react";
import {
  CLUB_COACH_ROLE_LABELS,
  CLUB_PLAYER_TYPE_LABELS,
  languageLabel,
  type ClubLocale
} from "@/lib/club-i18n";
import { cn } from "@/lib/utils";
import type { CoachRole, Language, MatchReason, PlayerType } from "@/types/domain";

const text = {
  de: {
    position: (v: string) => `Position ${v}`,
    coachRole: (v: string) => `Rolle ${v}`,
    from: (v: string) => `frei ab ${v}`,
    until: (v: string) => `Vertrag bis ${v}`,
    availabilityUnknown: "Verfügbarkeit offen",
    age: (v: string) => `${v} Jahre`,
    ageUnknown: "Alter unbekannt",
    height: (v: string) => `${v} cm`,
    heightUnknown: "Größe unbekannt",
    languagesNo: "Sprache passt nicht",
    languagesUnknown: "Sprachen offen",
    typesNo: "anderer Spielertyp",
    typesUnknown: "Spielertyp offen",
    league: (v: string) => `Erfahrung ${v}`,
    leagueNo: (v: string) => `keine Erfahrung ${v}`,
    leagueUnknown: "Liga-Erfahrung offen"
  },
  en: {
    position: (v: string) => `Position ${v}`,
    coachRole: (v: string) => `Role ${v}`,
    from: (v: string) => `free from ${v}`,
    until: (v: string) => `contract until ${v}`,
    availabilityUnknown: "availability open",
    age: (v: string) => `${v} years`,
    ageUnknown: "age unknown",
    height: (v: string) => `${v} cm`,
    heightUnknown: "height unknown",
    languagesNo: "language doesn't match",
    languagesUnknown: "languages open",
    typesNo: "different player type",
    typesUnknown: "player type open",
    league: (v: string) => `experience ${v}`,
    leagueNo: (v: string) => `no ${v} experience`,
    leagueUnknown: "league experience open"
  },
  fr: {
    position: (v: string) => `Poste ${v}`,
    coachRole: (v: string) => `Rôle ${v}`,
    from: (v: string) => `libre dès ${v}`,
    until: (v: string) => `contrat jusqu’à ${v}`,
    availabilityUnknown: "disponibilité ouverte",
    age: (v: string) => `${v} ans`,
    ageUnknown: "âge inconnu",
    height: (v: string) => `${v} cm`,
    heightUnknown: "taille inconnue",
    languagesNo: "langue différente",
    languagesUnknown: "langues ouvertes",
    typesNo: "autre profil",
    typesUnknown: "profil ouvert",
    league: (v: string) => `expérience ${v}`,
    leagueNo: (v: string) => `sans expérience ${v}`,
    leagueUnknown: "expérience ouverte"
  },
  es: {
    position: (v: string) => `Puesto ${v}`,
    coachRole: (v: string) => `Rol ${v}`,
    from: (v: string) => `libre desde ${v}`,
    until: (v: string) => `contrato hasta ${v}`,
    availabilityUnknown: "disponibilidad abierta",
    age: (v: string) => `${v} años`,
    ageUnknown: "edad desconocida",
    height: (v: string) => `${v} cm`,
    heightUnknown: "altura desconocida",
    languagesNo: "idioma distinto",
    languagesUnknown: "idiomas abiertos",
    typesNo: "otro perfil",
    typesUnknown: "perfil abierto",
    league: (v: string) => `experiencia ${v}`,
    leagueNo: (v: string) => `sin experiencia ${v}`,
    leagueUnknown: "experiencia abierta"
  }
} as const;

export function reasonLabel(reason: MatchReason, locale: ClubLocale) {
  const t = text[locale];
  const value = reason.value ?? "";
  switch (reason.key) {
    case "position":
      return t.position(value);
    case "coach_role":
      return t.coachRole(CLUB_COACH_ROLE_LABELS[locale][value as CoachRole] ?? value);
    case "availability":
      if (reason.ok === null || !value) return t.availabilityUnknown;
      return value.startsWith("from:") ? t.from(value.slice(5)) : t.until(value.slice(6));
    case "age":
      return reason.ok === null ? t.ageUnknown : t.age(value);
    case "height":
      return reason.ok === null ? t.heightUnknown : t.height(value);
    case "languages":
      if (reason.ok === null) return t.languagesUnknown;
      if (!reason.ok) return t.languagesNo;
      return value
        .split(",")
        .filter(Boolean)
        .map((code) => languageLabel(code as Language, locale))
        .join(", ");
    case "player_types":
      if (reason.ok === null) return t.typesUnknown;
      if (!reason.ok) return t.typesNo;
      return value
        .split(",")
        .filter(Boolean)
        .map((type) => CLUB_PLAYER_TYPE_LABELS[locale][type as PlayerType] ?? type)
        .join(", ");
    case "league":
      return reason.ok === null ? t.leagueUnknown : reason.ok ? t.league(value) : t.leagueNo(value);
    default:
      return "";
  }
}

/** ✓ / ✗ / ? chips explaining a suggestion. */
export function MatchReasons({ reasons, locale, tone = "light" }: { reasons: MatchReason[]; locale: ClubLocale; tone?: "light" | "dark" }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {reasons.map((reason) => {
        const Icon = reason.ok === true ? Check : reason.ok === false ? X : HelpCircle;
        return (
          <li
            key={reason.key}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold",
              tone === "dark"
                ? reason.ok === true
                  ? "bg-brand-500/20 text-white"
                  : reason.ok === false
                    ? "bg-white/5 text-white/60 line-through decoration-white/40"
                    : "bg-white/5 text-white/70"
                : reason.ok === true
                  ? "bg-brand-50 text-brand-700"
                  : reason.ok === false
                    ? "bg-slate-100 text-slate-500"
                    : "bg-amber-50 text-amber-800"
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">{reason.ok === true ? "✓" : reason.ok === false ? "✗" : "?"}</span>
            {reasonLabel(reason, locale)}
          </li>
        );
      })}
    </ul>
  );
}

export function scoreTone(score: number) {
  return score >= 80 ? "bg-brand-500 text-white" : score >= 55 ? "bg-navy-950 text-white" : "bg-slate-200 text-navy-950";
}
