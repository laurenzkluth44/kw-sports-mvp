import type { HelpGuide } from "./types";

export const agencyGuideDe: HelpGuide = {
  title: "Anleitung für Partneragenturen",
  intro:
    "Mit eurem Zugang seht ihr alle aktuellen Kaderbedarfe der Vereine auf KW Club Hub und findet schnell, wer welche Position sucht. Der Zugang ist nur lesend.",
  sections: [
    {
      id: "start",
      title: "Erste Schritte",
      topics: [
        {
          id: "zugang",
          title: "Zugang einrichten und einloggen",
          goal: "Einmalig nach der Einladung, danach mit E-Mail und Passwort.",
          shot: "login",
          steps: [
            "Öffne die E-Mail „Dein Zugang zu KW Club Hub“ und klicke auf [[Zugang einrichten]].",
            "Klicke auf der Seite noch einmal auf [[Zugang einrichten]].",
            "Passwort zweimal eingeben (mindestens 10 Zeichen, Buchstaben und Zahlen) und [[Passwort speichern]] klicken.",
            "Später: [[E-Mail]] und [[Passwort]] eingeben und [[Einloggen]] klicken. Passwort vergessen? [[Passwort vergessen?]]",
            "Sprache wechseln: oben rechts [[DE]] [[EN]] [[FR]] [[ES]]."
          ]
        }
      ]
    },
    {
      id: "bedarfe",
      title: "Bedarfe finden",
      topics: [
        {
          id: "filtern",
          title: "Bedarfe filtern",
          goal: "Finden, welche Vereine eine bestimmte Position suchen.",
          shot: "agency",
          steps: [
            "Nach dem Login landest du auf [[Bedarfe]]. Oben siehst du die Zahl der Treffer, offene Bedarfe und Bedarfe mit hoher Priorität.",
            "Unter [[Schnellfilter]] öffnest du häufige Sichten mit einem Klick, z. B. [[Offen]], [[Hohe Priorität]] oder [[Trainer]].",
            "Für eine genaue Suche: im Bereich [[Filter]] Verein, Land, Liga, Saison, Art, [[Angriff]], [[Abwehr]], Status oder Priorität wählen und [[Filtern]] klicken.",
            "[[Zurücksetzen]] löscht alle Filter.",
            "Die [[Visual Summary]] zeigt für den aktuellen Filter, welche Positionen, Ligen und Prioritäten gerade gefragt sind."
          ],
          tip: "Tipp: Wählst du Angriff und Abwehr zusammen, siehst du nur Bedarfe, die beides suchen."
        },
        {
          id: "details",
          title: "Einen Bedarf im Detail ansehen",
          goal: "Profil, Budget und Status eines Gesuchs.",
          steps: [
            "Klicke in der Liste auf [[Bedarf öffnen]].",
            "Du siehst Verein, Liga, Saison, [[Benötigt ab]], Positionen, das Anforderungsprofil und – falls angegeben – das Budget.",
            "[[Zur Übersicht]] bringt dich zurück zur Liste mit deinen Filtern."
          ]
        }
      ]
    },
    {
      id: "wissen",
      title: "Gut zu wissen",
      topics: [
        {
          id: "nur-lesen",
          title: "Was der Agenturzugang kann",
          goal: "Nur Ansicht.",
          steps: [
            "Ihr seht alle aktuellen Bedarfe der Vereine. Kader der Vereine, Spieler von KW Sports und vertrauliche Notizen seht ihr nicht.",
            "Ändern, Notizen, Exporte und Nutzerverwaltung bleiben bei KW Sports.",
            "Passenden Spieler gefunden? Meldet euch direkt bei KW Sports."
          ]
        }
      ]
    }
  ]
};

export const agencyGuideEn: HelpGuide = {
  title: "Guide for partner agencies",
  intro:
    "With your access you see all current squad needs of the clubs on KW Club Hub and quickly find who is looking for which position. Access is read-only.",
  sections: [
    {
      id: "start",
      title: "Getting started",
      topics: [
        {
          id: "zugang",
          title: "Set up access and sign in",
          goal: "Once after the invitation, then with email and password.",
          shot: "login",
          steps: [
            "Open the email “Your access to KW Club Hub” and click [[Set up access]].",
            "Click [[Set up access]] once more on the page.",
            "Enter your password twice (at least 10 characters, letters and numbers) and click [[Save password]].",
            "Later: enter [[Email]] and [[Password]] and click [[Sign in]]. Forgot it? [[Forgot password?]]",
            "Change the language at the top right: [[DE]] [[EN]] [[FR]] [[ES]]."
          ]
        }
      ]
    },
    {
      id: "bedarfe",
      title: "Finding needs",
      topics: [
        {
          id: "filtern",
          title: "Filter needs",
          goal: "Find which clubs are looking for a given position.",
          shot: "agency",
          steps: [
            "After signing in you land on [[Needs]]. At the top you see the number of results, open needs and high-priority needs.",
            "Under [[Quick filters]] you open frequent views with one click, e.g. [[Open]], [[High priority]] or [[Coaches]].",
            "For a precise search: in [[Filters]] choose club, country, league, season, type, [[Attack]], [[Defence]], status or priority and click [[Filter]].",
            "[[Reset]] clears all filters.",
            "The [[Visual summary]] shows which positions, leagues and priorities are in demand in the current filter."
          ],
          tip: "Tip: if you choose attack and defence together, you only see needs that ask for both."
        },
        {
          id: "details",
          title: "View a need in detail",
          goal: "Profile, budget and status of a request.",
          steps: [
            "Click [[Open need]] in the list.",
            "You see club, league, season, [[Needed from]], positions, the requirement profile and the budget, if given.",
            "[[Back to overview]] takes you back to the list with your filters."
          ]
        }
      ]
    },
    {
      id: "wissen",
      title: "Good to know",
      topics: [
        {
          id: "nur-lesen",
          title: "What agency access can do",
          goal: "View only.",
          steps: [
            "You see all current needs of the clubs. You don’t see club squads, KW Sports players or confidential notes.",
            "Changes, notes, exports and user management stay with KW Sports.",
            "Found a matching player? Contact KW Sports directly."
          ]
        }
      ]
    }
  ]
};
