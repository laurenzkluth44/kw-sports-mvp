"use client";

import { useRouter } from "next/navigation";
import { AUTH_LOCALES, AUTH_LOCALE_LABELS, AUTH_LOCALE_COOKIE, type AuthLocale } from "@/lib/auth-i18n";
import { cn } from "@/lib/utils";

// DE/EN toggle for the auth screens. Writes the shared locale cookie so the
// choice persists into the logged-in app.
export function AuthLanguageSwitcher({ locale, tone = "light" }: { locale: AuthLocale; tone?: "light" | "dark" }) {
  const router = useRouter();

  function setLocale(next: AuthLocale) {
    document.cookie = `${AUTH_LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border p-0.5",
        tone === "dark" ? "border-white/20 bg-transparent" : "border-slate-200 bg-white"
      )}
    >
      {AUTH_LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          className={cn(
            "h-9 min-w-11 rounded-sm px-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors",
            tone === "dark"
              ? item === locale
                ? "bg-white text-navy-950"
                : "text-white/70 hover:text-white"
              : item === locale
                ? "bg-navy-950 text-white"
                : "text-slate-500 hover:text-navy-950"
          )}
          aria-pressed={item === locale}
        >
          {AUTH_LOCALE_LABELS[item]}
        </button>
      ))}
    </div>
  );
}
