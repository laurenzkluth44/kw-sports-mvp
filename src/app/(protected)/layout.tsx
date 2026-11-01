import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { supabase, profile } = await requireUser();
  const locale = profile.role === "admin" ? "de" : await getClubLocale();

  // Nav badge. Access rules scope the count: a club only counts its own released suggestions.
  let badge = 0;
  if (profile.role === "club") {
    const { count } = await supabase
      .from("need_matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "freigegeben");
    badge = count ?? 0;
  } else if (profile.role === "admin") {
    const { count } = await supabase
      .from("need_matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "interessiert")
      .is("handled_at", null);
    badge = count ?? 0;
  }

  return (
    <AppShell profile={profile} locale={locale} badge={badge}>
      {children}
    </AppShell>
  );
}
