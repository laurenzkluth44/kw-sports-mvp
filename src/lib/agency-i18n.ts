import type { ClubLocale } from "@/lib/club-i18n";
import type { Country } from "@/types/domain";

type AgencyCopy = {
  app: {
    navNeeds: string;
    tagline: string;
    role: string;
    logout: string;
    language: string;
  };
  dashboard: {
    title: string;
    description: string;
    readOnly: string;
    metrics: {
      hits: { label: string; caption: string };
      open: { label: string; caption: string };
      highPriority: { label: string; caption: string };
    };
    filters: {
      title: string;
      subtitle: string;
      resultCount: string;
      club: string;
      clubPlaceholder: string;
      country: string;
      league: string;
      season: string;
      position: string;
      status: string;
      priority: string;
      all: string;
      submit: string;
      reset: string;
    };
    table: {
      club: string;
      league: string;
      position: string;
      season: string;
      status: string;
      detail: string;
      noResults: string;
      neededFrom: string;
      openNeed: string;
    };
    quickFilters: {
      title: string;
      subtitle: string;
      all: string;
      open: string;
      highPriority: string;
      season2026: string;
      bundesliga: string;
      filled: string;
    };
    inbox: {
      title: string;
      subtitle: string;
      empty: string;
      updated: string;
    };
    countries: Record<Country, string>;
  };
  visualSummary: {
    title: string;
    subtitle: string;
    positions: string;
    positionsSubtitle: string;
    leagues: string;
    leaguesSubtitle: string;
    priority: string;
    prioritySubtitle: string;
    noData: string;
    noPositions: string;
    noLeagues: string;
    noPriorities: string;
    needs: string;
    topSeason: string;
    topStatus: string;
    new30Days: string;
    clubsWithNeeds: string;
    stale: string;
  };
  detail: {
    back: string;
    readOnlyAlert: string;
    club: string;
    country: string;
    league: string;
    city: string;
    position: string;
    season: string;
    status: string;
    priority: string;
    neededFrom: string;
    budget: string;
    closedAt: string;
    profile: string;
    description: string;
    age: string;
    heightMin: string;
    nationality: string;
    leagueExperience: string;
    playerType: string;
    contractStatus: string;
    statusNote: string;
    budgetNote: string;
    rangeFrom: string;
    rangeTo: string;
  };
};

