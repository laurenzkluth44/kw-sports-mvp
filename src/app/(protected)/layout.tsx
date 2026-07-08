import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireUser();
  const locale = profile.role === "admin" ? "de" : await getClubLocale();

  return (
    <AppShell profile={profile} locale={locale}>
      {children}
    </AppShell>
  );
}
