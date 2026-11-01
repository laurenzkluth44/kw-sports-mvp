import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { AuthLanguageSwitcher } from "@/components/layout/auth-language-switcher";
import { CourtLines } from "@/features/court/court";
import { getCurrentProfile, getRoleHome } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { authCopy, parseAuthLocale } from "@/lib/auth-i18n";

// Login "Arena": dark KW page, copy and form on the left, the handball court on the right.
export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const context = await getCurrentProfile();
  if (context) redirect(getRoleHome(context.profile.role));

  const locale = parseAuthLocale(await getClubLocale());
  const t = authCopy[locale].login;
  const params = await searchParams;
  const error = params.error ? t.errors[params.error] : null;
  const [headFirst, ...headRest] = t.headline.split(" ");

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-navy-950 text-white">
      {/* Court: right half only, so it never runs behind the text or the form. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[3%] top-1/2 hidden w-[44%] max-w-[640px] -translate-y-1/2 -rotate-90 lg:block"
        style={{ aspectRatio: "224 / 196" }}
      >
        <CourtLines crop="full" />
      </div>

      <header className="relative flex items-center justify-between gap-4 px-5 py-6 sm:px-10 lg:px-12">
        <Image
          src="/kw-sports-logo-white.svg"
          alt="KW Sports"
          width={2557}
          height={288}
          className="h-6 w-auto sm:h-7"
          priority
          unoptimized
        />
        <AuthLanguageSwitcher locale={locale} tone="dark" />
      </header>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 items-center px-5 pb-8 sm:px-10 lg:px-12">
        <div className="flex w-full max-w-[520px] flex-col gap-7">
          <div className="flex flex-col gap-4">
            <p className="eyebrow eyebrow-light">{t.brand}</p>
            <h1 className="font-display text-[4.5rem] uppercase leading-[0.84] tracking-[-0.01em] sm:text-[6rem]">
              {headFirst} <span className="text-brand-500">{headRest.join(" ")}</span>
            </h1>
            <p className="text-base font-light leading-7 text-white/75 sm:text-[1.05rem]">{t.intro}</p>
            <div className="grid gap-5 pt-1 sm:grid-cols-2">
              <div className="border-l-[3px] border-brand-500 pl-4">
                <p className="text-sm font-bold">{t.card1Title}</p>
                <p className="mt-1 text-[0.82rem] leading-5 text-white/65">{t.card1Body}</p>
              </div>
              <div className="border-l-[3px] border-brand-500 pl-4">
                <p className="text-sm font-bold">{t.card2Title}</p>
                <p className="mt-1 text-[0.82rem] leading-5 text-white/65">{t.card2Body}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <span aria-hidden="true" className="absolute -left-2.5 -top-2.5 h-7 w-7 border-l-[3px] border-t-[3px] border-brand-500" />
            <span aria-hidden="true" className="absolute -bottom-2.5 -right-2.5 h-7 w-7 border-b-[3px] border-r-[3px] border-brand-500" />
            <form action={loginAction} className="flex flex-col gap-4 bg-white p-6 text-navy-950 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-7">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-[2.75rem] uppercase leading-[0.9]">{t.title}</h2>
                <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-slate-500">{t.portal}</span>
              </div>

              {error ? <div className="alert-error">{error}</div> : null}

              <div className="grid gap-4 sm:grid-cols-2">
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
                  <label htmlFor="password" className="field-label">
                    {t.password}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="min-h-12 border border-slate-200 px-3.5 text-[0.95rem] outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-brand-500 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-blueGlow transition-colors hover:bg-blue-bright"
              >
                {t.submit}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-xs leading-5 text-slate-500">{t.noAccess}</p>
            </form>
          </div>
        </div>
      </div>

      <footer className="relative flex flex-wrap justify-between gap-3 px-5 pb-6 pt-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/50 sm:px-10 lg:px-12">
        <span>{t.footer}</span>
        <a href="https://www.kwsports.de" className="text-white/70 hover:text-white">
          kwsports.de
        </a>
      </footer>
    </main>
  );
}
