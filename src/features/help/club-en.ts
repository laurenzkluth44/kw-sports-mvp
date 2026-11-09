import type { HelpGuide } from "./types";

export const clubGuideEn: HelpGuide = {
  title: "Guide for clubs",
  intro:
    "Everything you can do in KW Club Hub, step by step: set up your access, keep your squad up to date, report needs and answer player suggestions from KW Sports.",
  sections: [
    {
      id: "start",
      title: "Getting started",
      topics: [
        {
          id: "zugang",
          title: "Set up your access",
          goal: "Once, after KW Sports invited you.",
          quickstart: true,
          shot: "login",
          steps: [
            "Open the email “Your access to KW Club Hub” from KW Sports.",
            "Click [[Set up access]]. KW Club Hub opens.",
            "Click [[Set up access]] once more on that page.",
            "Enter your new password twice: at least 10 characters, with letters and numbers. The check marks show when everything fits.",
            "Click [[Save password]]. You land straight on your club’s overview."
          ],
          tip: "The link is valid for 24 hours. Expired? Let KW Sports know and you’ll get a new one."
        },
        {
          id: "login",
          title: "Sign in and choose your language",
          goal: "Every time after that.",
          quickstart: true,
          steps: [
            "Open KW Club Hub (best saved as a bookmark).",
            "Enter [[Email]] and [[Password]] and click [[Sign in]].",
            "Change the language: click [[DE]] [[EN]] [[FR]] [[ES]] at the top right. On a phone it’s in the [[Menu]]."
          ]
        },
        {
          id: "passwort",
          title: "Forgot your password",
          goal: "A new password via an email link.",
          steps: [
            "On the login page, click [[Forgot password?]].",
            "Enter your email address and click [[Send link]].",
            "Click the button in the email, then [[Continue]] on the page.",
            "Enter the new password twice and click [[Save password]]."
          ],
          tip: "No email? Please check your spam folder too."
        }
      ]
    },
    {
      id: "uebersicht",
      title: "Overview",
      topics: [
        {
          id: "cockpit",
          title: "Read the overview",
          goal: "Your home page: what matters today.",
          quickstart: true,
          shot: "cockpit",
          steps: [
            "At the top you see four numbers: [[Players in squad]], [[Active needs]], [[Gaps]] for next season and [[New KW suggestions]]. Each number is clickable.",
            "Under [[Today]] you find the next tasks, each with a button: [[View]] for new suggestions, [[Create need]] for a gap, [[Confirm]] for a need that hasn’t been confirmed for a while.",
            "The [[Squad]] tile shows next season’s positions: blue = well covered, white = only one player, dashed = gap. [[Open squad]] takes you to squad planning.",
            "At the bottom you see your needs. Click a card to open the need."
          ]
        }
      ]
    },
    {
      id: "kader",
      title: "Squad",
      topics: [
        {
          id: "spieler-anlegen",
          title: "Add a player",
          goal: "Name, position and contract end are enough.",
          quickstart: true,
          steps: [
            "Click [[Squad]] in the menu, then [[Add player]].",
            "Enter [[First name]] and [[Last name]], optionally the [[Shirt number]].",
            "Choose the [[Main position]]. Optional: [[Can also play]] for positions he can cover, and [[Defensive positions (6:0)]].",
            "Enter the end of the contract under [[Contract until]]. Contracts end on 30 June at the end of the season.",
            "Click [[Add player]]. The player appears on the tactics board right away."
          ],
          tip: "Your squad is visible to your club only. KW Sports and agencies don’t see it."
        },
        {
          id: "import",
          title: "Import your squad from Excel",
          goal: "Bring in the whole squad in one go.",
          quickstart: true,
          shot: "import",
          steps: [
            "Click [[Squad]] in the menu, then [[Import from Excel]].",
            "No suitable list? Click [[Download template]], fill in the players and save it.",
            "Drag the file (.xlsx or .csv) into the box or click [[Choose file]].",
            "Check the preview: untick [[Include]] for players you don’t want to import. Skipped rows are listed at the top with the reason (e.g. “Position not recognised”).",
            "Click [[Import players]]. Done."
          ],
          tip: "Required columns are name, position and contract until. Please save old .xls files as .xlsx in Excel."
        },
        {
          id: "taktiktafel",
          title: "Read the tactics board and gaps",
          goal: "See where you’ll be short in the coming seasons.",
          quickstart: true,
          shot: "squad",
          steps: [
            "On the [[Squad]] page, choose the season at the top, e.g. [[2027/28]].",
            "Switch between line-ups with [[Attack]] and [[Defence 6:0]].",
            "The circles show how many players are under contract for that position in that season: blue = covered (2+), white = thin (1), dashed = gap.",
            "On the right, [[Action needed]] lists all thin positions and gaps. [[Create need]] opens a new need with that position and season already filled in."
          ]
        },
        {
          id: "spieler-bearbeiten",
          title: "Edit or remove a player",
          goal: "Contract extended, position changed, player gone.",
          steps: [
            "On [[Squad]], click [[Edit]] next to the player in the list.",
            "Change the details and click [[Save changes]].",
            "To remove the player: click [[Remove player]] at the bottom, then [[Remove permanently]]."
          ]
        }
      ]
    },
    {
      id: "bedarfe",
      title: "Needs",
      topics: [
        {
          id: "bedarf-anlegen",
          title: "Create a need",
          goal: "Tell KW Sports which position or coach you are looking for.",
          quickstart: true,
          shot: "needForm",
          steps: [
            "Click [[New need]] in the menu.",
            "Step 1 [[Type & position]]: choose [[Player]] or [[Coach]]. For players, tap the positions on the court and switch with [[Attack]] and [[Defence 6:0]]. Several positions are possible. Then [[Next]].",
            "Step 2 [[Timing & status]]: choose the season, [[Needed from]] and [[Priority]]. [[Next]].",
            "Step 3 [[Profile]] (optional): age, height, player type, languages, league experience and a [[Short brief]]. The more precise, the better the suggestions fit. [[Next]].",
            "Step 4 [[Budget & confidential]] (optional): enter a budget. The field [[Confidential · KW Sports only]] is for things only KW Sports should know, e.g. salary range or preferred candidates.",
            "Click [[Create need]]. KW Sports and the partner agencies can now see the need."
          ],
          tip: "Partner agencies also see the short brief and the budget. Only the confidential field stays with KW Sports."
        },
        {
          id: "bedarf-pflegen",
          title: "Edit, copy and keep a need current",
          goal: "So KW Sports and agencies know where things stand.",
          shot: "need",
          steps: [
            "Click the need on your overview.",
            "To change it: click [[Edit]], adjust, [[Save changes]].",
            "For a similar need: click [[Copy as template]].",
            "Set the status: [[We are actively looking]], [[We're talking to candidates]], [[The position is filled]] or [[No longer relevant]].",
            "After 30 days the platform asks: one click on [[Still current]] shows you are still looking."
          ]
        },
        {
          id: "besetzt",
          title: "Report a position as filled",
          goal: "Close the need.",
          shot: "filled",
          steps: [
            "Open the need and choose [[The position is filled]] as the status.",
            "Say briefly how you filled it: [[Through KW Sports]], [[Through another agency]], [[Our own search]] or [[From our own squad / youth]].",
            "The need moves to [[Closed needs]]. No new suggestions will come for it."
          ]
        }
      ]
    },
    {
      id: "vorschlaege",
      title: "Player suggestions",
      topics: [
        {
          id: "vorschlag-ansehen",
          title: "View a suggestion from KW Sports",
          goal: "KW Sports suggests matching players with profile and CV.",
          quickstart: true,
          shot: "suggestions",
          steps: [
            "You get an email. Or click [[KW suggestions]] in the menu (the number shows new suggestions).",
            "On the left: the player with photo, age, height and contract. The tactics board shows his positions, blue = fits your need.",
            "Under [[Why this suggestion]] you see which of your wishes he meets: check mark = fits, question mark = not known yet.",
            "Click [[Open CV (PDF)]] for the full CV with statistics. The game videos are linked directly in the CV.",
            "[[Watch video]] opens the highlight video, if there is one."
          ],
          tip: "Suggestions are confidential and visible to your club only. Please don’t share them."
        },
        {
          id: "antworten",
          title: "Answer a suggestion",
          goal: "One click is enough.",
          quickstart: true,
          steps: [
            "Optionally add a note for KW Sports, e.g. salary range, timing or a request for a trial.",
            "Click [[Interested]] or [[Not interested]].",
            "If you’re interested, KW Sports gets in touch with you.",
            "Changed your mind? Click [[Change answer]] on the suggestion."
          ]
        }
      ]
    },
    {
      id: "wissen",
      title: "Good to know",
      topics: [
        {
          id: "sichtbarkeit",
          title: "Who sees what?",
          goal: "Your data stays with you.",
          quickstart: true,
          steps: [
            "[[Squad]]: your club only.",
            "Needs: KW Sports and the partner agencies, so they can find matching players. Other clubs don’t see your needs.",
            "The field [[Confidential · KW Sports only]]: KW Sports only.",
            "[[KW suggestions]]: your club and KW Sports only."
          ]
        },
        {
          id: "erinnerung",
          title: "Emails from KW Club Hub",
          goal: "What arrives automatically.",
          steps: [
            "A new player suggestion from KW Sports for one of your needs.",
            "Once a month a reminder if a need hasn’t been confirmed for more than 30 days.",
            "Invitation and password links."
          ]
        }
      ]
    }
  ]
};
