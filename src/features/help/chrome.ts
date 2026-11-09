import type { ClubLocale } from "@/lib/club-i18n";
import type { HelpChrome } from "./types";

export const helpChrome: Record<ClubLocale, HelpChrome> = {
  de: {
    nav: "Hilfe",
    eyebrow: "Hilfe & Anleitung",
    contents: "Inhalt",
    tip: "Tipp",
    step: "Schritt",
    pdf: "Erste Schritte als PDF",
    pdfHint: "Die wichtigsten Schritte für Vereine auf zwei Seiten, zum Ausdrucken oder Weiterleiten.",
    contact: "Noch Fragen? Antworte einfach auf eine E-Mail von KW Club Hub, sie landet direkt bei KW Sports.",
    screenshotNote: "",
    guides: { club: "Vereine", agency: "Agenturen", admin: "KW Sports" }
  },
  en: {
    nav: "Help",
    eyebrow: "Help & guide",
    contents: "Contents",
    tip: "Tip",
    step: "Step",
    pdf: "Getting started as PDF",
    pdfHint: "The key steps for clubs on two pages, to print or forward.",
    contact: "Any questions? Just reply to any email from KW Club Hub, it goes straight to KW Sports.",
    screenshotNote: "Screenshots show the German version; the buttons are in the same place in your language.",
    guides: { club: "Clubs", agency: "Agencies", admin: "KW Sports" }
  },
  fr: {
    nav: "Aide",
    eyebrow: "Aide & guide",
    contents: "Sommaire",
    tip: "Astuce",
    step: "Étape",
    pdf: "Premiers pas en PDF",
    pdfHint: "Les étapes clés pour les clubs sur deux pages (en anglais), à imprimer ou transférer.",
    contact: "Des questions ? Répondez simplement à un e-mail de KW Club Hub, il arrive directement chez KW Sports.",
    screenshotNote: "Les captures montrent la version allemande ; les boutons sont au même endroit dans votre langue.",
    guides: { club: "Clubs", agency: "Agences", admin: "KW Sports" }
  },
  es: {
    nav: "Ayuda",
    eyebrow: "Ayuda y guía",
    contents: "Índice",
    tip: "Consejo",
    step: "Paso",
    pdf: "Primeros pasos en PDF",
    pdfHint: "Los pasos clave para clubes en dos páginas (en inglés), para imprimir o reenviar.",
    contact: "¿Preguntas? Responde a cualquier correo de KW Club Hub, llega directamente a KW Sports.",
    screenshotNote: "Las capturas muestran la versión alemana; los botones están en el mismo sitio en tu idioma.",
    guides: { club: "Clubes", agency: "Agencias", admin: "KW Sports" }
  }
};