export const agencyCopy: Record<ClubLocale, AgencyCopy> = {
  de: {
    app: {
      navNeeds: "Bedarfe",
      tagline: "Agency Access",
      role: "Agency User",
      logout: "Logout",
      language: "Sprache"
    },
    dashboard: {
      title: "Kaderbedarfe",
      description: "Read-only Zugriff auf alle gesuchten Spielerprofile und Bedarfsdetails.",
      readOnly: "Nur Ansicht",
      metrics: {
        hits: { label: "Treffer", caption: "Bedarfe im aktuellen Filter" },
        open: { label: "Offen", caption: "Aktuell nicht besetzt" },
        highPriority: { label: "Hohe Priorität", caption: "Direkter Bedarf" }
      },
      filters: {
        title: "Filter",
        subtitle: "Schnell finden, welche Vereine nach Position, Liga oder Saison suchen.",
        resultCount: "Treffer",
        club: "Verein",
        clubPlaceholder: "Vereinsname",
        country: "Land",
        league: "Liga",
        season: "Saison",
        position: "Position",
        status: "Status",
        priority: "Priorität",
        all: "Alle",
        submit: "Filtern",
        reset: "Zurücksetzen"
      },
      table: {
        club: "Verein",
        league: "Liga",
        position: "Position",
        season: "Saison",
        status: "Status",
        detail: "Detail",
        noResults: "Keine Bedarfe für diese Filter.",
        neededFrom: "benötigt ab",
        openNeed: "Bedarf öffnen"
      },
      quickFilters: {
        title: "Schnellfilter",
        subtitle: "Häufige Sichten ohne Umweg öffnen.",
        all: "Alle",
        open: "Offen",
        highPriority: "Hohe Priorität",
        season2026: "2026/27",
        bundesliga: "1. Bundesliga",
        filled: "Besetzt"
      },
      inbox: {
        title: "Needs Inbox",
        subtitle: "Zuletzt angelegte oder aktualisierte Bedarfe.",
        empty: "Keine aktuellen Änderungen.",
        updated: "aktualisiert"
      },
      countries: {
        Deutschland: "Deutschland",
        Frankreich: "Frankreich",
        Dänemark: "Dänemark",
        Spanien: "Spanien",
        Schweiz: "Schweiz"
      }
    },
    visualSummary: {
      title: "Visual Summary",
      subtitle: "Die wichtigsten Muster im aktuellen Filter auf einen Blick.",
      positions: "Positionen",
      positionsSubtitle: "Gesuchte Positionen im aktuellen Filter",
      leagues: "Ligen",
      leaguesSubtitle: "Verteilung der Bedarfe nach Liga",
      priority: "Priorität",
      prioritySubtitle: "Dringlichkeit der Suchaufträge",
      noData: "Keine Daten",
      noPositions: "Keine Positionen im aktuellen Filter.",
      noLeagues: "Keine Liga-Daten im aktuellen Filter.",
      noPriorities: "Keine Prioritäten im aktuellen Filter.",
      needs: "Bedarfe",
      topSeason: "Top Saison",
      topStatus: "Top Status",
      new30Days: "Neue Bedarfe 30T",
      clubsWithNeeds: "Vereine mit Bedarf",
      stale: "Bitte aktualisieren"
    },
    detail: {
      back: "Zur Übersicht",
      readOnlyAlert: "Agency-Zugriff ist nur lesend. Änderungen, Notizen, Exporte und Nutzerverwaltung bleiben KW Sports Admins vorbehalten.",
      club: "Verein",
      country: "Land",
      league: "Liga",
      city: "Stadt",
      position: "Position",
      season: "Saison",
      status: "Status",
      priority: "Priorität",
      neededFrom: "Benötigt ab",
      budget: "Budget",
      closedAt: "Abgeschlossen am",
      profile: "Profil",
      description: "Beschreibung",
      age: "Alter",
      heightMin: "Größe min.",
      nationality: "Nationalität",
      leagueExperience: "Liga-Erfahrung",
      playerType: "Spielertyp",
      contractStatus: "Vertragsstatus",
      statusNote: "Statusnotiz",
      budgetNote: "Budgetnotiz",
      rangeFrom: "ab",
      rangeTo: "bis"
    }
  },
  en: {
    app: {
      navNeeds: "Needs",
      tagline: "Agency access",
      role: "Agency user",
      logout: "Log out",
      language: "Language"
    },
    dashboard: {
      title: "Roster needs",
      description: "Read-only access to all requested player profiles and need details.",
      readOnly: "View only",
      metrics: {
        hits: { label: "Results", caption: "Needs in the current filter" },
        open: { label: "Open", caption: "Currently unfilled" },
        highPriority: { label: "High priority", caption: "Immediate need" }
      },
      filters: {
        title: "Filters",
        subtitle: "Quickly find which clubs are searching by position, league or season.",
        resultCount: "results",
        club: "Club",
        clubPlaceholder: "Club name",
        country: "Country",
        league: "League",
        season: "Season",
        position: "Position",
        status: "Status",
        priority: "Priority",
        all: "All",
        submit: "Filter",
        reset: "Reset"
      },
      table: {
        club: "Club",
        league: "League",
        position: "Position",
        season: "Season",
        status: "Status",
        detail: "Detail",
        noResults: "No needs match these filters.",
        neededFrom: "needed from",
        openNeed: "Open need"
      },
      quickFilters: {
        title: "Quick filters",
        subtitle: "Open frequent views directly.",
        all: "All",
        open: "Open",
        highPriority: "High priority",
        season2026: "2026/27",
        bundesliga: "1. Bundesliga",
        filled: "Filled"
      },
      inbox: {
        title: "Needs inbox",
        subtitle: "Recently created or updated needs.",
        empty: "No recent updates.",
        updated: "updated"
      },
      countries: {
        Deutschland: "Germany",
        Frankreich: "France",
        Dänemark: "Denmark",
        Spanien: "Spain",
        Schweiz: "Switzerland"
      }
    },
    visualSummary: {
      title: "Visual summary",
      subtitle: "The key patterns in the current filter at a glance.",
      positions: "Positions",
      positionsSubtitle: "Requested positions in the current filter",
      leagues: "Leagues",
      leaguesSubtitle: "Needs by league",
      priority: "Priority",
      prioritySubtitle: "Urgency of the searches",
      noData: "No data",
      noPositions: "No positions in the current filter.",
      noLeagues: "No league data in the current filter.",
      noPriorities: "No priorities in the current filter.",
      needs: "Needs",
      topSeason: "Top season",
      topStatus: "Top status",
      new30Days: "New needs 30d",
      clubsWithNeeds: "Clubs with needs",
      stale: "Needs update"
    },
    detail: {
      back: "Back to overview",
      readOnlyAlert: "Agency access is read-only. Changes, notes, exports and user management remain reserved for KW Sports admins.",
      club: "Club",
      country: "Country",
      league: "League",
      city: "City",
      position: "Position",
      season: "Season",
      status: "Status",
      priority: "Priority",
      neededFrom: "Needed from",
      budget: "Budget",
      closedAt: "Closed on",
      profile: "Profile",
      description: "Description",
      age: "Age",
      heightMin: "Min. height",
      nationality: "Nationality",
      leagueExperience: "League experience",
      playerType: "Player type",
      contractStatus: "Contract status",
      statusNote: "Status note",
      budgetNote: "Budget note",
      rangeFrom: "from",
      rangeTo: "up to"
    }
  },
  fr: {
    app: {
      navNeeds: "Besoins",
      tagline: "Accès agency",
      role: "Utilisateur agency",
      logout: "Déconnexion",
      language: "Langue"
    },
    dashboard: {
      title: "Besoins d'effectif",
      description: "Accès en lecture seule à tous les profils recherchés et aux détails des besoins.",
      readOnly: "Lecture seule",
      metrics: {
        hits: { label: "Résultats", caption: "Besoins dans le filtre actuel" },
        open: { label: "Ouverts", caption: "Actuellement non pourvus" },
        highPriority: { label: "Priorité haute", caption: "Besoin immédiat" }
      },
      filters: {
        title: "Filtres",
        subtitle: "Trouvez rapidement les clubs qui cherchent par poste, championnat ou saison.",
        resultCount: "résultats",
        club: "Club",
        clubPlaceholder: "Nom du club",
        country: "Pays",
        league: "Championnat",
        season: "Saison",
        position: "Poste",
        status: "Statut",
        priority: "Priorité",
        all: "Tous",
        submit: "Filtrer",
        reset: "Réinitialiser"
      },
      table: {
        club: "Club",
        league: "Championnat",
        position: "Poste",
        season: "Saison",
        status: "Statut",
        detail: "Détail",
        noResults: "Aucun besoin pour ces filtres.",
        neededFrom: "disponible à partir du",
        openNeed: "Ouvrir le besoin"
      },
      quickFilters: {
        title: "Filtres rapides",
        subtitle: "Ouvrir directement les vues fréquentes.",
        all: "Tous",
        open: "Ouverts",
        highPriority: "Priorité haute",
        season2026: "2026/27",
        bundesliga: "1. Bundesliga",
        filled: "Pourvus"
      },
      inbox: {
        title: "Boîte des besoins",
        subtitle: "Besoins récemment créés ou mis à jour.",
        empty: "Aucune mise à jour récente.",
        updated: "mis à jour"
      },
      countries: {
        Deutschland: "Allemagne",
        Frankreich: "France",
        Dänemark: "Danemark",
        Spanien: "Espagne",
        Schweiz: "Suisse"
      }
    },
    visualSummary: {
      title: "Résumé visuel",
      subtitle: "Les principaux motifs du filtre actuel en un coup d'oeil.",
      positions: "Postes",
      positionsSubtitle: "Postes recherchés dans le filtre actuel",
      leagues: "Championnats",
      leaguesSubtitle: "Répartition des besoins par championnat",
      priority: "Priorité",
      prioritySubtitle: "Urgence des recherches",
      noData: "Aucune donnée",
      noPositions: "Aucun poste dans le filtre actuel.",
      noLeagues: "Aucune donnée de championnat dans le filtre actuel.",
      noPriorities: "Aucune priorité dans le filtre actuel.",
      needs: "Besoins",
      topSeason: "Saison principale",
      topStatus: "Statut principal",
      new30Days: "Nouveaux besoins 30 j",
      clubsWithNeeds: "Clubs avec besoins",
      stale: "À actualiser"
    },
    detail: {
      back: "Retour à l'aperçu",
      readOnlyAlert: "L'accès agency est en lecture seule. Les modifications, notes, exports et la gestion des utilisateurs restent réservés aux admins KW Sports.",
      club: "Club",
      country: "Pays",
      league: "Championnat",
      city: "Ville",
      position: "Poste",
      season: "Saison",
      status: "Statut",
      priority: "Priorité",
      neededFrom: "Disponible à partir du",
      budget: "Budget",
      closedAt: "Clôturé le",
      profile: "Profil",
      description: "Description",
      age: "Âge",
      heightMin: "Taille min.",
      nationality: "Nationalité",
      leagueExperience: "Expérience de championnat",
      playerType: "Profil de joueur",
      contractStatus: "Situation contractuelle",
      statusNote: "Note de statut",
      budgetNote: "Note budget",
      rangeFrom: "à partir de",
      rangeTo: "jusqu'à"
    }
  },
  es: {
    app: {
      navNeeds: "Necesidades",
      tagline: "Acceso agency",
      role: "Usuario agency",
      logout: "Cerrar sesión",
      language: "Idioma"
    },
    dashboard: {
      title: "Necesidades de plantilla",
      description: "Acceso de solo lectura a todos los perfiles buscados y detalles de necesidades.",
      readOnly: "Solo lectura",
      metrics: {
        hits: { label: "Resultados", caption: "Necesidades en el filtro actual" },
        open: { label: "Abiertas", caption: "Actualmente sin cubrir" },
        highPriority: { label: "Prioridad alta", caption: "Necesidad inmediata" }
      },
      filters: {
        title: "Filtros",
        subtitle: "Encuentra rápido qué clubes buscan por puesto, liga o temporada.",
        resultCount: "resultados",
        club: "Club",
        clubPlaceholder: "Nombre del club",
        country: "País",
        league: "Liga",
        season: "Temporada",
        position: "Puesto",
        status: "Estado",
        priority: "Prioridad",
        all: "Todos",
        submit: "Filtrar",
        reset: "Restablecer"
      },
      table: {
        club: "Club",
        league: "Liga",
        position: "Puesto",
        season: "Temporada",
        status: "Estado",
        detail: "Detalle",
        noResults: "No hay necesidades para estos filtros.",
        neededFrom: "necesario desde",
        openNeed: "Abrir necesidad"
      },
      quickFilters: {
        title: "Filtros rápidos",
        subtitle: "Abrir vistas frecuentes directamente.",
        all: "Todos",
        open: "Abiertas",
        highPriority: "Prioridad alta",
        season2026: "2026/27",
        bundesliga: "1. Bundesliga",
        filled: "Cubiertas"
      },
      inbox: {
        title: "Bandeja de necesidades",
        subtitle: "Necesidades creadas o actualizadas recientemente.",
        empty: "Sin actualizaciones recientes.",
        updated: "actualizado"
      },
      countries: {
        Deutschland: "Alemania",
        Frankreich: "Francia",
        Dänemark: "Dinamarca",
        Spanien: "España",
        Schweiz: "Suiza"
      }
    },
    visualSummary: {
      title: "Resumen visual",
      subtitle: "Los patrones clave del filtro actual de un vistazo.",
      positions: "Puestos",
      positionsSubtitle: "Puestos buscados en el filtro actual",
      leagues: "Ligas",
      leaguesSubtitle: "Distribución de necesidades por liga",
      priority: "Prioridad",
      prioritySubtitle: "Urgencia de las búsquedas",
      noData: "Sin datos",
      noPositions: "No hay puestos en el filtro actual.",
      noLeagues: "No hay datos de liga en el filtro actual.",
      noPriorities: "No hay prioridades en el filtro actual.",
      needs: "Necesidades",
      topSeason: "Temporada principal",
      topStatus: "Estado principal",
      new30Days: "Nuevas 30d",
      clubsWithNeeds: "Clubes con necesidades",
      stale: "Actualizar"
    },
    detail: {
      back: "Volver al resumen",
      readOnlyAlert: "El acceso agency es de solo lectura. Cambios, notas, exportaciones y gestión de usuarios quedan reservados a admins de KW Sports.",
      club: "Club",
      country: "País",
      league: "Liga",
      city: "Ciudad",
      position: "Puesto",
      season: "Temporada",
      status: "Estado",
      priority: "Prioridad",
      neededFrom: "Necesario desde",
      budget: "Presupuesto",
      closedAt: "Cerrado el",
      profile: "Perfil",
      description: "Descripción",
      age: "Edad",
      heightMin: "Altura mín.",
      nationality: "Nacionalidad",
      leagueExperience: "Experiencia en liga",
      playerType: "Tipo de jugador",
      contractStatus: "Situación contractual",
      statusNote: "Nota de estado",
      budgetNote: "Nota de presupuesto",
      rangeFrom: "desde",
      rangeTo: "hasta"
    }
  }
};
