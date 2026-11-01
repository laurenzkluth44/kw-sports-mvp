"use client";

import { useEffect, useState } from "react";
import { Home, RotateCcw } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { StatusScreen } from "@/components/layout/status-screen";
import { CLUB_LOCALE_COOKIE, parseClubLocale, type ClubLocale } from "@/lib/club-i18n";
import { guideCopy } from "@/lib/guide-i18n";

// Shown inside the normal header when a page inside the app fails, so the menu stays usable.
export default function ProtectedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale, setLocale] = useState<ClubLocale>("de");

  useEffect(() => {
    console.error("Page error", error);
    const match = document.cookie.match(new RegExp(`(?:^|; )${CLUB_LOCALE_COOKIE}=([^;]+)`));
    setLocale(parseClubLocale(match?.[1]));
  }, [error]);

  const t = guideCopy[locale].error;

  return (
    <StatusScreen
      ghost="!"
      eyebrow={error.digest ? `${t.eyebrow} · ${error.digest}` : t.eyebrow}
      title={t.title}
      body={t.body}
      actions={
        <>
          <Button type="button" variant="accent" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t.retry}
          </Button>
          <LinkButton href="/" variant="secondary">
            <Home className="h-4 w-4" aria-hidden="true" />
            {t.home}
          </LinkButton>
        </>
      }
    />
  );
}
