import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { ArenaPoints, AuthArena } from "@/features/auth/auth-arena";
import { getCurrentProfile, getRoleHome } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { authCopy, parseAuthLocale } from "@/lib/auth-i18n";

// Login "Arena": dark KW page, copy on the left, the login box on a handball court on the right.
export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const context = await getCurrentProfile();
  if (context) redirect(getRoleHome(context.profile.role));

  const locale = parseAuthLocale(await getClubLocale());
  const t = authCopy[locale].login;
  const params = await searchParams;
  const error = params.error ? t.errors[params.error] : null;
  const notice = params.notice === "password" ? t.passwordChanged : null;

  return (
    <AuthArena
      locale={locale}
      eyebrow={t.brand}
      headline={t.headline}
      intro={t.intro}
      footer={t.footer}
      aside={
        <ArenaPoints
          points={[
            { title: t.card1Title, body: t.card1Body },
            { title: t.card2Title, body: t.card2Body }
          ]}
        />
      }
    >
      <form action={loginAction} className="flex flex-col gap-4">
        <div>
          <p className="eyebrow">{t.portal}</p>
          <h2 className="mt-2 font-display text-[3.25rem] uppercase leading-[0.9]">{t.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
        </div>

        {notice ? <div className="alert-success">{notice}</div> : null}
        {error ? <div className="alert-error">{error}</div> : null}

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="field-label">
            {t.email}
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
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="field-label">
              {t.password}
            </label>
            <Link href="/forgot-password" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              {t.forgot}
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="min-h-12 border border-slate-200 px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <button
          type="submit"
          className="mt-1 inline-flex min-h-[52px] items-center justify-center gap-2 bg-brand-500 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-blueGlow transition-colors hover:bg-blue-bright"
        >
          {t.submit}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="text-xs leading-5 text-slate-500">{t.noAccess}</p>
      </form>
    </AuthArena>
  );
}
