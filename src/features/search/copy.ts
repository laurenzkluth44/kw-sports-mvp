import type { ClubLocale } from "@/lib/club-i18n";
import type { SearchGroup } from "./model";

type PageEntry = { title: string; href: string; keywords?: string };

type SearchCopy = {
  button: string;
  placeholder: string;
  hint: string;
  empty: string;
  typeMore: string;
  close: string;
  groups: Record<SearchGroup, string>;
  positionFilter: string;
  seasonFilter: string;
  clubNeedsFilter: string;
  pages: { club: PageEntry[]; agency: PageEntry[] };
};

export const searchCopy: Record<ClubLocale, SearchCopy> = {
  de: {
    button: "Suchen",
    placeholder: "Spieler, Bedarf, Verein oder Seite suchen …",
    hint: "↑↓ auswählen · Enter öffnen · Esc schließen",
    empty: "Nichts gefunden. Anderer Name oder kürzerer Begriff?",
    typeMore: "Tippe einen Namen, eine Position wie „RR“ oder eine Saison wie „2027/28“.",
    close: "Schließen",
    groups: { filters: "Filter", players: "KW-Spieler", squad: "Kader", suggestions: "KW-Vorschläge", needs: "Bedarfe", clubs: "Vereine", users: "Nutzer", pages: "Seiten" },
    positionFilter: "Alle Bedarfe für Position {value}",
    seasonFilter: "Alle Bedarfe der Saison {value}",
    clubNeedsFilter: "Bedarfe von {value}",
    pages: {
      club: [
        { title: "Übersicht", href: "/club", keywords: "start cockpit home" },
        { title: "KW-Vorschläge", href: "/club/suggestions", keywords: "spieler vorschlag" },
        { title: "Kader", href: "/club/squad", keywords: "taktiktafel spieler" },
        { title: "Spieler hinzufügen", href: "/club/squad/new", keywords: "kader neu" },
        { title: "Kader aus Excel importieren", href: "/club/squad/import", keywords: "import liste" },
        { title: "Neuer Bedarf", href: "/club/needs/new", keywords: "bedarf anlegen suchen" },
        { title: "Hilfe & Anleitung", href: "/help", keywords: "anleitung erste schritte" }
      ],
      agency: [
        { title: "Bedarfe", href: "/agency", keywords: "übersicht liste" },
        { title: "Hilfe & Anleitung", href: "/help", keywords: "anleitung" }
      ]
    }
  },
  en: {
    button: "Search",
    placeholder: "Search players, needs, clubs or pages …",
    hint: "↑↓ select · Enter open · Esc close",
    empty: "Nothing found. Try another name or a shorter term.",
    typeMore: "Type a name, a position like “RR” or a season like “2027/28”.",
    close: "Close",
    groups: { filters: "Filters", players: "KW players", squad: "Squad", suggestions: "KW suggestions", needs: "Needs", clubs: "Clubs", users: "Users", pages: "Pages" },
    positionFilter: "All needs for position {value}",
    seasonFilter: "All needs for season {value}",
    clubNeedsFilter: "Needs of {value}",
    pages: {
      club: [
        { title: "Overview", href: "/club", keywords: "start cockpit home" },
        { title: "KW suggestions", href: "/club/suggestions", keywords: "players" },
        { title: "Squad", href: "/club/squad", keywords: "tactics board players" },
        { title: "Add player", href: "/club/squad/new", keywords: "squad new" },
        { title: "Import squad from Excel", href: "/club/squad/import", keywords: "import list" },
        { title: "New need", href: "/club/needs/new", keywords: "create need" },
        { title: "Help & guide", href: "/help", keywords: "getting started" }
      ],
      agency: [
        { title: "Needs", href: "/agency", keywords: "overview list" },
        { title: "Help & guide", href: "/help", keywords: "guide" }
      ]
    }
  },
  fr: {
    button: "Rechercher",
    placeholder: "Rechercher un joueur, un besoin, un club ou une page …",
    hint: "↑↓ choisir · Entrée ouvrir · Échap fermer",
    empty: "Aucun résultat. Essayez un autre nom ou un terme plus court.",
    typeMore: "Tapez un nom, un poste comme « RR » ou une saison comme « 2027/28 ».",
    close: "Fermer",
    groups: { filters: "Filtres", players: "Joueurs KW", squad: "Effectif", suggestions: "Propositions KW", needs: "Besoins", clubs: "Clubs", users: "Utilisateurs", pages: "Pages" },
    positionFilter: "Tous les besoins au poste {value}",
    seasonFilter: "Tous les besoins de la saison {value}",
    clubNeedsFilter: "Besoins de {value}",
    pages: {
      club: [
        { title: "Aperçu", href: "/club", keywords: "accueil" },
        { title: "Propositions KW", href: "/club/suggestions", keywords: "joueurs" },
        { title: "Effectif", href: "/club/squad", keywords: "tableau tactique joueurs" },
        { title: "Ajouter un joueur", href: "/club/squad/new", keywords: "effectif nouveau" },
        { title: "Importer l’effectif depuis Excel", href: "/club/squad/import", keywords: "import liste" },
        { title: "Nouveau besoin", href: "/club/needs/new", keywords: "créer besoin" },
        { title: "Aide & guide", href: "/help", keywords: "premiers pas" }
      ],
      agency: [
        { title: "Besoins", href: "/agency", keywords: "liste" },
        { title: "Aide & guide", href: "/help", keywords: "guide" }
      ]
    }
  },
  es: {
    button: "Buscar",
    placeholder: "Buscar jugador, necesidad, club o página …",
    hint: "↑↓ elegir · Intro abrir · Esc cerrar",
    empty: "Sin resultados. Prueba otro nombre o un término más corto.",
    typeMore: "Escribe un nombre, un puesto como «RR» o una temporada como «2027/28».",
    close: "Cerrar",
    groups: { filters: "Filtros", players: "Jugadores KW", squad: "Plantilla", suggestions: "Propuestas KW", needs: "Necesidades", clubs: "Clubes", users: "Usuarios", pages: "Páginas" },
    positionFilter: "Todas las necesidades para el puesto {value}",
    seasonFilter: "Todas las necesidades de la temporada {value}",
    clubNeedsFilter: "Necesidades de {value}",
    pages: {
      club: [
        { title: "Resumen", href: "/club", keywords: "inicio" },
        { title: "Propuestas KW", href: "/club/suggestions", keywords: "jugadores" },
        { title: "Plantilla", href: "/club/squad", keywords: "pizarra táctica jugadores" },
        { title: "Añadir jugador", href: "/club/squad/new", keywords: "plantilla nuevo" },
        { title: "Importar plantilla desde Excel", href: "/club/squad/import", keywords: "importar lista" },
        { title: "Nueva necesidad", href: "/club/needs/new", keywords: "crear necesidad" },
        { title: "Ayuda y guía", href: "/help", keywords: "primeros pasos" }
      ],
      agency: [
        { title: "Necesidades", href: "/agency", keywords: "lista" },
        { title: "Ayuda y guía", href: "/help", keywords: "guía" }
      ]
    }
  }
};

/** KW Sports admin area is German only. */
export const adminPages: PageEntry[] = [
  { title: "Bedarfe", href: "/admin", keywords: "übersicht arbeitsliste" },
  { title: "Neuer Bedarf", href: "/admin/needs/new", keywords: "bedarf anlegen" },
  { title: "Spielerdatenbank", href: "/admin/players", keywords: "spieler kw" },
  { title: "Spieler anlegen", href: "/admin/players/new", keywords: "neu" },
  { title: "CVs & Fotos hochladen", href: "/admin/players/upload", keywords: "upload lebenslauf bild" },
  { title: "Antworten der Vereine", href: "/admin/inbox", keywords: "inbox interesse" },
  { title: "Nutzer & Einladungen", href: "/admin/users", keywords: "einladen zugang verein agentur" },
  { title: "Go-Live-Check", href: "/admin/system", keywords: "system email test" },
  { title: "Hilfe & Anleitung", href: "/help", keywords: "anleitung" }
];
