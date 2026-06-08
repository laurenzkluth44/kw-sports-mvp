import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Building2, FileDown, LogOut, Plus, Shield, Users } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { logoutAction } from "@/features/auth/actions";
import { ROLE_LABELS } from "@/lib/constants";
import { clubCopy, type ClubLocale } from "@/lib/club-i18n";
import type { Profile } from "@/types/domain";
import { Button } from "@/components/ui/button";

export function AppShell({
  profile,
  locale,
  children
}: {
  profile: Profile;
  locale: ClubLocale;
  children: ReactNode;
}) {
  const t = clubCopy[locale].app;
  const nav =
    profile.role === "admin"
      ? [
          { href: "/admin", label: "Bedarfe", icon: FileDown },
          { href: "/admin/users", label: "Nutzer", icon: Users }
        ]
      : [
          { href: "/club", label: t.navNeeds, icon: Building2 },
          { href: "/club/needs/new", label: t.navNewNeed, icon: Plus }
        ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-950/95 text-white shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={profile.role === "admin" ? "/admin" : "/club"}
              prefetch={false}
              className="flex items-center gap-3"
            >
              <span className="flex h-12 w-36 items-center justify-center rounded-md bg-white px-3 py-2">
                <Image
                  src="/kw-sports-logo.png"
                  alt="KW Sports"
                  width={1000}
                  height={326}
                  className="h-full w-full object-contain"
                  priority
                />
              </span>
              <span>
                <span className="block text-base font-black uppercase">Club Needs</span>
                <span className="block text-xs text-brand-300">
                  {profile.role === "admin" ? "Kaderbedarf Datenbank" : t.tagline}
                </span>
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              {profile.role === "club" ? <LanguageSwitcher locale={locale} label={t.language} /> : null}
              <span className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100">
                <Shield className="h-4 w-4 text-brand-300" aria-hidden="true" />
                {profile.role === "club" ? t.role : ROLE_LABELS[profile.role]}
              </span>
              <form action={logoutAction}>
                <Button variant="ghost" className="text-white hover:bg-white/10" type="submit">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {profile.role === "club" ? t.logout : "Logout"}
                </Button>
              </form>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto rounded-md border border-white/10 bg-white/[0.04] p-1">
            {nav.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-black uppercase text-neutral-200 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="page-shell">{children}</main>
    </div>
  );
}
