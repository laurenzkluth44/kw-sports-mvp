import { Home } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { StatusScreen } from "@/components/layout/status-screen";
import { getClubLocale } from "@/lib/club-locale";
import { guideCopy } from "@/lib/guide-i18n";

// A need, club or player that doesn't exist (anymore): shown inside the app, header and menu included.
export default async function ProtectedNotFound() {
  const locale = await getClubLocale();
  const t = guideCopy[locale].notFound;

  return (
    <StatusScreen
      ghost="404"
      eyebrow={t.eyebrow}
      title={t.title}
      body={t.body}
      actions={
        <LinkButton href="/" variant="accent">
          <Home className="h-4 w-4" aria-hidden="true" />
          {t.home}
        </LinkButton>
      }
    />
  );
}
