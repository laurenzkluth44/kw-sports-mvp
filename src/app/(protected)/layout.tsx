import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireUser();

  return <AppShell profile={profile}>{children}</AppShell>;
}
