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
          { href: "/admin/needs/new", label: "Neuer Bedarf", icon: Plus },
          { href: "/admin/users", label: "Nutzer", icon: Users }
        ]
      : [
          { href: "/club", label: t.navNeeds, icon: Building2 },
          { href: "/club/needs/new", label: t.navNewNeed, icon: Plus }
        ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-950/95 text-white backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={profile.role === "admin" ? "/admin" : "/club"}
              prefetch={false}
              className="group flex items-center gap-3"
            >
              <Image
                src="/kw-sports-logo-white.svg"
                alt="KW Sports"
                width={2557}
                height={288}
                className="h-6 w-auto"
                priority
                unoptimized
              />
              <span className="border-l border-white/15 pl-3">
                <span className="block font-display text-2xl uppercase leading-none tracking-[0.02em]">
                  Club Needs
                </span>
                <span className="mt-0.5 block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand-300">
                  {profile.role === "admin" ? "Kaderbedarf Datenbank" : t.tagline}
                </span>
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              {profile.role === "club" ? <LanguageSwitcher locale={locale} label={t.language} /> : null}
              <span className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-100">
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

          <nav className="-mb-px flex gap-6 overflow-x-auto">
            {nav.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} prefetch={false} className="nav-link">
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
