import { AuthArena } from "@/features/auth/auth-arena";
import { AuthConfirm } from "@/features/auth/auth-confirm";
import { authCopy, parseAuthLocale } from "@/lib/auth-i18n";
import { getClubLocale } from "@/lib/club-locale";

export default async function AuthConfirmPage() {
  const locale = parseAuthLocale(await getClubLocale());
  const t = authCopy[locale];

  return (
    <AuthArena
      locale={locale}
      eyebrow={t.setPassword.arenaEyebrow}
      headline={t.login.headline}
      intro={t.login.intro}
      footer={t.login.footer}
    >
      <AuthConfirm copy={t.confirm} />
    </AuthArena>
  );
}
