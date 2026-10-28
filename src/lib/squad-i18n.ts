import type { ClubLocale } from "@/lib/club-i18n";

export type SquadCopy = {
  page: {
    eyebrow: string;
    title: string;
    description: string;
    privacy: string;
    addPlayer: string;
    players: string;
    expiring: string;
    gapsIn: (season: string) => string;
  };
  board: {
    title: string;
    subtitle: string;
    attack: string;
    defense: string;
    current: string;
    legendOk: string;
    legendThin: string;
    legendGap: string;
    flexibleHint: string;
    morePlayers: (count: number) => string;
  };
  gaps: {
    title: (season: string) => string;
    gap: string;
    thin: string;
    onlyFlexible: string;
    nobody: string;
    onePlayer: string;
    none: string;
    createNeed: string;
  };
  planning: {
    title: string;
    subtitle: string;
    position: string;
  };
  list: {
    title: string;
    emptyGroup: string;
    addHere: string;
    contractUntil: string;
    expiring: string;
    expired: string;
    edit: string;
    also: string;
    defense: string;
    emptyTitle: string;
    emptyBody: string;
  };
  form: {
    newTitle: string;
    newDescription: string;
    editTitle: string;
    editDescription: string;
    person: string;
    firstName: string;
    lastName: string;
    jersey: string;
    positions: string;
    mainPosition: string;
    secondaryPositions: string;
    secondaryHelp: string;
    defensePositions: string;
    defenseHelp: string;
    contract: string;
    contractUntil: string;
    contractHelp: string;
    contractOption: (season: string, date: string) => string;
    notes: string;
    notesPlaceholder: string;
    create: string;
    save: string;
    saving: string;
    cancel: string;
    saveError: string;
    deleteTitle: string;
    deleteBody: string;
    deleteButton: string;
    deleteError: string;
  };
  flash: {
    created: string;
    saved: string;
    deleted: string;
  };
  teaser: {
    title: string;
    body: (players: number, gaps: number, season: string) => string;
    empty: string;
    open: string;
  };
};

