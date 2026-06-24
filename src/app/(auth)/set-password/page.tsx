import { SetPasswordForm } from "@/features/auth/set-password-form";
import { AuthLanguageSwitcher } from "@/components/layout/auth-language-switcher";
import { getClubLocale } from "@/lib/club-locale";
import { authCopy, parseAuthLocale } from "@/lib/auth-i18n";

export default async function SetPasswordPage() {
  const locale = parseAuthLocale(await getClubLocale());

  return (
    <main className="kw-stripes flex min-h-screen items-center justify-center bg-brand-500 px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-end">
          <AuthLanguageSwitcher locale={locale} />
        </div>
        <SetPasswordForm copy={authCopy[locale].setPassword} />
      </div>
    </main>
  );
}
