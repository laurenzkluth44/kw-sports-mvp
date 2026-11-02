import type { ClubLocale } from "@/lib/club-i18n";
import type { NeedFillSource, PlayerNeedStatus } from "@/types/domain";

/** The club's own need page and need cards. Plain strings with {n}, safe for client components. */
type ClubNeedCopy = {
  edit: string;
  duplicate: string;
  confirm: string;
  confirmHint: string;
  statusTitle: string;
  statusHint: string;
  statusHelp: Record<PlayerNeedStatus, string>;
  suggestionsTitle: string;
  suggestionsIntro: string;
  suggestionsEmpty: string;
  suggestionsClosed: string;
  allSuggestions: string;
  confidential: string;
  confidentialHint: string;
  newCount: string;
  newCountOne: string;
  suggestionCount: string;
  suggestionCountOne: string;
  stale: string;
  addNeed: string;
  addNeedHint: string;
  closedTitle: string;
  filledQuestion: string;
  filledChange: string;
  filledVia: Record<NeedFillSource, string>;
};

export const clubNeedCopy: Record<ClubLocale, ClubNeedCopy> = {
  de: {
    edit: "Bearbeiten",
    duplicate: "Als Vorlage kopieren",
    confirm: "Noch aktuell",
    confirmHint: "Seit über 30 Tagen nicht bestätigt. Ein Klick zeigt KW Sports und den Agenturen, dass ihr noch sucht.",
    statusTitle: "Status",
    statusHint: "Haltet den Status aktuell, damit KW Sports und die Agenturen wissen, woran sie sind.",
    statusHelp: {
      offen: "Wir suchen aktiv",
      in_gespraechen: "Wir sind mit Kandidaten im Gespräch",
      besetzt: "Die Position ist besetzt",
      archiviert: "Nicht mehr relevant"
    },
    suggestionsTitle: "Spieler von KW Sports",
    suggestionsIntro: "Passende Spieler aus der KW-Datenbank, von KW Sports für diesen Bedarf freigegeben.",
    suggestionsEmpty: "Noch keine Vorschläge. Sobald KW Sports einen passenden Spieler für diesen Bedarf freigibt, erscheint er hier.",
    suggestionsClosed: "Der Bedarf ist geschlossen. Es kommen keine neuen Vorschläge mehr.",
    allSuggestions: "Alle Vorschläge",
    confidential: "Vertrauliche Info",
    confidentialHint: "Nur für KW Sports sichtbar, nicht für Agenturen.",
    newCount: "{n} neue Vorschläge",
    newCountOne: "1 neuer Vorschlag",
    suggestionCount: "{n} Vorschläge",
    suggestionCountOne: "1 Vorschlag",
    stale: "Bitte bestätigen",
    addNeed: "Neuer Bedarf",
    addNeedHint: "Position oder Trainerrolle melden",
    closedTitle: "Geschlossene Bedarfe",
    filledQuestion: "Wie habt ihr die Position besetzt?",
    filledChange: "ändern",
    filledVia: {
      kw_sports: "Über KW Sports",
      andere_agentur: "Über eine andere Agentur",
      eigene_suche: "Eigene Suche",
      intern: "Aus dem eigenen Kader / Nachwuchs"
    }
  },
  en: {
    edit: "Edit",
    duplicate: "Copy as template",
    confirm: "Still current",
    confirmHint: "Not confirmed for over 30 days. One click tells KW Sports and the agencies you're still looking.",
    statusTitle: "Status",
    statusHint: "Keep the status current so KW Sports and the agencies know where things stand.",
    statusHelp: {
      offen: "We are actively looking",
      in_gespraechen: "We're talking to candidates",
      besetzt: "The position is filled",
      archiviert: "No longer relevant"
    },
    suggestionsTitle: "Players from KW Sports",
    suggestionsIntro: "Matching players from the KW database, released by KW Sports for this need.",
    suggestionsEmpty: "No suggestions yet. As soon as KW Sports releases a matching player for this need, they'll appear here.",
    suggestionsClosed: "This need is closed. No new suggestions will come in.",
    allSuggestions: "All suggestions",
    confidential: "Confidential info",
    confidentialHint: "Only visible to KW Sports, not to agencies.",
    newCount: "{n} new suggestions",
    newCountOne: "1 new suggestion",
    suggestionCount: "{n} suggestions",
    suggestionCountOne: "1 suggestion",
    stale: "Please confirm",
    addNeed: "New need",
    addNeedHint: "Report a position or coaching role",
    closedTitle: "Closed needs",
    filledQuestion: "How did you fill the position?",
    filledChange: "change",
    filledVia: {
      kw_sports: "Through KW Sports",
      andere_agentur: "Through another agency",
      eigene_suche: "Our own search",
      intern: "From our own squad / youth"
    }
  },
  fr: {
    edit: "Modifier",
    duplicate: "Copier comme modèle",
    confirm: "Toujours d’actualité",
    confirmHint: "Non confirmé depuis plus de 30 jours. Un clic indique à KW Sports et aux agences que vous cherchez toujours.",
    statusTitle: "Statut",
    statusHint: "Gardez le statut à jour pour que KW Sports et les agences sachent où vous en êtes.",
    statusHelp: {
      offen: "Nous cherchons activement",
      in_gespraechen: "Nous discutons avec des candidats",
      besetzt: "Le poste est pourvu",
      archiviert: "Plus d’actualité"
    },
    suggestionsTitle: "Joueurs de KW Sports",
    suggestionsIntro: "Joueurs correspondants de la base KW, proposés par KW Sports pour ce besoin.",
    suggestionsEmpty: "Pas encore de propositions. Dès que KW Sports propose un joueur adapté à ce besoin, il apparaîtra ici.",
    suggestionsClosed: "Ce besoin est clôturé. Aucune nouvelle proposition n’arrivera.",
    allSuggestions: "Toutes les propositions",
    confidential: "Info confidentielle",
    confidentialHint: "Visible uniquement par KW Sports, pas par les agences.",
    newCount: "{n} nouvelles propositions",
    newCountOne: "1 nouvelle proposition",
    suggestionCount: "{n} propositions",
    suggestionCountOne: "1 proposition",
    stale: "À confirmer",
    addNeed: "Nouveau besoin",
    addNeedHint: "Signaler un poste ou un rôle d’entraîneur",
    closedTitle: "Besoins clôturés",
    filledQuestion: "Comment avez-vous pourvu le poste ?",
    filledChange: "modifier",
    filledVia: {
      kw_sports: "Via KW Sports",
      andere_agentur: "Via une autre agence",
      eigene_suche: "Notre propre recherche",
      intern: "Effectif / centre de formation"
    }
  },
  es: {
    edit: "Editar",
    duplicate: "Copiar como plantilla",
    confirm: "Sigue vigente",
    confirmHint: "Sin confirmar desde hace más de 30 días. Un clic indica a KW Sports y a las agencias que seguís buscando.",
    statusTitle: "Estado",
    statusHint: "Mantened el estado al día para que KW Sports y las agencias sepan cómo está.",
    statusHelp: {
      offen: "Buscamos activamente",
      in_gespraechen: "Hablamos con candidatos",
      besetzt: "El puesto está cubierto",
      archiviert: "Ya no es relevante"
    },
    suggestionsTitle: "Jugadores de KW Sports",
    suggestionsIntro: "Jugadores adecuados de la base de KW, propuestos por KW Sports para esta necesidad.",
    suggestionsEmpty: "Aún no hay propuestas. En cuanto KW Sports proponga un jugador adecuado para esta necesidad, aparecerá aquí.",
    suggestionsClosed: "Esta necesidad está cerrada. No llegarán nuevas propuestas.",
    allSuggestions: "Todas las propuestas",
    confidential: "Info confidencial",
    confidentialHint: "Solo visible para KW Sports, no para las agencias.",
    newCount: "{n} propuestas nuevas",
    newCountOne: "1 propuesta nueva",
    suggestionCount: "{n} propuestas",
    suggestionCountOne: "1 propuesta",
    stale: "Por confirmar",
    addNeed: "Nueva necesidad",
    addNeedHint: "Indicar un puesto o un rol de entrenador",
    closedTitle: "Necesidades cerradas",
    filledQuestion: "¿Cómo habéis cubierto el puesto?",
    filledChange: "cambiar",
    filledVia: {
      kw_sports: "A través de KW Sports",
      andere_agentur: "A través de otra agencia",
      eigene_suche: "Búsqueda propia",
      intern: "Plantilla propia / cantera"
    }
  }
};
