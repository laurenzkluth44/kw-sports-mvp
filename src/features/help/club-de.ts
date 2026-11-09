import type { HelpGuide } from "./types";

export const clubGuideDe: HelpGuide = {
  title: "Anleitung für Vereine",
  intro:
    "Alles, was ihr in KW Club Hub tun könnt, Schritt für Schritt: Zugang einrichten, Kader pflegen, Bedarfe melden und auf Spielervorschläge von KW Sports antworten.",
  sections: [
    {
      id: "start",
      title: "Start",
      topics: [
        {
          id: "zugang",
          title: "Zugang einrichten",
          goal: "Einmalig nach der Einladung von KW Sports.",
          quickstart: true,
          shot: "login",
          steps: [
            "Öffne die E-Mail „Dein Zugang zu KW Club Hub“ von KW Sports.",
            "Klicke auf [[Zugang einrichten]]. Es öffnet sich KW Club Hub.",
            "Klicke dort noch einmal auf [[Zugang einrichten]].",
            "Gib dein neues Passwort zweimal ein: mindestens 10 Zeichen, mit Buchstaben und Zahlen. Die Häkchen zeigen, ob alles passt.",
            "Klicke auf [[Passwort speichern]]. Du landest direkt in der Übersicht deines Vereins."
          ],
          tip: "Der Link ist 24 Stunden gültig. Abgelaufen? Kurz bei KW Sports melden, ihr bekommt einen neuen."
        },
        {
          id: "login",
          title: "Einloggen und Sprache wählen",
          goal: "Bei jedem weiteren Besuch.",
          quickstart: true,
          steps: [
            "Öffne KW Club Hub (am besten als Lesezeichen speichern).",
            "Gib [[E-Mail]] und [[Passwort]] ein und klicke auf [[Einloggen]].",
            "Sprache wechseln: oben rechts [[DE]] [[EN]] [[FR]] [[ES]] anklicken. Am Handy steckt die Auswahl im [[Menü]]."
          ]
        },
        {
          id: "passwort",
          title: "Passwort vergessen",
          goal: "Neues Passwort per E-Mail-Link.",
          steps: [
            "Auf der Login-Seite auf [[Passwort vergessen?]] klicken.",
            "E-Mail-Adresse eingeben und [[Link senden]] klicken.",
            "In der E-Mail auf den Button klicken, dann auf der Seite [[Weiter]].",
            "Neues Passwort zweimal eingeben und [[Passwort speichern]] klicken."
          ],
          tip: "Keine E-Mail da? Bitte auch im Spam-Ordner nachsehen."
        }
      ]
    },
    {
      id: "uebersicht",
      title: "Übersicht",
      topics: [
        {
          id: "cockpit",
          title: "Die Übersicht lesen",
          goal: "Eure Startseite: was heute wichtig ist.",
          quickstart: true,
          shot: "cockpit",
          steps: [
            "Oben stehen vier Zahlen: [[Spieler im Kader]], [[Aktive Bedarfe]], [[Lücken]] der nächsten Saison und [[Neue KW-Vorschläge]]. Jede Zahl ist anklickbar.",
            "Unter [[Heute wichtig]] stehen die nächsten Aufgaben, jeweils mit einem Button: [[Ansehen]] bei neuen Vorschlägen, [[Bedarf anlegen]] bei einer Lücke, [[Bestätigen]] bei einem länger nicht bestätigten Bedarf.",
            "Die Kachel [[Kader]] zeigt die Positionen der nächsten Saison: blau = gut besetzt, weiß = nur einfach besetzt, gestrichelt = Lücke. Mit [[Kader öffnen]] geht es zur Kaderplanung.",
            "Ganz unten seht ihr eure Bedarfe. Ein Klick auf eine Karte öffnet den Bedarf."
          ]
        }
      ]
    },
    {
      id: "kader",
      title: "Kader",
      topics: [
        {
          id: "spieler-anlegen",
          title: "Spieler hinzufügen",
          goal: "Name, Position und Vertragsende reichen.",
          quickstart: true,
          steps: [
            "Im Menü auf [[Kader]] klicken, dann auf [[Spieler hinzufügen]].",
            "[[Vorname]] und [[Nachname]] eintragen, optional die [[Rückennummer]].",
            "Unter [[Hauptposition]] die Position wählen. Optional: [[Kann auch spielen]] für Positionen, auf denen er aushilft, und [[Abwehrpositionen (6:0)]].",
            "Bei [[Vertrag bis]] das Vertragsende eintragen. Verträge enden zum 30.06. am Ende der Saison.",
            "Auf [[Spieler anlegen]] klicken. Der Spieler erscheint sofort auf der Taktiktafel."
          ],
          tip: "Der Kader ist nur für euren Verein sichtbar. KW Sports und Agenturen sehen ihn nicht."
        },
        {
          id: "import",
          title: "Kader aus Excel importieren",
          goal: "Den ganzen Kader in einem Schritt übernehmen.",
          quickstart: true,
          shot: "import",
          steps: [
            "Im Menü auf [[Kader]] klicken, dann auf [[Aus Excel importieren]].",
            "Ihr habt keine passende Liste? Auf [[Vorlage herunterladen]] klicken, die Spieler eintragen und speichern.",
            "Die Datei (.xlsx oder .csv) in das Feld ziehen oder auf [[Datei auswählen]] klicken.",
            "Die Vorschau prüfen: Bei Spielern, die nicht übernommen werden sollen, das Häkchen bei [[Übernehmen]] entfernen. Übersprungene Zeilen stehen mit Grund oben (z. B. „Position nicht erkannt“).",
            "Auf [[Spieler importieren]] klicken. Fertig."
          ],
          tip: "Pflichtspalten sind Name, Position und Vertrag bis. Alte .xls-Dateien bitte in Excel als .xlsx speichern."
        },
        {
          id: "taktiktafel",
          title: "Taktiktafel und Lücken lesen",
          goal: "Sehen, wo es in den nächsten Saisons dünn wird.",
          quickstart: true,
          shot: "squad",
          steps: [
            "Auf der Seite [[Kader]] oben die Saison wählen, z. B. [[2027/28]].",
            "Mit [[Angriff]] und [[Abwehr 6:0]] zwischen den Aufstellungen wechseln.",
            "Die Kreise zeigen, wie viele Spieler die Position in der Saison unter Vertrag hat: blau = besetzt (2+), weiß = dünn (1), gestrichelt = Lücke.",
            "Rechts unter [[Handlungsbedarf]] stehen alle dünnen Positionen und Lücken. [[Bedarf anlegen]] öffnet direkt einen neuen Bedarf mit dieser Position und Saison."
          ]
        },
        {
          id: "spieler-bearbeiten",
          title: "Spieler bearbeiten oder entfernen",
          goal: "Vertrag verlängert, Position geändert, Spieler weg.",
          steps: [
            "Auf [[Kader]] in der Spielerliste beim Spieler auf [[Bearbeiten]] klicken.",
            "Angaben ändern und auf [[Änderungen speichern]] klicken.",
            "Spieler entfernen: unten auf [[Spieler entfernen]], dann auf [[Endgültig entfernen]]."
          ]
        }
      ]
    },
    {
      id: "bedarfe",
      title: "Bedarfe",
      topics: [
        {
          id: "bedarf-anlegen",
          title: "Bedarf anlegen",
          goal: "KW Sports melden, welche Position oder welchen Trainer ihr sucht.",
          quickstart: true,
          shot: "needForm",
          steps: [
            "Im Menü auf [[Neuer Bedarf]] klicken.",
            "Schritt 1 [[Art & Position]]: [[Spieler]] oder [[Trainer]] wählen. Bei Spielern die Positionen direkt auf dem Spielfeld antippen, mit [[Angriff]] und [[Abwehr 6:0]] umschalten. Mehrere Positionen sind möglich. Dann [[Weiter]].",
            "Schritt 2 [[Zeitpunkt & Status]]: Saison, [[Benötigt ab]] und [[Priorität]] wählen. [[Weiter]].",
            "Schritt 3 [[Profil]] (optional): Alter, Größe, Spielertyp, Sprachen, Liga-Erfahrung und eine [[Kurzbeschreibung]]. Je genauer, desto besser passen die Vorschläge. [[Weiter]].",
            "Schritt 4 [[Budget & Vertraulich]] (optional): Budget eintragen. Ins Feld [[Vertraulich · nur KW Sports]] gehört, was nur KW Sports wissen soll, z. B. Gehaltsrahmen oder Wunschkandidaten.",
            "Auf [[Bedarf anlegen]] klicken. KW Sports und die Partneragenturen sehen den Bedarf jetzt."
          ],
          tip: "Kurzbeschreibung und Budget sehen auch die Partneragenturen. Nur das vertrauliche Feld bleibt bei KW Sports."
        },
        {
          id: "bedarf-pflegen",
          title: "Bedarf bearbeiten, kopieren, aktuell halten",
          goal: "Damit KW Sports und Agenturen wissen, woran sie sind.",
          shot: "need",
          steps: [
            "In der Übersicht auf den Bedarf klicken.",
            "Ändern: auf [[Bearbeiten]] klicken, anpassen, [[Änderungen speichern]].",
            "Ähnlichen Bedarf anlegen: auf [[Als Vorlage kopieren]] klicken.",
            "Status setzen: [[Wir suchen aktiv]], [[Wir sind mit Kandidaten im Gespräch]], [[Die Position ist besetzt]] oder [[Nicht mehr relevant]].",
            "Nach 30 Tagen fragt die Plattform nach: ein Klick auf [[Noch aktuell]] zeigt, dass ihr weiter sucht."
          ]
        },
        {
          id: "besetzt",
          title: "Position besetzt melden",
          goal: "Den Bedarf schließen.",
          shot: "filled",
          steps: [
            "Den Bedarf öffnen und beim Status [[Die Position ist besetzt]] wählen.",
            "Kurz angeben, wie ihr besetzt habt: [[Über KW Sports]], [[Über eine andere Agentur]], [[Eigene Suche]] oder [[Aus dem eigenen Kader / Nachwuchs]].",
            "Der Bedarf wandert zu [[Geschlossene Bedarfe]]. Es kommen keine neuen Vorschläge mehr."
          ]
        }
      ]
    },
    {
      id: "vorschlaege",
      title: "Spielervorschläge",
      topics: [
        {
          id: "vorschlag-ansehen",
          title: "Vorschlag von KW Sports ansehen",
          goal: "KW Sports schlägt passende Spieler mit Profil und CV vor.",
          quickstart: true,
          shot: "suggestions",
          steps: [
            "Ihr bekommt eine E-Mail. Oder im Menü auf [[KW-Vorschläge]] klicken (die Zahl zeigt neue Vorschläge).",
            "Links steht der Spieler mit Foto, Alter, Größe und Vertrag. Auf der Taktiktafel sind seine Positionen eingezeichnet, blau = passt zu eurem Bedarf.",
            "Unter [[Warum dieser Vorschlag]] seht ihr, welche eurer Wünsche er erfüllt: Häkchen = passt, Fragezeichen = noch nicht bekannt.",
            "Auf [[CV öffnen (PDF)]] klicken für den kompletten Lebenslauf mit Statistiken. Die Spielvideos sind im CV direkt verlinkt.",
            "[[Video ansehen]] öffnet das Highlightvideo, falls vorhanden."
          ],
          tip: "Vorschläge sind vertraulich und nur für euren Verein sichtbar. Bitte nicht weitergeben."
        },
        {
          id: "antworten",
          title: "Auf einen Vorschlag antworten",
          goal: "Ein Klick genügt.",
          quickstart: true,
          steps: [
            "Optional eine Notiz an KW Sports schreiben, z. B. Gehaltsrahmen, Zeitpunkt oder Wunsch nach Probetraining.",
            "Auf [[Interessiert]] oder [[Kein Interesse]] klicken.",
            "Bei Interesse meldet sich KW Sports bei euch.",
            "Umentschieden? Beim Vorschlag auf [[Antwort ändern]] klicken."
          ]
        }
      ]
    },
    {
      id: "wissen",
      title: "Gut zu wissen",
      topics: [
        {
          id: "sichtbarkeit",
          title: "Wer sieht was?",
          goal: "Eure Daten bleiben bei euch.",
          quickstart: true,
          steps: [
            "[[Kader]]: nur euer Verein.",
            "[[Bedarfe]]: KW Sports und die Partneragenturen, damit sie passende Spieler finden. Andere Vereine sehen eure Bedarfe nicht.",
            "Das Feld [[Vertraulich · nur KW Sports]]: nur KW Sports.",
            "[[KW-Vorschläge]]: nur euer Verein und KW Sports."
          ]
        },
        {
          id: "erinnerung",
          title: "E-Mails von KW Club Hub",
          goal: "Was automatisch kommt.",
          steps: [
            "Neuer Spielervorschlag von KW Sports für einen eurer Bedarfe.",
            "Einmal im Monat eine Erinnerung, falls ein Bedarf seit über 30 Tagen nicht bestätigt wurde.",
            "Einladung und Passwort-Links."
          ]
        }
      ]
    }
  ]
};
