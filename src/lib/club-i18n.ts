import { defenseGroupOf } from "@/lib/constants";
import type {
  AttackPosition,
  CoachRole,
  DefenseGroup,
  DefensePosition,
  Language,
  NeedType,
  PlayerNeedStatus,
  PlayerType,
  Priority,
  TargetRole
} from "@/types/domain";

export const CLUB_LOCALE_COOKIE = "kw_club_locale";
export const CLUB_LOCALES = ["de", "en", "fr", "es"] as const;

export type ClubLocale = (typeof CLUB_LOCALES)[number];

export const CLUB_LOCALE_LABELS: Record<ClubLocale, string> = {
  de: "DE",
  en: "EN",
  fr: "FR",
  es: "ES"
};

export function parseClubLocale(value: string | undefined | null): ClubLocale {
  return CLUB_LOCALES.includes(value as ClubLocale) ? (value as ClubLocale) : "de";
}

export const clubCopy = {
  de: {
    app: {
      navNeeds: "Meine Bedarfe",
      navNewNeed: "Neuer Bedarf",
      navSquad: "Kader",
      tagline: "Kaderbedarf Datenbank",
      role: "Club User",
      logout: "Logout",
      language: "Sprache"
    },
    dashboard: {
      eyebrowFallback: "Club Dashboard",
      greeting: "Willkommen",
      title: "Eigene Kaderbedarfe",
      description: "Aktive Suchaufträge deines Vereins.",
      newNeed: "Neuer Bedarf",
      open: "Offen",
      talks: "In Gesprächen",
      highPriority: "Hohe Priorität",
      emptyTitle: "Keine aktiven Bedarfe",
      emptyBody: "Aktive Suchaufträge erscheinen hier, sobald ein Bedarf angelegt wurde.",
      statusError: "Status konnte nicht geändert werden.",
      duplicateError: "Bedarf konnte nicht dupliziert werden.",
      position: "Bedarf",
      season: "Saison",
      neededFrom: "Benötigt ab",
      status: "Status",
      action: "Aktion",
      changeStatus: "Status ändern",
      setStatus: "Status setzen",
      updateHint: "Bitte aktualisieren",
      copy: "Als Vorlage kopieren",
      copyTitle: "Bedarf als Vorlage kopieren",
      editTitle: "Bedarf bearbeiten",
      editSr: "Bedarf bearbeiten",
      footer: "Archivierte und besetzte Suchaufträge bleiben gespeichert. Besetzte Bedarfe erscheinen weiterhin, archivierte nicht.",
      agencies: "Agenturen mit Zugriff",
      noPosition: "Position fehlt",
      defense: "Abwehr",
      statusFilter: "Aktueller Statusfilter"
    },
    form: {
      newTitle: "Neuen Bedarf anlegen",
      newDescription: "Spieler oder Trainer wählen, Pflichtfelder ausfüllen, optionales Profil ergänzen und speichern.",
      editTitle: "Bedarf bearbeiten",
      submitCreate: "Bedarf anlegen",
      submitUpdate: "Änderungen speichern",
      saveError: "Speichern fehlgeschlagen. Bitte Pflichtfelder und Werte prüfen.",
      coreDetails: "Kernangaben",
      coreDetailsDescription: "Diese Felder reichen aus, um den Bedarf sauber in der Datenbank zu speichern.",
      club: "Verein",
      season: "Saison",
      position: "Position",
      neededFrom: "Benötigt ab",
      neededFromHelp: "Format: JJJJ-MM-TT, z.B. 2026-07-01.",
      priority: "Priorität",
      status: "Status",
      closedAt: "Besetzt/archiviert seit",
      closedAtHelp: "Optional, nur bei Status Besetzt oder Archiviert.",
      statusNote: "Statusnotiz",
      statusNotePlaceholder: "Optional: z.B. besetzt seit Datum, Grund für Archivierung oder aktueller Stand",
      description: "Kurzbeschreibung",
      descriptionPlaceholder: "Sportliches Profil oder Kaderkontext. Für Agenturen sichtbar.",
      sportDetails: "Optionale sportliche Details",
      ageMin: "Alter min.",
      ageMax: "Alter max.",
      heightMin: "Größe min. cm",
      nationality: "Nationalität",
      leagueExperience: "Liga-Erfahrung",
      playerType: "Spielertyp",
      contractStatus: "Vertragsstatus",
      budget: "Optionales Budget",
      budgetAmount: "Budgetbetrag",
      currency: "Währung",
      budgetNote: "Budgetnotiz",
      needType: "Art des Bedarfs",
      attackPositions: "Angriffspositionen",
      defensePositions: "Abwehrpositionen",
      positionsHelp: "Mehrfachauswahl möglich. Mindestens eine Angriffs- oder Abwehrposition wählen.",
      defenseHelp: "1/6 Außen · 2/5 Halb · 3/4 Innenblock",
      positionsError: "Bitte mindestens eine Angriffs- oder Abwehrposition wählen.",
      legacyPositionHint: "Für diesen Bedarf ist noch keine Position hinterlegt. Bitte Positionen auswählen.",
      coachRole: "Trainerrolle",
      coachRolePlaceholder: "Rolle wählen",
      coachRoleError: "Bitte eine Trainerrolle wählen.",
      age: "Alter",
      any: "Beliebig",
      playerTypeNote: "Weitere Merkmale",
      targetRoles: "Anvisierte Rolle",
      languages: "Sprachkenntnisse",
      confidential: "Vertraulich · nur KW Sports",
      confidentialHelp: "Nur für KW Sports und deinen Verein sichtbar. Agenturen sehen dieses Feld nicht.",
      confidentialPlaceholder: "z.B. Gehaltsrahmen, interne Gründe oder Wunschkandidaten",
      save: "Speichern"
    }
  },
  en: {
    app: {
      navNeeds: "My roster needs",
      navNewNeed: "New need",
      navSquad: "Squad",
      tagline: "Roster needs database",
      role: "Club user",
      logout: "Log out",
      language: "Language"
    },
    dashboard: {
      eyebrowFallback: "Club dashboard",
      greeting: "Welcome",
      title: "Your roster needs",
      description: "Active recruitment needs for your club.",
      newNeed: "New need",
      open: "Open",
      talks: "In talks",
      highPriority: "High priority",
      emptyTitle: "No active needs",
      emptyBody: "Active recruitment needs will appear here once a roster need has been created.",
      statusError: "Status could not be updated.",
      duplicateError: "Need could not be duplicated.",
      position: "Need",
      season: "Season",
      neededFrom: "Needed from",
      status: "Status",
      action: "Action",
      changeStatus: "Change status",
      setStatus: "Set status",
      updateHint: "Please update",
      copy: "Copy as template",
      copyTitle: "Copy need as template",
      editTitle: "Edit need",
      editSr: "Edit need",
      footer: "Archived and filled needs remain stored. Filled needs stay visible; archived needs are hidden.",
      agencies: "Agencies with access",
      noPosition: "Position missing",
      defense: "Defence",
      statusFilter: "Current status filter"
    },
    form: {
      newTitle: "Create new roster need",
      newDescription: "Choose player or coach, fill the required fields, add an optional profile and save.",
      editTitle: "Edit roster need",
      submitCreate: "Create need",
      submitUpdate: "Save changes",
      saveError: "Saving failed. Please check required fields and values.",
      coreDetails: "Core details",
      coreDetailsDescription: "These fields are enough to store the roster need cleanly in the database.",
      club: "Club",
      season: "Season",
      position: "Position",
      neededFrom: "Needed from",
      neededFromHelp: "Format: YYYY-MM-DD, e.g. 2026-07-01.",
      priority: "Priority",
      status: "Status",
      closedAt: "Filled/archived since",
      closedAtHelp: "Optional, only for Filled or Archived status.",
      statusNote: "Status note",
      statusNotePlaceholder: "Optional: e.g. filled since date, reason for archiving or current state",
      description: "Short brief",
      descriptionPlaceholder: "Sporting profile or squad context. Visible to agencies.",
      sportDetails: "Optional sporting details",
      ageMin: "Min. age",
      ageMax: "Max. age",
      heightMin: "Min. height cm",
      nationality: "Nationality",
      leagueExperience: "League experience",
      playerType: "Player type",
      contractStatus: "Contract status",
      budget: "Optional budget",
      budgetAmount: "Budget amount",
      currency: "Currency",
      budgetNote: "Budget note",
      needType: "Need type",
      attackPositions: "Attacking positions",
      defensePositions: "Defensive positions",
      positionsHelp: "Select as many as needed. Choose at least one attacking or defensive position.",
      defenseHelp: "1/6 wide · 2/5 half · 3/4 centre block",
      positionsError: "Please choose at least one attacking or defensive position.",
      legacyPositionHint: "No position is stored for this need yet. Please select positions.",
      coachRole: "Coaching role",
      coachRolePlaceholder: "Choose role",
      coachRoleError: "Please choose a coaching role.",
      age: "Age",
      any: "Any",
      playerTypeNote: "Other traits",
      targetRoles: "Intended role",
      languages: "Languages",
      confidential: "Confidential · KW Sports only",
      confidentialHelp: "Only visible to KW Sports and your club. Agencies cannot see this field.",
      confidentialPlaceholder: "e.g. salary range, internal reasons or preferred candidates",
      save: "Save"
    }
  },
  fr: {
    app: {
      navNeeds: "Mes besoins d'effectif",
      navNewNeed: "Nouveau besoin",
      navSquad: "Effectif",
      tagline: "Base des besoins d'effectif",
      role: "Utilisateur club",
      logout: "Déconnexion",
      language: "Langue"
    },
    dashboard: {
      eyebrowFallback: "Tableau de bord club",
      greeting: "Bienvenue",
      title: "Besoins d'effectif du club",
      description: "Besoins de recrutement actifs de votre club.",
      newNeed: "Nouveau besoin",
      open: "Ouverts",
      talks: "En discussion",
      highPriority: "Priorité haute",
      emptyTitle: "Aucun besoin actif",
      emptyBody: "Les besoins de recrutement actifs apparaîtront ici dès qu'un besoin sera créé.",
      statusError: "Le statut n'a pas pu être modifié.",
      duplicateError: "Le besoin n'a pas pu être dupliqué.",
      position: "Besoin",
      season: "Saison",
      neededFrom: "Disponible à partir du",
      status: "Statut",
      action: "Action",
      changeStatus: "Modifier le statut",
      setStatus: "Définir le statut",
      updateHint: "À actualiser",
      copy: "Copier comme modèle",
      copyTitle: "Copier le besoin comme modèle",
      editTitle: "Modifier le besoin",
      editSr: "Modifier le besoin",
      footer: "Les besoins archivés et pourvus restent enregistrés. Les besoins pourvus restent visibles; les besoins archivés sont masqués.",
      agencies: "Agences ayant accès",
      noPosition: "Poste manquant",
      defense: "Défense",
      statusFilter: "Filtre de statut actuel"
    },
    form: {
      newTitle: "Créer un besoin d'effectif",
      newDescription: "Choisissez joueur ou entraîneur, renseignez les champs obligatoires, ajoutez le profil optionnel et enregistrez.",
      editTitle: "Modifier le besoin d'effectif",
      submitCreate: "Créer le besoin",
      submitUpdate: "Enregistrer",
      saveError: "L'enregistrement a échoué. Veuillez vérifier les champs obligatoires et les valeurs.",
      coreDetails: "Informations clés",
      coreDetailsDescription: "Ces champs suffisent pour enregistrer proprement le besoin dans la base.",
      club: "Club",
      season: "Saison",
      position: "Poste",
      neededFrom: "Disponible à partir du",
      neededFromHelp: "Format : AAAA-MM-JJ, par ex. 2026-07-01.",
      priority: "Priorité",
      status: "Statut",
      closedAt: "Pourvu/archivé depuis",
      closedAtHelp: "Optionnel, uniquement pour les statuts Pourvu ou Archivé.",
      statusNote: "Note de statut",
      statusNotePlaceholder: "Optionnel : date de recrutement, raison de l'archivage ou situation actuelle",
      description: "Brief court",
      descriptionPlaceholder: "Profil sportif ou contexte d'effectif. Visible par les agences.",
      sportDetails: "Détails sportifs optionnels",
      ageMin: "Âge min.",
      ageMax: "Âge max.",
      heightMin: "Taille min. cm",
      nationality: "Nationalité",
      leagueExperience: "Expérience de championnat",
      playerType: "Profil de joueur",
      contractStatus: "Situation contractuelle",
      budget: "Budget optionnel",
      budgetAmount: "Montant du budget",
      currency: "Devise",
      budgetNote: "Note budget",
      needType: "Type de besoin",
      attackPositions: "Postes en attaque",
      defensePositions: "Postes en défense",
      positionsHelp: "Plusieurs choix possibles. Choisissez au moins un poste en attaque ou en défense.",
      defenseHelp: "1/6 extérieur · 2/5 arrière · 3/4 central",
      positionsError: "Veuillez choisir au moins un poste en attaque ou en défense.",
      legacyPositionHint: "Aucun poste n'est encore enregistré pour ce besoin. Veuillez sélectionner des postes.",
      coachRole: "Rôle d'entraîneur",
      coachRolePlaceholder: "Choisir un rôle",
      coachRoleError: "Veuillez choisir un rôle d'entraîneur.",
      age: "Âge",
      any: "Indifférent",
      playerTypeNote: "Autres caractéristiques",
      targetRoles: "Rôle visé",
      languages: "Langues parlées",
      confidential: "Confidentiel · KW Sports uniquement",
      confidentialHelp: "Visible uniquement par KW Sports et votre club. Les agences ne voient pas ce champ.",
      confidentialPlaceholder: "p. ex. fourchette salariale, raisons internes ou candidats souhaités",
      save: "Enregistrer"
    }
  },
  es: {
    app: {
      navNeeds: "Mis necesidades",
      navNewNeed: "Nueva necesidad",
      navSquad: "Plantilla",
      tagline: "Base de necesidades de plantilla",
      role: "Usuario de club",
      logout: "Cerrar sesión",
      language: "Idioma"
    },
    dashboard: {
      eyebrowFallback: "Panel del club",
      greeting: "Bienvenido",
      title: "Necesidades de plantilla",
      description: "Necesidades activas de fichaje de tu club.",
      newNeed: "Nueva necesidad",
      open: "Abiertas",
      talks: "En conversaciones",
      highPriority: "Prioridad alta",
      emptyTitle: "Sin necesidades activas",
      emptyBody: "Las necesidades activas de fichaje aparecerán aquí cuando se cree una necesidad de plantilla.",
      statusError: "No se pudo actualizar el estado.",
      duplicateError: "No se pudo duplicar la necesidad.",
      position: "Necesidad",
      season: "Temporada",
      neededFrom: "Necesario desde",
      status: "Estado",
      action: "Acción",
      changeStatus: "Cambiar estado",
      setStatus: "Guardar estado",
      updateHint: "Actualizar",
      copy: "Copiar como plantilla",
      copyTitle: "Copiar necesidad como plantilla",
      editTitle: "Editar necesidad",
      editSr: "Editar necesidad",
      footer: "Las necesidades archivadas y cubiertas permanecen guardadas. Las cubiertas siguen visibles; las archivadas se ocultan.",
      agencies: "Agencias con acceso",
      noPosition: "Puesto sin definir",
      defense: "Defensa",
      statusFilter: "Filtro de estado actual"
    },
    form: {
      newTitle: "Crear necesidad de plantilla",
      newDescription: "Elige jugador o entrenador, completa los campos obligatorios, añade un perfil opcional y guarda.",
      editTitle: "Editar necesidad de plantilla",
      submitCreate: "Crear necesidad",
      submitUpdate: "Guardar cambios",
      saveError: "No se pudo guardar. Revisa los campos obligatorios y los valores.",
      coreDetails: "Datos clave",
      coreDetailsDescription: "Estos campos bastan para guardar correctamente la necesidad en la base de datos.",
      club: "Club",
      season: "Temporada",
      position: "Puesto",
      neededFrom: "Necesario desde",
      neededFromHelp: "Formato: AAAA-MM-DD, p. ej. 2026-07-01.",
      priority: "Prioridad",
      status: "Estado",
      closedAt: "Cubierto/archivado desde",
      closedAtHelp: "Opcional, solo para estado Cubierto o Archivado.",
      statusNote: "Nota de estado",
      statusNotePlaceholder: "Opcional: fecha de cobertura, motivo de archivo o estado actual",
      description: "Breve descripción",
      descriptionPlaceholder: "Perfil deportivo o contexto de plantilla. Visible para las agencias.",
      sportDetails: "Detalles deportivos opcionales",
      ageMin: "Edad mín.",
      ageMax: "Edad máx.",
      heightMin: "Altura mín. cm",
      nationality: "Nacionalidad",
      leagueExperience: "Experiencia en liga",
      playerType: "Tipo de jugador",
      contractStatus: "Situación contractual",
      budget: "Presupuesto opcional",
      budgetAmount: "Importe del presupuesto",
      currency: "Moneda",
      budgetNote: "Nota de presupuesto",
      needType: "Tipo de necesidad",
      attackPositions: "Puestos en ataque",
      defensePositions: "Puestos en defensa",
      positionsHelp: "Selección múltiple posible. Elige al menos un puesto en ataque o en defensa.",
      defenseHelp: "1/6 exterior · 2/5 lateral · 3/4 central",
      positionsError: "Elige al menos un puesto en ataque o en defensa.",
      legacyPositionHint: "Esta necesidad todavía no tiene puesto. Selecciona los puestos.",
      coachRole: "Función de entrenador",
      coachRolePlaceholder: "Elegir función",
      coachRoleError: "Elige una función de entrenador.",
      age: "Edad",
      any: "Indiferente",
      playerTypeNote: "Otras características",
      targetRoles: "Rol previsto",
      languages: "Idiomas",
      confidential: "Confidencial · solo KW Sports",
      confidentialHelp: "Solo visible para KW Sports y tu club. Las agencias no ven este campo.",
      confidentialPlaceholder: "p. ej. rango salarial, motivos internos o candidatos preferidos",
      save: "Guardar"
    }
  }
} as const;