export const squadCopy: Record<ClubLocale, SquadCopy> = {
  de: {
    page: {
      eyebrow: "Interner Kader",
      title: "Kader",
      description: "Wer steht wann unter Vertrag – und wo entstehen Lücken?",
      privacy: "Nur für deinen Verein sichtbar. KW Sports und Agenturen sehen deinen Kader nicht.",
      addPlayer: "Spieler hinzufügen",
      players: "Spieler",
      expiring: "Verträge laufen aus",
      gapsIn: (season) => `Offene Positionen ${season}`
    },
    board: {
      title: "Taktiktafel",
      subtitle: "Spieler unter Vertrag in der gewählten Saison.",
      attack: "Angriff",
      defense: "Abwehr 6:0",
      current: "aktuell",
      legendOk: "Besetzt (2+)",
      legendThin: "Dünn (1)",
      legendGap: "Lücke",
      flexibleHint: "+ = kann aushelfen",
      morePlayers: (count) => `+${count} weitere`
    },
    gaps: {
      title: (season) => `Handlungsbedarf ${season}`,
      gap: "Lücke",
      thin: "Dünn",
      onlyFlexible: "nur Aushilfe",
      nobody: "kein Spieler",
      onePlayer: "1 Spieler",
      none: "Alle Positionen sind mindestens doppelt besetzt.",
      createNeed: "Bedarf anlegen"
    },
    planning: {
      title: "Saisonplanung",
      subtitle: "Spieler unter Vertrag je Position und Saison.",
      position: "Position"
    },
    list: {
      title: "Spieler",
      emptyGroup: "Noch kein Spieler auf dieser Position.",
      addHere: "Hinzufügen",
      contractUntil: "Vertrag bis",
      expiring: "Läuft aus",
      expired: "Abgelaufen",
      edit: "Bearbeiten",
      also: "Auch",
      defense: "Abwehr",
      emptyTitle: "Noch keine Spieler",
      emptyBody: "Name, Position und Vertragsende reichen. Danach siehst du sofort, wo in den nächsten Saisons Lücken entstehen."
    },
    form: {
      newTitle: "Spieler hinzufügen",
      newDescription: "Name, Hauptposition und Vertragsende genügen.",
      editTitle: "Spieler bearbeiten",
      editDescription: "Änderungen sind sofort in Taktiktafel und Saisonplanung sichtbar.",
      person: "Spieler",
      firstName: "Vorname",
      lastName: "Nachname",
      jersey: "Rückennummer",
      positions: "Positionen",
      mainPosition: "Hauptposition",
      secondaryPositions: "Kann auch spielen",
      secondaryHelp: "Optional. Positionen, auf denen der Spieler aushelfen kann.",
      defensePositions: "Abwehrpositionen (6:0)",
      defenseHelp: "Optional. 1/6 Außen · 2/5 Halb · 3/4 Innenblock",
      contract: "Vertrag",
      contractUntil: "Vertrag bis",
      contractHelp: "Verträge enden zum 30.06. am Ende der Saison.",
      contractOption: (season, date) => `Saisonende ${season} (${date})`,
      notes: "Notizen",
      notesPlaceholder: "Optional, nur für deinen Verein.",
      create: "Spieler anlegen",
      save: "Änderungen speichern",
      saving: "Wird gespeichert...",
      cancel: "Abbrechen",
      saveError: "Speichern fehlgeschlagen. Bitte Name, Position und Vertragsende prüfen.",
      deleteTitle: "Spieler entfernen",
      deleteBody: "Der Spieler wird endgültig aus deinem Kader gelöscht.",
      deleteButton: "Endgültig entfernen",
      deleteError: "Spieler konnte nicht entfernt werden."
    },
    flash: {
      created: "Spieler wurde hinzugefügt.",
      saved: "Änderungen gespeichert.",
      deleted: "Spieler wurde entfernt."
    },
    teaser: {
      title: "Kader",
      body: (players, gaps, season) =>
        `${players} Spieler · ${gaps === 0 ? "keine offenen Positionen" : `${gaps} offene Position${gaps === 1 ? "" : "en"}`} in ${season}`,
      empty: "Lege deinen Kader an und sieh sofort, wo Lücken entstehen.",
      open: "Kader öffnen"
    }
  },
  en: {
    page: {
      eyebrow: "Internal squad",
      title: "Squad",
      description: "Who is under contract when – and where will gaps open up?",
      privacy: "Visible to your club only. KW Sports and agencies cannot see your squad.",
      addPlayer: "Add player",
      players: "Players",
      expiring: "Contracts expiring",
      gapsIn: (season) => `Open positions ${season}`
    },
    board: {
      title: "Tactics board",
      subtitle: "Players under contract in the selected season.",
      attack: "Attack",
      defense: "Defence 6:0",
      current: "current",
      legendOk: "Covered (2+)",
      legendThin: "Thin (1)",
      legendGap: "Gap",
      flexibleHint: "+ = can cover",
      morePlayers: (count) => `+${count} more`
    },
    gaps: {
      title: (season) => `Action needed ${season}`,
      gap: "Gap",
      thin: "Thin",
      onlyFlexible: "cover only",
      nobody: "no player",
      onePlayer: "1 player",
      none: "Every position is covered at least twice.",
      createNeed: "Create need"
    },
    planning: {
      title: "Season planning",
      subtitle: "Players under contract per position and season.",
      position: "Position"
    },
    list: {
      title: "Players",
      emptyGroup: "No player in this position yet.",
      addHere: "Add",
      contractUntil: "Contract until",
      expiring: "Expiring",
      expired: "Expired",
      edit: "Edit",
      also: "Also",
      defense: "Defence",
      emptyTitle: "No players yet",
      emptyBody: "Name, position and contract end are enough. You will immediately see where gaps open up in the coming seasons."
    },
    form: {
      newTitle: "Add player",
      newDescription: "Name, main position and contract end are enough.",
      editTitle: "Edit player",
      editDescription: "Changes show up immediately on the tactics board and in season planning.",
      person: "Player",
      firstName: "First name",
      lastName: "Last name",
      jersey: "Shirt number",
      positions: "Positions",
      mainPosition: "Main position",
      secondaryPositions: "Can also play",
      secondaryHelp: "Optional. Positions the player can cover.",
      defensePositions: "Defensive positions (6:0)",
      defenseHelp: "Optional. 1/6 wide · 2/5 half · 3/4 centre block",
      contract: "Contract",
      contractUntil: "Contract until",
      contractHelp: "Contracts end on 30 June at the end of the season.",
      contractOption: (season, date) => `End of season ${season} (${date})`,
      notes: "Notes",
      notesPlaceholder: "Optional, for your club only.",
      create: "Add player",
      save: "Save changes",
      saving: "Saving...",
      cancel: "Cancel",
      saveError: "Could not save. Please check name, position and contract end.",
      deleteTitle: "Remove player",
      deleteBody: "The player will be permanently deleted from your squad.",
      deleteButton: "Remove permanently",
      deleteError: "Player could not be removed."
    },
    flash: {
      created: "Player added.",
      saved: "Changes saved.",
      deleted: "Player removed."
    },
    teaser: {
      title: "Squad",
      body: (players, gaps, season) =>
        `${players} players · ${gaps === 0 ? "no open positions" : `${gaps} open position${gaps === 1 ? "" : "s"}`} in ${season}`,
      empty: "Add your squad and see right away where gaps open up.",
      open: "Open squad"
    }
  },
  fr: {
    page: {
      eyebrow: "Effectif interne",
      title: "Effectif",
      description: "Qui est sous contrat et quand – et où des postes se libèrent-ils ?",
      privacy: "Visible uniquement par ton club. KW Sports et les agences ne voient pas ton effectif.",
      addPlayer: "Ajouter un joueur",
      players: "Joueurs",
      expiring: "Contrats en fin",
      gapsIn: (season) => `Postes ouverts ${season}`
    },
    board: {
      title: "Tableau tactique",
      subtitle: "Joueurs sous contrat pour la saison choisie.",
      attack: "Attaque",
      defense: "Défense 6:0",
      current: "en cours",
      legendOk: "Couvert (2+)",
      legendThin: "Juste (1)",
      legendGap: "Manque",
      flexibleHint: "+ = peut dépanner",
      morePlayers: (count) => `+${count} autres`
    },
    gaps: {
      title: (season) => `À traiter ${season}`,
      gap: "Manque",
      thin: "Juste",
      onlyFlexible: "dépannage seul",
      nobody: "aucun joueur",
      onePlayer: "1 joueur",
      none: "Chaque poste est doublé au minimum.",
      createNeed: "Créer un besoin"
    },
    planning: {
      title: "Planification",
      subtitle: "Joueurs sous contrat par poste et par saison.",
      position: "Poste"
    },
    list: {
      title: "Joueurs",
      emptyGroup: "Aucun joueur à ce poste pour l’instant.",
      addHere: "Ajouter",
      contractUntil: "Contrat jusqu’au",
      expiring: "Fin de contrat",
      expired: "Expiré",
      edit: "Modifier",
      also: "Aussi",
      defense: "Défense",
      emptyTitle: "Aucun joueur",
      emptyBody: "Nom, poste et fin de contrat suffisent. Tu verras aussitôt où des manques apparaissent les prochaines saisons."
    },
    form: {
      newTitle: "Ajouter un joueur",
      newDescription: "Nom, poste principal et fin de contrat suffisent.",
      editTitle: "Modifier le joueur",
      editDescription: "Les changements apparaissent aussitôt sur le tableau tactique et dans la planification.",
      person: "Joueur",
      firstName: "Prénom",
      lastName: "Nom",
      jersey: "Numéro",
      positions: "Postes",
      mainPosition: "Poste principal",
      secondaryPositions: "Peut aussi jouer",
      secondaryHelp: "Facultatif. Postes où le joueur peut dépanner.",
      defensePositions: "Postes en défense (6:0)",
      defenseHelp: "Facultatif. 1/6 extérieur · 2/5 arrière · 3/4 central",
      contract: "Contrat",
      contractUntil: "Contrat jusqu’au",
      contractHelp: "Les contrats se terminent le 30 juin, en fin de saison.",
      contractOption: (season, date) => `Fin de saison ${season} (${date})`,
      notes: "Notes",
      notesPlaceholder: "Facultatif, visible par ton club uniquement.",
      create: "Ajouter le joueur",
      save: "Enregistrer",
      saving: "Enregistrement...",
      cancel: "Annuler",
      saveError: "Échec de l’enregistrement. Vérifie le nom, le poste et la fin de contrat.",
      deleteTitle: "Retirer le joueur",
      deleteBody: "Le joueur sera définitivement supprimé de ton effectif.",
      deleteButton: "Supprimer définitivement",
      deleteError: "Le joueur n’a pas pu être retiré."
    },
    flash: {
      created: "Joueur ajouté.",
      saved: "Modifications enregistrées.",
      deleted: "Joueur retiré."
    },
    teaser: {
      title: "Effectif",
      body: (players, gaps, season) =>
        `${players} joueurs · ${gaps === 0 ? "aucun poste ouvert" : `${gaps} poste${gaps === 1 ? "" : "s"} ouvert${gaps === 1 ? "" : "s"}`} en ${season}`,
      empty: "Saisis ton effectif et vois aussitôt où des manques apparaissent.",
      open: "Ouvrir l’effectif"
    }
  },
  es: {
    page: {
      eyebrow: "Plantilla interna",
      title: "Plantilla",
      description: "Quién tiene contrato y hasta cuándo – ¿y dónde quedarán huecos?",
      privacy: "Solo visible para tu club. KW Sports y las agencias no ven tu plantilla.",
      addPlayer: "Añadir jugador",
      players: "Jugadores",
      expiring: "Contratos que vencen",
      gapsIn: (season) => `Puestos abiertos ${season}`
    },
    board: {
      title: "Pizarra táctica",
      subtitle: "Jugadores con contrato en la temporada elegida.",
      attack: "Ataque",
      defense: "Defensa 6:0",
      current: "actual",
      legendOk: "Cubierto (2+)",
      legendThin: "Justo (1)",
      legendGap: "Hueco",
      flexibleHint: "+ = puede cubrir",
      morePlayers: (count) => `+${count} más`
    },
    gaps: {
      title: (season) => `Por resolver ${season}`,
      gap: "Hueco",
      thin: "Justo",
      onlyFlexible: "solo cobertura",
      nobody: "ningún jugador",
      onePlayer: "1 jugador",
      none: "Todos los puestos están cubiertos al menos dos veces.",
      createNeed: "Crear necesidad"
    },
    planning: {
      title: "Planificación",
      subtitle: "Jugadores con contrato por puesto y temporada.",
      position: "Puesto"
    },
    list: {
      title: "Jugadores",
      emptyGroup: "Aún no hay jugadores en este puesto.",
      addHere: "Añadir",
      contractUntil: "Contrato hasta",
      expiring: "Vence",
      expired: "Vencido",
      edit: "Editar",
      also: "También",
      defense: "Defensa",
      emptyTitle: "Aún no hay jugadores",
      emptyBody: "Basta con nombre, puesto y fin de contrato. Verás al momento dónde quedarán huecos en las próximas temporadas."
    },
    form: {
      newTitle: "Añadir jugador",
      newDescription: "Basta con nombre, puesto principal y fin de contrato.",
      editTitle: "Editar jugador",
      editDescription: "Los cambios se ven al momento en la pizarra táctica y en la planificación.",
      person: "Jugador",
      firstName: "Nombre",
      lastName: "Apellido",
      jersey: "Dorsal",
      positions: "Puestos",
      mainPosition: "Puesto principal",
      secondaryPositions: "También puede jugar",
      secondaryHelp: "Opcional. Puestos en los que el jugador puede cubrir.",
      defensePositions: "Puestos en defensa (6:0)",
      defenseHelp: "Opcional. 1/6 exterior · 2/5 lateral · 3/4 central",
      contract: "Contrato",
      contractUntil: "Contrato hasta",
      contractHelp: "Los contratos terminan el 30 de junio, al final de la temporada.",
      contractOption: (season, date) => `Fin de temporada ${season} (${date})`,
      notes: "Notas",
      notesPlaceholder: "Opcional, solo para tu club.",
      create: "Añadir jugador",
      save: "Guardar cambios",
      saving: "Guardando...",
      cancel: "Cancelar",
      saveError: "No se pudo guardar. Revisa nombre, puesto y fin de contrato.",
      deleteTitle: "Quitar jugador",
      deleteBody: "El jugador se eliminará definitivamente de tu plantilla.",
      deleteButton: "Eliminar definitivamente",
      deleteError: "No se pudo quitar al jugador."
    },
    flash: {
      created: "Jugador añadido.",
      saved: "Cambios guardados.",
      deleted: "Jugador eliminado."
    },
    teaser: {
      title: "Plantilla",
      body: (players, gaps, season) =>
        `${players} jugadores · ${gaps === 0 ? "sin puestos abiertos" : `${gaps} puesto${gaps === 1 ? "" : "s"} abierto${gaps === 1 ? "" : "s"}`} en ${season}`,
      empty: "Crea tu plantilla y ve al momento dónde quedarán huecos.",
      open: "Abrir plantilla"
    }
  }
};
