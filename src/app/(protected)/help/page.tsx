import { requireUser } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { getGuide, helpChrome, quickstartPdf, type GuideKind } from "@/features/help";
import { HelpView } from "@/features/help/help-view";

export const metadata = { title: "Hilfe" };

export default async function HelpPage({ searchParams }: { searchParams: Promise<{ guide?: string }> }) {
  const { profile } = await requireUser();
  const params = await searchParams;
  const isAdmin = profile.role === "admin";
  const locale = isAdmin ? "de" : await getClubLocale();

  // Each role sees its own guide; KW admins can also open the club and agency guides.
  const requested = params.guide === "club" || params.guide === "agency" || params.guide === "admin" ? params.guide : null;
  const kind: GuideKind = isAdmin ? (requested ?? "admin") : profile.role === "agency" ? "agency" : "club";

  return (
    <HelpView
      guide={getGuide(kind, locale)}
      chrome={helpChrome[locale]}
      kind={kind}
      switchable={isAdmin}
      pdfHref={kind === "club" ? quickstartPdf(locale) : undefined}
    />
  );
}