export const CLUB_POSITION_LABELS: Record<ClubLocale, Record<AttackPosition, string>> = {
  de: {
    TW: "TW · Torwart",
    LA: "LA · Linksaußen",
    RL: "RL · Rückraum links",
    RM: "RM · Rückraum Mitte",
    RR: "RR · Rückraum rechts",
    RA: "RA · Rechtsaußen",
    KM: "KM · Kreisläufer"
  },
  en: {
    TW: "GK · Goalkeeper",
    LA: "LW · Left wing",
    RL: "LB · Left back",
    RM: "CB · Centre back",
    RR: "RB · Right back",
    RA: "RW · Right wing",
    KM: "P · Pivot"
  },
  fr: {
    TW: "GB · Gardien",
    LA: "ALG · Ailier gauche",
    RL: "ARG · Arrière gauche",
    RM: "DC · Demi-centre",
    RR: "ARD · Arrière droit",
    RA: "ALD · Ailier droit",
    KM: "PVT · Pivot"
  },
  es: {
    TW: "POR · Portero",
    LA: "EI · Extremo izquierdo",
    RL: "LI · Lateral izquierdo",
    RM: "C · Central",
    RR: "LD · Lateral derecho",
    RA: "ED · Extremo derecho",
    KM: "PIV · Pivote"
  }
};

