import type { HelpGuide } from "./types";

export const adminGuideDe: HelpGuide = {
  title: "Anleitung für KW Sports",
  intro:
    "Der Admin-Bereich ist euer Arbeitsplatz: Vereine und Agenturen einladen, die KW-Spielerdatenbank pflegen, passende Spieler für Bedarfe freigeben und die Antworten der Vereine nachfassen.",
  sections: [
    {
      id: "bedarfe",
      title: "Bedarfe",
      topics: [
        {
          id: "uebersicht",
          title: "Alle Bedarfe im Blick",
          goal: "Die Startseite für KW Sports.",
          shot: "adminNeeds",
          steps: [
            "Klicke im Menü auf [[Bedarfe]]. Du siehst alle Bedarfe aller Vereine.",
            "Filtere nach Land, Liga, Saison, Art, Angriff, Abwehr, Status oder Priorität.",
            "Der blaue Hinweis „… Bedarfe mit passenden KW-Spielern, noch ohne Vorschlag“ ist deine Arbeitsliste: [[Nur diese zeigen]] blendet alles andere aus. Die Zahl auf jeder Karte = passende, freigegebene KW-Spieler.",
            "[[CSV]] und [[Excel]] exportieren die aktuelle Auswahl."
          ]
        },
        {
          id: "vorschlagen",
          title: "Einen Spieler vorschlagen",
          goal: "Passenden KW-Spieler für einen Bedarf freigeben.",
          shot: "matches",
          steps: [
            "Öffne den Bedarf. Unter [[Passende KW-Spieler]] stehen die [[Vorschläge des Systems]], sortiert nach Passung in %.",
            "Angriff und Abwehr müssen beide passen. Fehlen beim Spieler die Abwehrpositionen, steht dort „A?“. Am besten im Spielerprofil nachtragen.",
            "Klicke beim gewünschten Spieler auf [[Für Verein freigeben]]. Der Verein bekommt eine E-Mail und sieht den Spieler mit Foto, CV und Video unter [[KW-Vorschläge]].",
            "Danach steht beim Spieler der Status [[Beim Verein]], später [[Interessiert]] oder [[Kein Interesse]] samt Notiz des Vereins.",
            "Falsch freigegeben? [[Vorschlag zurückziehen]]."
          ],
          tip: "Freigeben geht nur bei Spielern mit „Für Vereine freigegeben“ im Profil (Einwilligung nötig)."
        },
        {
          id: "bedarf-admin",
          title: "Bedarf anlegen, bearbeiten, Notizen",
          goal: "Für Vereine, die (noch) nicht selbst eintragen.",
          steps: [
            "[[Neuer Bedarf]] im Menü: erst den Verein wählen, dann die gleichen vier Schritte wie beim Verein.",
            "Im Bedarf: [[Bearbeiten]] ändert alle Felder, inklusive Status.",
            "[[Interne Admin-Notizen]] sind nur für KW Sports sichtbar, z. B. Gesprächsstand mit dem Verein.",
            "Der [[Änderungsverlauf]] zeigt, wer wann was geändert hat.",
            "Unter [[Ergebnis]] trägst du ein, wie der Bedarf besetzt wurde (z. B. [[Über KW Sports]] und welcher KW-Spieler)."
          ]
        }
      ]
    },
    {
      id: "spieler",
      title: "KW-Spieler",
      topics: [
        {
          id: "spieler-anlegen",
          title: "Spieler anlegen und freigeben",
          goal: "Nur freigegebene Spieler können vorgeschlagen werden.",
          shot: "players",
          steps: [
            "Klicke auf [[Spieler]] und dann auf [[Spieler anlegen]].",
            "Fülle [[Person]], [[Positionen]] (Angriff UND Abwehr), [[Verein & Vertrag]] und [[Profil]] aus.",
            "Unter [[Foto & CV]] Foto (bis 3 MB) und KW-CV als PDF (bis 10 MB) hochladen.",
            "Unter [[Freigabe]] das Datum der Einwilligung eintragen und [[Für Vereine freigegeben]] anhaken.",
            "[[Spieler anlegen]] bzw. [[Änderungen speichern]] klicken."
          ],
          tip: "Agenturen sehen KW-Spieler nie. Vereine sehen einen Spieler erst, wenn du ihn für ihren Bedarf freigibst."
        },
        {
          id: "upload",
          title: "Viele CVs und Fotos auf einmal hochladen",
          goal: "Dateien werden per Name dem Spieler zugeordnet.",
          shot: "bulkUpload",
          steps: [
            "Auf [[Spieler]] oben [[CVs & Fotos hochladen]] klicken.",
            "Dateien hineinziehen, z. B. 20261027_KW_CV_Vorname_Nachname.pdf oder athlete-vorname-nachname.jpg.",
            "Kein eindeutiger Treffer? Den Spieler in der Zeile über [[Spieler wählen …]] zuordnen.",
            "[[… Dateien hochladen]] klicken. Gibt es mehrere CVs für denselben Spieler, wird der neueste deutsche genommen."
          ]
        },
        {
          id: "statistik",
          title: "Saisonstatistik",
          goal: "Aktuelle Zahlen auf der Spielerkarte, die Vereine sehen.",
          steps: [
            "Die Werte kommen jede Woche automatisch aus dem Spieltags-Update (1./2. HBL, 3. Liga, Dänemark, Europapokal).",
            "Im Spielerprofil unter [[Saisonwerte]] siehst du die Summen je Saison und Wettbewerb und alle erfassten Spiele.",
            "Fehlende Spiele von früher: eine Sammelzeile anlegen, z. B. Wettbewerb „2. HBL“, Datum des letzten Spiels, Bezeichnung „Saison bis 08.11.“, [[Spiele]] = 8 und die Summen.",
            "Vereine sehen auf der Karte die aktuelle Saison der Liga mit den meisten Spielen: Spiele, Tore, Wurfquote, Assists und HPI (Torhüter: Paraden und Quote)."
          ]
        },
        {
          id: "pflege",
          title: "Datenbank aktuell halten",
          goal: "Damit das Matching gute Vorschläge macht.",
          steps: [
            "Filter [[Zu prüfen]]: Verträge abgelaufen oder Profile lange nicht geprüft.",
            "Filter [[Foto oder CV fehlt]]: diese Spieler wirken beim Verein deutlich schwächer.",
            "Abwehrpositionen nachtragen, wo sie fehlen. Sonst steht im Vorschlag „A?“."
          ]
        }
      ]
    },
    {
      id: "antworten",
      title: "Antworten der Vereine",
      topics: [
        {
          id: "inbox",
          title: "Interessen nachfassen",
          goal: "Was die Vereine zu euren Vorschlägen sagen.",
          shot: "inbox",
          steps: [
            "Klicke im Menü auf [[Antworten]]. Die Zahl am Menüpunkt = Interessen, die noch nicht nachgefasst sind.",
            "Ansichten: [[Interessiert]], [[Wartet auf Antwort]], [[Kein Interesse]], [[Erledigt]].",
            "Nach dem Anruf beim Verein: [[Erledigt]] klicken. [[Wieder öffnen]] holt ihn zurück.",
            "Oben siehst du Vorschläge gesendet, Interesse gemeldet und den Anteil KW an Besetzungen."
          ]
        }
      ]
    },
    {
      id: "nutzer",
      title: "Nutzer und Vereine",
      topics: [
        {
          id: "einladen",
          title: "Verein oder Agentur einladen",
          goal: "Zugang per E-Mail-Einladung.",
          steps: [
            "Klicke im Menü auf [[Nutzer]].",
            "[[Rolle]] wählen: Verein, Agentur oder KW-Admin.",
            "[[Name]] und [[E-Mail]] eintragen. Verein: Verein auswählen, optional Vereinslogo. Agentur: [[Agency Name]].",
            "[[Einladung senden]] klicken. Die Person bekommt eine E-Mail mit [[Zugang einrichten]].",
            "Kommt die E-Mail nicht an? [[Link kopieren]] und den Link selbst schicken (24 Stunden gültig).",
            "Tipp: Schickt Vereinen zusätzlich die PDF „Erste Schritte“ aus der Hilfe."
          ]
        },
        {
          id: "widerrufen",
          title: "Zugang widerrufen",
          goal: "Wenn jemand den Verein verlässt.",
          steps: [
            "In [[Nutzer]] auf den Verein klicken.",
            "Unter [[Vereinsnutzer]] bei der Person [[Zugang widerrufen]] und dann [[Ja, Zugang widerrufen]] klicken."
          ]
        },
        {
          id: "golive",
          title: "Go-Live-Check",
          goal: "Technischer Stand von E-Mail, Login und Daten.",
          shot: "goLive",
          steps: [
            "Klicke im Menü auf [[Go-Live]].",
            "Jede Zeile zeigt grün (ok) oder was noch fehlt, mit Hinweis zum Beheben.",
            "Unter E-Mail kannst du eine Test-E-Mail an dich selbst schicken."
          ]
        }
      ]
    }
  ]
};
