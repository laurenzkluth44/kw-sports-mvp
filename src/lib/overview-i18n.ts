import type { ClubLocale } from "@/lib/club-i18n";

export type OverviewCopy = {
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  kpiHits: string;
  kpiOpen: string;
  kpiHigh: string;
  kpiAgencies: string;
  courtTitle: string;
  courtAll: string;
  courtAria: (position: string, count: number) => string;
  courtHint: string;
  search: string;
  searchPlaceholder: string;
  searchButton: string;
  moreFilters: string;
  activeFilters: (count: number) => string;
  reset: string;
  results: string;
  allPositions: string;
  positionFilter: (label: string) => string;
  cards: string;
  list: string;
  analysis: string;
  from: string;
  age: string;
  heightMin: string;
  updated: string;
  stale: string;
  coach: string;
  noResults: string;
  open: string;
};

export const overviewCopy: Record<ClubLocale, OverviewCopy> = {
  de: {
    heroTitle: "Wer sucht",
    heroAccent: "wen?",
    heroDescription: "Alle Kaderbedarfe der Vereine. Tippe auf eine Position im Spielfeld, um nur diese Bedarfe zu sehen.",
    kpiHits: "Bedarfe im Filter",
    kpiOpen: "Offen",
    kpiHigh: "Hohe Priorität",
    kpiAgencies: "Agenturen mit Zugriff",
    courtTitle: "Nachfrage nach Position",
    courtAll: "Alle",
    courtAria: (position, count) => `${position}: ${count} Bedarfe`,
    courtHint: "Zahl = Bedarfe im aktuellen Filter",
    search: "Verein suchen",
    searchPlaceholder: "Vereinsname",
    searchButton: "Suchen",
    moreFilters: "Weitere Filter",
    activeFilters: (count) => (count === 1 ? "1 aktiv" : `${count} aktiv`),
    reset: "Zurücksetzen",
    results: "Bedarfe",
    allPositions: "Alle Positionen · Spieler und Trainer",
    positionFilter: (label) => `Position: ${label}`,
    cards: "Karten",
    list: "Liste",
    analysis: "Auswertung",
    from: "ab",
    age: "Jahre",
    heightMin: "ab",
    updated: "aktualisiert",
    stale: "Bitte bestätigen",
    coach: "Trainer",
    noResults: "Keine Bedarfe für diese Filter.",
    open: "Bedarf öffnen"
  },
  en: {
    heroTitle: "Who needs",
    heroAccent: "whom?",
    heroDescription: "All squad needs from the clubs. Tap a position on the court to see only those needs.",
    kpiHits: "Needs in filter",
    kpiOpen: "Open",
    kpiHigh: "High priority",
    kpiAgencies: "Agencies with access",
    courtTitle: "Demand by position",
    courtAll: "All",
    courtAria: (position, count) => `${position}: ${count} needs`,
    courtHint: "Number = needs in the current filter",
    search: "Search club",
    searchPlaceholder: "Club name",
    searchButton: "Search",
    moreFilters: "More filters",
    activeFilters: (count) => `${count} active`,
    reset: "Reset",
    results: "Needs",
    allPositions: "All positions · players and coaches",
    positionFilter: (label) => `Position: ${label}`,
    cards: "Cards",
    list: "List",
    analysis: "Analysis",
    from: "from",
    age: "years",
    heightMin: "min.",
    updated: "updated",
    stale: "Needs confirming",
    coach: "Coach",
    noResults: "No needs match these filters.",
    open: "Open need"
  },
  fr: {
    heroTitle: "Qui cherche",
    heroAccent: "qui ?",
    heroDescription: "Tous les besoins d’effectif des clubs. Touche un poste sur le terrain pour ne voir que ces besoins.",
    kpiHits: "Besoins filtrés",
    kpiOpen: "Ouverts",
    kpiHigh: "Priorité haute",
    kpiAgencies: "Agences avec accès",
    courtTitle: "Demande par poste",
    courtAll: "Tous",
    courtAria: (position, count) => `${position} : ${count} besoins`,
    courtHint: "Chiffre = besoins du filtre actuel",
    search: "Chercher un club",
    searchPlaceholder: "Nom du club",
    searchButton: "Chercher",
    moreFilters: "Plus de filtres",
    activeFilters: (count) => `${count} actif${count === 1 ? "" : "s"}`,
    reset: "Réinitialiser",
    results: "Besoins",
    allPositions: "Tous les postes · joueurs et entraîneurs",
    positionFilter: (label) => `Poste : ${label}`,
    cards: "Cartes",
    list: "Liste",
    analysis: "Analyse",
    from: "dès le",
    age: "ans",
    heightMin: "min.",
    updated: "mis à jour",
    stale: "À confirmer",
    coach: "Entraîneur",
    noResults: "Aucun besoin pour ces filtres.",
    open: "Ouvrir le besoin"
  },
  es: {
    heroTitle: "¿Quién busca",
    heroAccent: "a quién?",
    heroDescription: "Todas las necesidades de plantilla de los clubes. Toca un puesto en la pista para ver solo esas necesidades.",
    kpiHits: "Necesidades en el filtro",
    kpiOpen: "Abiertas",
    kpiHigh: "Prioridad alta",
    kpiAgencies: "Agencias con acceso",
    courtTitle: "Demanda por puesto",
    courtAll: "Todos",
    courtAria: (position, count) => `${position}: ${count} necesidades`,
    courtHint: "Número = necesidades del filtro actual",
    search: "Buscar club",
    searchPlaceholder: "Nombre del club",
    searchButton: "Buscar",
    moreFilters: "Más filtros",
    activeFilters: (count) => `${count} activo${count === 1 ? "" : "s"}`,
    reset: "Restablecer",
    results: "Necesidades",
    allPositions: "Todos los puestos · jugadores y entrenadores",
    positionFilter: (label) => `Puesto: ${label}`,
    cards: "Tarjetas",
    list: "Lista",
    analysis: "Análisis",
    from: "desde",
    age: "años",
    heightMin: "mín.",
    updated: "actualizado",
    stale: "Por confirmar",
    coach: "Entrenador",
    noResults: "No hay necesidades para estos filtros.",
    open: "Abrir necesidad"
  }
};