export const CLUB_POSITION_SHORT_LABELS: Record<ClubLocale, Record<AttackPosition, string>> = {
  de: { TW: "TW", LA: "LA", RL: "RL", RM: "RM", RR: "RR", RA: "RA", KM: "KM" },
  en: { TW: "GK", LA: "LW", RL: "LB", RM: "CB", RR: "RB", RA: "RW", KM: "P" },
  fr: { TW: "GB", LA: "ALG", RL: "ARG", RM: "DC", RR: "ARD", RA: "ALD", KM: "PVT" },
  es: { TW: "POR", LA: "EI", RL: "LI", RM: "C", RR: "LD", RA: "ED", KM: "PIV" }
};

export const CLUB_DEFENSE_GROUP_LABELS: Record<ClubLocale, Record<DefenseGroup, string>> = {
  de: { aussen: "Außen (1/6)", halb: "Halb (2/5)", innen: "Innenblock (3/4)" },
  en: { aussen: "Wide (1/6)", halb: "Half (2/5)", innen: "Centre block (3/4)" },
  fr: { aussen: "Extérieur (1/6)", halb: "Arrière (2/5)", innen: "Central (3/4)" },
  es: { aussen: "Exterior (1/6)", halb: "Lateral (2/5)", innen: "Central (3/4)" }
};

