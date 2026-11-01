import Image from "next/image";
import { Home } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { StatusScreen } from "@/components/layout/status-screen";
import { getClubLocale } from "@/lib/club-locale";
import { guideCopy } from "@/lib/guide-i18n";

// Any unknown URL. "/" sends signed-in users to their own start page and everyone else to the login.
export default async function NotFound() {
  const locale = await getClubLocale();
  const t = guideCopy[locale].notFound;

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <header className="bg-navy-950 px-4 py-4 sm:px-8">
        <Image src="/kw-sports-logo-white.svg" alt="KW Sports" width={2557} height={288} className="h-6 w-auto" unoptimized />
      </header>
      <div className="page-shell">
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
      </div>
    </main>
  );
}
