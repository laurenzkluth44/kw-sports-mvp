import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { requestPasswordResetAction } from "@/features/auth/actions";
import { AuthArena } from "@/features/auth/auth-arena";
import { getClubLocale } from "@/lib/club-locale";
import { authCopy, parseAuthLocale } from "@/lib/auth-i18n";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const locale = parseAuthLocale(await getClubLocale());
  const t = authCopy[locale];
  const params = await searchParams;

  return (
    <AuthArena
      locale={locale}
      eyebrow={t.login.brand}
      headline={t.forgot.arenaHeadline}
      intro={t.forgot.arenaIntro}
      footer={t.login.footer}
    >
      <form action={requestPasswordResetAction} className="flex flex-col gap-4">
        <div>
          <p className="eyebrow">{t.forgot.eyebrow}</p>
          <h2 className="mt-2 font-display text-[2.75rem] uppercase leading-[0.9]">{t.forgot.title}</h2>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">{t.forgot.subtitle}</p>
        </div>

        {params.sent ? <div className="alert-success">{t.forgot.sent}</div> : null}
        {params.error ? <div className="alert-error">{t.forgot.error}</div> : null}

        <input type="hidden" name="locale" value={locale} />
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="field-label">
            {t.forgot.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-12 border border-slate-200 px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <button
          type="submit"
          className="mt-1 inline-flex min-h-[52px] items-center justify-center gap-2 bg-brand-500 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-blueGlow transition-colors hover:bg-blue-bright"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {t.forgot.submit}
        </button>
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t.forgot.back}
        </Link>
      </form>
    </AuthArena>
  );
}