const defenseGroupNames: Record<ClubLocale, Record<DefenseGroup, string>> = {
  de: { aussen: "Außen", halb: "Halb", innen: "Innenblock" },
  en: { aussen: "Wide", halb: "Half", innen: "Centre block" },
  fr: { aussen: "Extérieur", halb: "Arrière", innen: "Central" },
  es: { aussen: "Exterior", halb: "Lateral", innen: "Central" }
};

export function defensePositionLabel(position: DefensePosition, locale: ClubLocale) {
  return `${position} · ${defenseGroupNames[locale][defenseGroupOf(position)]}`;
}

export const CLUB_NEED_TYPE_LABELS: Record<ClubLocale, Record<NeedType, string>> = {
  de: { spieler: "Spieler", trainer: "Trainer" },
  en: { spieler: "Player", trainer: "Coach" },
  fr: { spieler: "Joueur", trainer: "Entraîneur" },
  es: { spieler: "Jugador", trainer: "Entrenador" }
};

export const CLUB_COACH_ROLE_LABELS: Record<ClubLocale, Record<CoachRole, string>> = {
  de: {
    cheftrainer: "Cheftrainer",
    co_trainer: "Co-Trainer",
    torwarttrainer: "Torwarttrainer",
    athletiktrainer: "Athletiktrainer",
    jugendtrainer: "Jugendtrainer"
  },
  en: {
    cheftrainer: "Head coach",
    co_trainer: "Assistant coach",
    torwarttrainer: "Goalkeeper coach",
    athletiktrainer: "Athletic coach",
    jugendtrainer: "Youth coach"
  },
  fr: {
    cheftrainer: "Entraîneur principal",
    co_trainer: "Entraîneur adjoint",
    torwarttrainer: "Entraîneur des gardiens",
    athletiktrainer: "Préparateur physique",
    jugendtrainer: "Entraîneur des jeunes"
  },
  es: {
    cheftrainer: "Primer entrenador",
    co_trainer: "Segundo entrenador",
    torwarttrainer: "Entrenador de porteros",
    athletiktrainer: "Preparador físico",
    jugendtrainer: "Entrenador de cantera"
  }
};

