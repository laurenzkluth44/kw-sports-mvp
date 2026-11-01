import { ArenaSteps, AuthArena } from "@/features/auth/auth-arena";
import { SetPasswordForm } from "@/features/auth/set-password-form";
import { getClubLocale } from "@/lib/club-locale";
import { authCopy, parseAuthLocale } from "@/lib/auth-i18n";

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const locale = parseAuthLocale(await getClubLocale());
  const t = authCopy[locale];
  const mode = (await searchParams).mode === "reset" ? "reset" : "invite";

  return (
    <AuthArena
      locale={locale}
      eyebrow={t.setPassword.arenaEyebrow}
      headline={mode === "reset" ? t.setPassword.resetArenaHeadline : t.setPassword.arenaHeadline}
      intro={mode === "reset" ? t.setPassword.resetArenaIntro : t.setPassword.arenaIntro}
      aside={mode === "invite" ? <ArenaSteps steps={t.setPassword.arenaSteps} /> : null}
      footer={t.login.footer}
    >
      <SetPasswordForm copy={t.setPassword} mode={mode} />
    </AuthArena>
  );
}
