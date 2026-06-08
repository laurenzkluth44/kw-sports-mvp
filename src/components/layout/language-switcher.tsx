"use client";

import { useRouter } from "next/navigation";
import { CLUB_LOCALE_COOKIE, CLUB_LOCALE_LABELS, CLUB_LOCALES, type ClubLocale } from "@/lib/club-i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale, label }: { locale: ClubLocale; label: string }) {
  const router = useRouter();

  function setLocale(nextLocale: ClubLocale) {
    document.cookie = `${CLUB_LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-1" aria-label={label}>
      {CLUB_LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          className={cn(
            "h-8 min-w-9 rounded px-2 text-xs font-black transition",
            item === locale ? "bg-white text-navy-950" : "text-slate-200 hover:bg-white/10 hover:text-white"
          )}
          aria-pressed={item === locale}
        >
          {CLUB_LOCALE_LABELS[item]}
        </button>
      ))}
    </div>
  );
}