export const CLUB_PLAYER_TYPE_LABELS: Record<ClubLocale, Record<PlayerType, string>> = {
  de: { eins_gegen_eins: "1-gegen-1-stark (Iso)", spielstark: "Spielstark", wurfstark: "Wurfstark", abwehrstark: "Abwehrstark" },
  en: { eins_gegen_eins: "Strong 1-on-1 (iso)", spielstark: "Playmaker", wurfstark: "Strong shooter", abwehrstark: "Strong defender" },
  fr: { eins_gegen_eins: "Fort en 1 contre 1", spielstark: "Créateur de jeu", wurfstark: "Bon tireur", abwehrstark: "Bon défenseur" },
  es: { eins_gegen_eins: "Fuerte en 1x1", spielstark: "Creador de juego", wurfstark: "Buen lanzador", abwehrstark: "Buen defensor" }
};

export const CLUB_TARGET_ROLE_LABELS: Record<ClubLocale, Record<TargetRole, string>> = {
  de: {
    fuehrungsrolle: "Führungsrolle",
    stammspieler: "Stammspieler",
    rotationsspieler: "Rotationsspieler",
    perspektivspieler: "Perspektivspieler"
  },
  en: {
    fuehrungsrolle: "Leadership role",
    stammspieler: "Starter",
    rotationsspieler: "Rotation player",
    perspektivspieler: "Prospect"
  },
  fr: {
    fuehrungsrolle: "Rôle de leader",
    stammspieler: "Titulaire",
    rotationsspieler: "Joueur de rotation",
    perspektivspieler: "Joueur à potentiel"
  },
  es: {
    fuehrungsrolle: "Rol de líder",
    stammspieler: "Titular",
    rotationsspieler: "Jugador de rotación",
    perspektivspieler: "Jugador con proyección"
  }
};

