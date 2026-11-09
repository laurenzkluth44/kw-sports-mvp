import type { HelpGuide } from "./types";

// Login and password pages exist in German and English; French clubs see them in English.
export const clubGuideFr: HelpGuide = {
  title: "Guide pour les clubs",
  intro:
    "Tout ce que vous pouvez faire dans KW Club Hub, étape par étape : activer votre accès, tenir votre effectif à jour, signaler vos besoins et répondre aux propositions de joueurs de KW Sports.",
  sections: [
    {
      id: "start",
      title: "Premiers pas",
      topics: [
        {
          id: "zugang",
          title: "Activer votre accès",
          goal: "Une seule fois, après l’invitation de KW Sports.",
          quickstart: true,
          shot: "login",
          steps: [
            "Ouvrez l’e-mail « Your access to KW Club Hub » de KW Sports.",
            "Cliquez sur [[Set up access]]. KW Club Hub s’ouvre.",
            "Cliquez encore une fois sur [[Set up access]] sur cette page.",
            "Saisissez deux fois votre nouveau mot de passe : au moins 10 caractères, avec des lettres et des chiffres. Les coches indiquent quand tout est bon.",
            "Cliquez sur [[Save password]]. Vous arrivez directement sur l’aperçu de votre club."
          ],
          tip: "Les pages de connexion s’affichent en anglais. Le lien est valable 24 heures. Expiré ? Prévenez KW Sports, vous en recevrez un nouveau."
        },
        {
          id: "login",
          title: "Se connecter et choisir la langue",
          goal: "À chaque visite suivante.",
          quickstart: true,
          steps: [
            "Ouvrez KW Club Hub (idéalement enregistré en favori).",
            "Saisissez [[Email]] et [[Password]], puis cliquez sur [[Sign in]].",
            "Changer de langue : cliquez sur [[DE]] [[EN]] [[FR]] [[ES]] en haut à droite. Sur téléphone, le choix se trouve dans le [[Menu]]."
          ]
        },
        {
          id: "passwort",
          title: "Mot de passe oublié",
          goal: "Un nouveau mot de passe via un lien par e-mail.",
          steps: [
            "Sur la page de connexion, cliquez sur [[Forgot password?]].",
            "Saisissez votre adresse e-mail et cliquez sur [[Send link]].",
            "Cliquez sur le bouton dans l’e-mail, puis sur [[Continue]].",
            "Saisissez deux fois le nouveau mot de passe et cliquez sur [[Save password]]."
          ],
          tip: "Pas d’e-mail ? Vérifiez aussi vos spams."
        }
      ]
    },
    {
      id: "uebersicht",
      title: "Aperçu",
      topics: [
        {
          id: "cockpit",
          title: "Lire l’aperçu",
          goal: "Votre page d’accueil : ce qui compte aujourd’hui.",
          quickstart: true,
          shot: "cockpit",
          steps: [
            "En haut, quatre chiffres : [[Joueurs dans l’effectif]], [[Besoins actifs]], [[Manques]] de la saison suivante et [[Nouvelles propositions KW]]. Chaque chiffre est cliquable.",
            "Sous [[Aujourd’hui]] figurent les prochaines tâches, chacune avec un bouton : [[Voir]] pour les nouvelles propositions, [[Créer un besoin]] pour un poste manquant, [[Confirmer]] pour un besoin non confirmé depuis un moment.",
            "La tuile [[Effectif]] montre les postes de la saison suivante : bleu = bien couvert, blanc = un seul joueur, pointillés = manque. [[Ouvrir l’effectif]] mène à la planification.",
            "Tout en bas se trouvent vos besoins. Un clic sur une carte ouvre le besoin."
          ]
        }
      ]
    },
    {
      id: "kader",
      title: "Effectif",
      topics: [
        {
          id: "spieler-anlegen",
          title: "Ajouter un joueur",
          goal: "Nom, poste et fin de contrat suffisent.",
          quickstart: true,
          steps: [
            "Dans le menu, cliquez sur [[Effectif]], puis sur [[Ajouter un joueur]].",
            "Saisissez [[Prénom]] et [[Nom]], éventuellement le [[Numéro]].",
            "Choisissez le [[Poste principal]]. En option : [[Peut aussi jouer]] pour les postes où il peut dépanner, et [[Postes en défense (6:0)]].",
            "Indiquez la fin du contrat sous [[Contrat jusqu’au]]. Les contrats se terminent le 30 juin, en fin de saison.",
            "Cliquez sur [[Ajouter le joueur]]. Il apparaît aussitôt sur le tableau tactique."
          ],
          tip: "Votre effectif n’est visible que par votre club. KW Sports et les agences ne le voient pas."
        },
        {
          id: "import",
          title: "Importer l’effectif depuis Excel",
          goal: "Reprendre tout l’effectif en une fois.",
          quickstart: true,
          shot: "import",
          steps: [
            "Dans le menu, cliquez sur [[Effectif]], puis sur [[Importer depuis Excel]].",
            "Pas de liste adaptée ? Cliquez sur [[Télécharger le modèle]], remplissez-le et enregistrez-le.",
            "Glissez le fichier (.xlsx ou .csv) dans la zone ou cliquez sur [[Choisir un fichier]].",
            "Vérifiez l’aperçu : décochez [[Inclure]] pour les joueurs à ne pas importer. Les lignes ignorées sont listées en haut avec la raison.",
            "Cliquez sur [[Importer les joueurs]]. C’est fait."
          ],
          tip: "Colonnes obligatoires : nom, poste et fin de contrat. Enregistrez les anciens fichiers .xls au format .xlsx."
        },
        {
          id: "taktiktafel",
          title: "Lire le tableau tactique et les manques",
          goal: "Voir où l’effectif sera juste dans les prochaines saisons.",
          quickstart: true,
          shot: "squad",
          steps: [
            "Sur la page [[Effectif]], choisissez la saison en haut, par ex. [[2027/28]].",
            "Passez d’une disposition à l’autre avec [[Attaque]] et [[Défense 6:0]].",
            "Les cercles indiquent combien de joueurs sont sous contrat à ce poste pour la saison : bleu = couvert (2+), blanc = juste (1), pointillés = manque.",
            "À droite, [[À traiter]] liste les postes justes et les manques. [[Créer un besoin]] ouvre un nouveau besoin avec ce poste et cette saison déjà remplis."
          ]
        },
        {
          id: "spieler-bearbeiten",
          title: "Modifier ou retirer un joueur",
          goal: "Contrat prolongé, poste changé, joueur parti.",
          steps: [
            "Sur [[Effectif]], cliquez sur [[Modifier]] à côté du joueur.",
            "Modifiez les informations et cliquez sur [[Enregistrer]].",
            "Pour le retirer : cliquez sur [[Retirer le joueur]] en bas, puis sur [[Supprimer définitivement]]."
          ]
        }
      ]
    },
    {
      id: "bedarfe",
      title: "Besoins",
      topics: [
        {
          id: "bedarf-anlegen",
          title: "Créer un besoin",
          goal: "Indiquer à KW Sports quel poste ou quel entraîneur vous cherchez.",
          quickstart: true,
          shot: "needForm",
          steps: [
            "Dans le menu, cliquez sur [[Nouveau besoin]].",
            "Étape 1 [[Type & poste]] : choisissez [[Joueur]] ou [[Entraîneur]]. Pour un joueur, touchez les postes sur le terrain et basculez avec [[Attaque]] et [[Défense 6:0]]. Plusieurs postes sont possibles. Puis [[Suivant]].",
            "Étape 2 [[Date & statut]] : saison, [[Disponible à partir du]] et [[Priorité]]. [[Suivant]].",
            "Étape 3 [[Profil]] (facultatif) : âge, taille, profil de joueur, langues, expérience de championnat et un [[Brief court]]. Plus c’est précis, plus les propositions sont pertinentes. [[Suivant]].",
            "Étape 4 [[Budget & confidentiel]] (facultatif) : indiquez un budget. Le champ [[Confidentiel · KW Sports uniquement]] est réservé à ce que seul KW Sports doit savoir, par ex. la fourchette de salaire.",
            "Cliquez sur [[Créer un besoin]]. KW Sports et les agences partenaires voient désormais le besoin."
          ],
          tip: "Les agences partenaires voient aussi le brief et le budget. Seul le champ confidentiel reste chez KW Sports."
        },
        {
          id: "bedarf-pflegen",
          title: "Modifier, copier et garder un besoin à jour",
          goal: "Pour que KW Sports et les agences sachent où vous en êtes.",
          shot: "need",
          steps: [
            "Cliquez sur le besoin dans votre aperçu.",
            "Pour le modifier : [[Modifier]], ajuster, [[Enregistrer]].",
            "Pour un besoin similaire : [[Copier comme modèle]].",
            "Choisissez le statut : [[Nous cherchons activement]], [[Nous discutons avec des candidats]], [[Le poste est pourvu]] ou [[Plus d’actualité]].",
            "Après 30 jours, la plateforme demande une confirmation : un clic sur [[Toujours d’actualité]] suffit."
          ]
        },
        {
          id: "besetzt",
          title: "Signaler un poste pourvu",
          goal: "Clôturer le besoin.",
          shot: "filled",
          steps: [
            "Ouvrez le besoin et choisissez le statut [[Le poste est pourvu]].",
            "Indiquez comment : [[Via KW Sports]], [[Via une autre agence]], [[Notre propre recherche]] ou [[Effectif / centre de formation]].",
            "Le besoin passe dans [[Besoins clôturés]]. Il ne reçoit plus de propositions."
          ]
        }
      ]
    },
    {
      id: "vorschlaege",
      title: "Propositions de joueurs",
      topics: [
        {
          id: "vorschlag-ansehen",
          title: "Consulter une proposition de KW Sports",
          goal: "KW Sports propose des joueurs adaptés avec profil et CV.",
          quickstart: true,
          shot: "suggestions",
          steps: [
            "Vous recevez un e-mail. Ou cliquez sur [[Propositions KW]] dans le menu (le chiffre indique les nouvelles).",
            "À gauche : le joueur avec photo, âge, taille et contrat. Le tableau tactique montre ses postes, en bleu ceux qui correspondent à votre besoin.",
            "Sous [[Pourquoi cette proposition]], vous voyez quels critères il remplit : coche = oui, point d’interrogation = pas encore connu.",
            "Cliquez sur [[Ouvrir le CV (PDF)]] pour le CV complet avec statistiques. Les vidéos de match sont directement liées dans le CV.",
            "[[Voir la vidéo]] ouvre la vidéo de temps forts, s’il y en a une."
          ],
          tip: "Les propositions sont confidentielles et visibles uniquement par votre club. Merci de ne pas les diffuser."
        },
        {
          id: "antworten",
          title: "Répondre à une proposition",
          goal: "Un clic suffit.",
          quickstart: true,
          steps: [
            "Ajoutez si vous le souhaitez une note pour KW Sports, par ex. salaire, calendrier ou demande d’essai.",
            "Cliquez sur [[Intéressés]] ou [[Pas intéressés]].",
            "En cas d’intérêt, KW Sports vous contacte.",
            "Vous changez d’avis ? Cliquez sur [[Modifier la réponse]]."
          ]
        }
      ]
    },
    {
      id: "wissen",
      title: "Bon à savoir",
      topics: [
        {
          id: "sichtbarkeit",
          title: "Qui voit quoi ?",
          goal: "Vos données restent chez vous.",
          quickstart: true,
          steps: [
            "[[Effectif]] : votre club uniquement.",
            "Besoins : KW Sports et les agences partenaires, pour trouver des joueurs adaptés. Les autres clubs ne voient pas vos besoins.",
            "Le champ [[Confidentiel · KW Sports uniquement]] : KW Sports uniquement.",
            "[[Propositions KW]] : votre club et KW Sports uniquement."
          ]
        },
        {
          id: "erinnerung",
          title: "E-mails de KW Club Hub",
          goal: "Ce qui arrive automatiquement.",
          steps: [
            "Une nouvelle proposition de joueur de KW Sports pour l’un de vos besoins.",
            "Une fois par mois, un rappel si un besoin n’a pas été confirmé depuis plus de 30 jours.",
            "Invitation et liens de mot de passe."
          ]
        }
      ]
    }
  ]
};
