import type { ClubLocale } from "@/lib/club-i18n";

/** Navigation, confirmations and error pages. Plain strings only (some go to client components). */
export type GuideCopy = {
  menu: string;
  breadcrumb: string;
  home: string;
  flash: {
    needCreated: string;
    needUpdated: string;
    statusUpdated: string;
    needsConfirmed: string;
    staleTitle: string;
    staleBody: string;
    staleConfirmAll: string;
    staleConfirmOne: string;
  };
  notFound: { eyebrow: string; title: string; body: string; home: string };
  error: { eyebrow: string; title: string; body: string; retry: string; home: string };
  loading: string;
};

export const guideCopy: Record<ClubLocale, GuideCopy> = {
  de: {
    menu: "Menü",
    breadcrumb: "Navigationspfad",
    home: "Startseite",
    flash: {
      needCreated: "Bedarf gespeichert. Er ist jetzt für KW Sports und die Agenturen sichtbar.",
      needUpdated: "Änderungen gespeichert.",
      statusUpdated: "Status aktualisiert.",
      needsConfirmed: "Danke! Als aktuell bestätigt.",
      staleTitle: "{n} Bedarf(e) seit über 30 Tagen nicht bestätigt",
      staleBody: "Noch aktuell? Ein Klick, damit Agenturen und KW Sports wissen, dass ihr weiter sucht. Schon besetzt? Status auf „Besetzt“ setzen.",
      staleConfirmAll: "Alle als aktuell bestätigen",
      staleConfirmOne: "Noch aktuell"
    },
    notFound: {
      eyebrow: "Fehler 404",
      title: "Seite nicht gefunden",
      body: "Diese Seite gibt es nicht oder nicht mehr. Vielleicht wurde der Eintrag gelöscht oder der Link ist unvollständig.",
      home: "Zur Startseite"
    },
    error: {
      eyebrow: "Fehler",
      title: "Etwas ist schiefgelaufen",
      body: "Die Seite konnte gerade nicht geladen werden. Versuch es noch einmal. Wenn es wieder passiert, melde dich bei KW Sports.",
      retry: "Erneut versuchen",
      home: "Zur Startseite"
    },
    loading: "Wird geladen …"
  },
  en: {
    menu: "Menu",
    breadcrumb: "Breadcrumb",
    home: "Home",
    flash: {
      needCreated: "Need saved. It is now visible to KW Sports and the agencies.",
      needUpdated: "Changes saved.",
      statusUpdated: "Status updated.",
      needsConfirmed: "Thanks! Confirmed as current.",
      staleTitle: "{n} need(s) not confirmed for over 30 days",
      staleBody: "Still current? One click tells agencies and KW Sports you are still searching. Already filled? Set the status to “Filled”.",
      staleConfirmAll: "Confirm all as current",
      staleConfirmOne: "Still current"
    },
    notFound: {
      eyebrow: "Error 404",
      title: "Page not found",
      body: "This page doesn't exist (anymore). The entry may have been deleted or the link is incomplete.",
      home: "Go to home page"
    },
    error: {
      eyebrow: "Error",
      title: "Something went wrong",
      body: "The page couldn't be loaded just now. Please try again. If it keeps happening, contact KW Sports.",
      retry: "Try again",
      home: "Go to home page"
    },
    loading: "Loading …"
  },
  fr: {
    menu: "Menu",
    breadcrumb: "Fil d’Ariane",
    home: "Accueil",
    flash: {
      needCreated: "Besoin enregistré. Il est maintenant visible pour KW Sports et les agences.",
      needUpdated: "Modifications enregistrées.",
      statusUpdated: "Statut mis à jour.",
      needsConfirmed: "Merci ! Confirmé comme actuel.",
      staleTitle: "{n} besoin(s) non confirmé(s) depuis plus de 30 jours",
      staleBody: "Toujours d’actualité ? Un clic pour indiquer aux agences et à KW Sports que vous cherchez toujours. Déjà pourvu ? Passez le statut à « Pourvu ».",
      staleConfirmAll: "Tout confirmer",
      staleConfirmOne: "Toujours actuel"
    },
    notFound: {
      eyebrow: "Erreur 404",
      title: "Page introuvable",
      body: "Cette page n’existe pas ou plus. L’entrée a peut-être été supprimée ou le lien est incomplet.",
      home: "Retour à l’accueil"
    },
    error: {
      eyebrow: "Erreur",
      title: "Un problème est survenu",
      body: "La page n’a pas pu être chargée. Réessaie. Si cela se reproduit, contacte KW Sports.",
      retry: "Réessayer",
      home: "Retour à l’accueil"
    },
    loading: "Chargement …"
  },
  es: {
    menu: "Menú",
    breadcrumb: "Ruta de navegación",
    home: "Inicio",
    flash: {
      needCreated: "Necesidad guardada. Ahora la ven KW Sports y las agencias.",
      needUpdated: "Cambios guardados.",
      statusUpdated: "Estado actualizado.",
      needsConfirmed: "¡Gracias! Confirmado como vigente.",
      staleTitle: "{n} necesidad(es) sin confirmar desde hace más de 30 días",
      staleBody: "¿Sigue vigente? Un clic para que agencias y KW Sports sepan que seguís buscando. ¿Ya cubierta? Cambiad el estado a «Cubierta».",
      staleConfirmAll: "Confirmar todas",
      staleConfirmOne: "Sigue vigente"
    },
    notFound: {
      eyebrow: "Error 404",
      title: "Página no encontrada",
      body: "Esta página no existe o ya no existe. Puede que la entrada se haya borrado o que el enlace esté incompleto.",
      home: "Ir al inicio"
    },
    error: {
      eyebrow: "Error",
      title: "Algo ha salido mal",
      body: "No se pudo cargar la página. Inténtalo de nuevo. Si vuelve a pasar, contacta con KW Sports.",
      retry: "Reintentar",
      home: "Ir al inicio"
    },
    loading: "Cargando …"
  }
};