export const CLUB_CONTRACT_STATUS_SUGGESTIONS: Record<ClubLocale, readonly string[]> = {
  de: ["Vertragslos", "Vertrag läuft aus", "Unter Vertrag (Ablöse)", "Leihe"],
  en: ["Free agent", "Contract expiring", "Under contract (transfer fee)", "Loan"],
  fr: ["Libre", "Fin de contrat", "Sous contrat (indemnité)", "Prêt"],
  es: ["Libre", "Fin de contrato", "Con contrato (traspaso)", "Cesión"]
};

const languageDisplayLocales: Record<ClubLocale, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES" };

export function languageLabel(language: Language, locale: ClubLocale) {
  const name = new Intl.DisplayNames([languageDisplayLocales[locale]], { type: "language" }).of(language) ?? language;
  return name.charAt(0).toLocaleUpperCase(languageDisplayLocales[locale]) + name.slice(1);
}

export const CLUB_PRIORITY_LABELS: Record<ClubLocale, Record<Priority, string>> = {
  de: { hoch: "Hoch", mittel: "Mittel", niedrig: "Niedrig" },
  en: { hoch: "High", mittel: "Medium", niedrig: "Low" },
  fr: { hoch: "Haute", mittel: "Moyenne", niedrig: "Faible" },
  es: { hoch: "Alta", mittel: "Media", niedrig: "Baja" }
};

export const CLUB_STATUS_LABELS: Record<ClubLocale, Record<PlayerNeedStatus, string>> = {
  de: { offen: "Offen", in_gespraechen: "In Gesprächen", besetzt: "Besetzt", archiviert: "Archiviert" },
  en: { offen: "Open", in_gespraechen: "In talks", besetzt: "Filled", archiviert: "Archived" },
  fr: { offen: "Ouvert", in_gespraechen: "En discussion", besetzt: "Pourvu", archiviert: "Archivé" },
  es: { offen: "Abierto", in_gespraechen: "En conversaciones", besetzt: "Cubierto", archiviert: "Archivado" }
};
