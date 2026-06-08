import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const dateLocales = {
  de: "de-DE",
  en: "en-GB",
  fr: "fr-FR",
  es: "es-ES"
} as const;

export function formatDate(value: string | null | undefined, locale: keyof typeof dateLocales = "de") {
  if (!value) return "-";

  return new Intl.DateTimeFormat(dateLocales[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export function formatCurrency(amount: number | null, currency: string | null) {
  if (amount === null || amount === undefined) return "-";

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function compactObject<T extends Record<string, string | undefined | null>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as Partial<T>;
}

export function toSearchParams(input: Record<string, string | undefined | null>) {
  const params = new URLSearchParams();

  Object.entries(input).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return params.toString();
}
