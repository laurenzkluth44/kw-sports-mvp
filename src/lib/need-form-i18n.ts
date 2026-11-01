import type { ClubLocale } from "@/lib/club-i18n";

export type NeedFormFlowCopy = {
  steps: [string, string, string, string];
  stepHints: [string, string, string, string];
  next: string;
  back: string;
  /** Template with {step} and {total}; plain text because it is passed to a client component. */
  stepOf: string;
  picker: {
    attack: string;
    defense: string;
    tap: string;
    selected: string;
    none: string;
    /** Template with {label}. */
    remove: string;
    defensePrefix: string;
  };
};

export const needFormFlowCopy: Record<ClubLocale, NeedFormFlowCopy> = {
  de: {
    steps: ["Art & Position", "Zeitpunkt & Status", "Profil", "Budget & Vertraulich"],
    stepHints: [
      "Spieler oder Trainer? Positionen tippst du direkt auf dem Spielfeld an.",
      "Ab wann, für welche Saison und wie dringend.",
      "Alles hier ist optional, hilft aber bei der Suche.",
      "Optional. Vertrauliches sieht nur KW Sports."
    ],
    next: "Weiter",
    back: "Zurück",
    stepOf: "Schritt {step} von {total}",
    picker: {
      attack: "Angriff",
      defense: "Abwehr 6:0",
      tap: "Tippe auf die Positionen",
      selected: "Deine Auswahl",
      none: "Noch keine Position gewählt. Mehrfachauswahl ist möglich.",
      remove: "{label} entfernen",
      defensePrefix: "Abwehr"
    }
  },
  en: {
    steps: ["Type & position", "Timing & status", "Profile", "Budget & confidential"],
    stepHints: [
      "Player or coach? Tap the positions right on the court.",
      "From when, for which season and how urgent.",
      "Everything here is optional, but it helps the search.",
      "Optional. Confidential info is only visible to KW Sports."
    ],
    next: "Next",
    back: "Back",
    stepOf: "Step {step} of {total}",
    picker: {
      attack: "Attack",
      defense: "Defence 6:0",
      tap: "Tap the positions",
      selected: "Your selection",
      none: "No position selected yet. You can pick several.",
      remove: "Remove {label}",
      defensePrefix: "Defence"
    }
  },
  fr: {
    steps: ["Type & poste", "Date & statut", "Profil", "Budget & confidentiel"],
    stepHints: [
      "Joueur ou entraîneur ? Touche les postes directement sur le terrain.",
      "À partir de quand, pour quelle saison et avec quelle urgence.",
      "Tout est facultatif ici, mais aide la recherche.",
      "Facultatif. Les infos confidentielles ne sont visibles que par KW Sports."
    ],
    next: "Suivant",
    back: "Retour",
    stepOf: "Étape {step} sur {total}",
    picker: {
      attack: "Attaque",
      defense: "Défense 6:0",
      tap: "Touche les postes",
      selected: "Ta sélection",
      none: "Aucun poste choisi. Plusieurs choix possibles.",
      remove: "Retirer {label}",
      defensePrefix: "Défense"
    }
  },
  es: {
    steps: ["Tipo y puesto", "Fecha y estado", "Perfil", "Presupuesto y confidencial"],
    stepHints: [
      "¿Jugador o entrenador? Toca los puestos directamente en la pista.",
      "Desde cuándo, para qué temporada y con qué urgencia.",
      "Todo aquí es opcional, pero ayuda en la búsqueda.",
      "Opcional. La información confidencial solo la ve KW Sports."
    ],
    next: "Siguiente",
    back: "Atrás",
    stepOf: "Paso {step} de {total}",
    picker: {
      attack: "Ataque",
      defense: "Defensa 6:0",
      tap: "Toca los puestos",
      selected: "Tu selección",
      none: "Aún no hay puesto elegido. Puedes elegir varios.",
      remove: "Quitar {label}",
      defensePrefix: "Defensa"
    }
  }
};
