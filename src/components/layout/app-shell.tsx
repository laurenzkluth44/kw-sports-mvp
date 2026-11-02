import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Eye, FileDown, Inbox, LayoutDashboard, LogOut, Menu, Plus, Shield, Shirt, Sparkles, UserRound, Users } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ClubCrest, clubLogoUrl } from "@/components/ui/club-crest";
import { NavLinks, type NavItem } from "@/components/layout/nav-links";
import { logoutAction } from "@/features/auth/actions";
import { ROLE_LABELS } from "@/lib/constants";
import { agencyCopy } from "@/lib/agency-i18n";
import { clubCopy, type ClubLocale } from "@/lib/club-i18n";
import { guideCopy } from "@/lib/guide-i18n";
import { matchCopy } from "@/lib/match-i18n";
import { cockpitCopy } from "@/lib/cockpit-i18n";
import { getRoleHome } from "@/lib/auth";
import type { Profile } from "@/types/domain";
import { Button } from "@/components/ui/button";

export function AppShell({
  profile,
  locale,
  badge = 0,
  crestUrl,
  children
}: {
  profile: Profile;
  locale: ClubLocale;
  /** Club: unanswered KW suggestions. Admin: club answers not yet followed up. */
  badge?: number;
  /** Only for the screenshot preview; real pages use the club's stored logo. */
  crestUrl?: string;
  children: ReactNode;
}) {
  const t = clubCopy[locale].app;
  const agencyApp = agencyCopy[locale].app;
  const roleHome = getRoleHome(profile.role);
  const nav = getNav(profile, locale, badge);
  const showLanguageSwitcher = profile.role !== "admin";
  const languageLabel = profile.role === "agency" ? agencyApp.language : t.language;
  const roleLabel =
    profile.role === "club" ? t.role : profile.role === "agency" ? agencyApp.role : ROLE_LABELS[profile.role];
  const logoutLabel = profile.role === "admin" ? "Logout" : profile.role === "agency" ? agencyApp.logout : t.logout;
  const tagline =
    profile.role === "admin"
      ? "Kaderplanung & Spielervermittlung"
      : profile.role === "agency"
        ? profile.agency_name || agencyApp.tagline
        : profile.clubs?.name || t.tagline;
  const menuLabel = guideCopy[profile.role === "admin" ? "de" : locale].menu;

  const roleBadge = (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-100">
      <Shield className="h-4 w-4 text-brand-300" aria-hidden="true" />
      {roleLabel}
    </span>
  );

  const logout = (
    <form action={logoutAction}>
      <Button variant="ghost" className="text-white hover:bg-white/10" type="submit">
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {logoutLabel}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-950/95 text-white backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:gap-4 md:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link href={roleHome} prefetch={false} className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
              <Image
                src="/kw-sports-logo-white.svg"
                alt="KW Sports"
                width={2557}
                height={288}
                className="h-3.5 w-auto shrink-0 sm:h-5 md:h-6"
                priority
                unoptimized
              />
              <span className="flex min-w-0 items-center gap-2 border-l border-white/15 pl-2.5 sm:gap-3 sm:pl-3">
                {/* Club users always see their own crest next to the product name. */}
                {profile.role === "club" && profile.clubs ? (
                  <ClubCrest name={profile.clubs.name} logoUrl={crestUrl ?? clubLogoUrl(profile.clubs.logo_path)} size="sm" tone="dark" className="md:hidden" />
                ) : null}
                {profile.role === "club" && profile.clubs ? (
                  <ClubCrest name={profile.clubs.name} logoUrl={crestUrl ?? clubLogoUrl(profile.clubs.logo_path)} size="md" tone="dark" className="hidden md:inline-flex" />
                ) : null}
                <span className="min-w-0">
                  <span className="block whitespace-nowrap font-display text-lg uppercase leading-none tracking-[0.02em] sm:text-xl md:text-2xl">
                    Club Hub
                  </span>
                  <span className="mt-0.5 block truncate text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-300">
                    {tagline}
                  </span>
                </span>
              </span>
            </Link>

            {/* Desktop: everything in one row */}
            <div className="hidden flex-wrap items-center gap-2 text-sm md:flex">
              {showLanguageSwitcher ? <LanguageSwitcher locale={locale} label={languageLabel} /> : null}
              {roleBadge}
              {logout}
            </div>

            {/* Mobile: one menu button instead of the stacked controls */}
            <details className="group md:hidden">
              <summary
                aria-label={menuLabel}
                className="flex min-h-11 min-w-11 shrink-0 cursor-pointer list-none items-center justify-center gap-2 border border-white/15 px-3 text-[0.72rem] font-extrabold uppercase tracking-[0.12em] [&::-webkit-details-marker]:hidden"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
                {/* Icon only on small phones so the crest, "Club Hub" and the club name fit. */}
                <span className="hidden sm:inline">{menuLabel}</span>
              </summary>
              <div className="absolute inset-x-0 top-full border-b border-white/10 bg-navy-950 pb-4 shadow-cardHover">
                <NavLinks items={nav} variant="menu" className="border-b border-white/10 py-2" />
                <div className="flex flex-col gap-3 px-4 pt-4">
                  {showLanguageSwitcher ? <LanguageSwitcher locale={locale} label={languageLabel} /> : null}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {roleBadge}
                    {logout}
                  </div>
                </div>
              </div>
            </details>
          </div>

          <NavLinks items={nav} className="hidden md:block" />
        </div>
      </header>

      <main className="page-shell">{children}</main>
    </div>
  );
}

function getNav(profile: Profile, locale: ClubLocale, badge: number): NavItem[] {
  const t = clubCopy[locale].app;
  const icon = "h-4 w-4";

  if (profile.role === "admin") {
    return [
      { href: "/admin", label: "Bedarfe", icon: <FileDown className={icon} aria-hidden="true" /> },
      { href: "/admin/needs/new", label: "Neuer Bedarf", icon: <Plus className={icon} aria-hidden="true" /> },
      { href: "/admin/players", label: "Spieler", icon: <UserRound className={icon} aria-hidden="true" /> },
      { href: "/admin/inbox", label: "Antworten", icon: <Inbox className={icon} aria-hidden="true" />, badge },
      { href: "/admin/users", label: "Nutzer", icon: <Users className={icon} aria-hidden="true" /> }
    ];
  }

  if (profile.role === "agency") {
    return [{ href: "/agency", label: agencyCopy[locale].app.navNeeds, icon: <Eye className={icon} aria-hidden="true" /> }];
  }

  return [
    { href: "/club", label: cockpitCopy[locale].nav, icon: <LayoutDashboard className={icon} aria-hidden="true" /> },
    { href: "/club/suggestions", label: matchCopy[locale].nav, icon: <Sparkles className={icon} aria-hidden="true" />, badge },
    { href: "/club/squad", label: t.navSquad, icon: <Shirt className={icon} aria-hidden="true" /> },
    { href: "/club/needs/new", label: t.navNewNeed, icon: <Plus className={icon} aria-hidden="true" /> }
  ];
}
