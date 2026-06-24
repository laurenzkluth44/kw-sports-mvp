import { redirect } from "next/navigation";
import Image from "next/image";
import { Database, LockKeyhole, LogIn } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { AuthLanguageSwitcher } from "@/components/layout/auth-language-switcher";
import { getCurrentProfile, getRoleHome } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { authCopy, parseAuthLocale } from "@/lib/auth-i18n";

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

  return (
    <main className="grid min-h-screen bg-[#f6f8fb] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="kw-stripes relative hidden overflow-hidden bg-navy-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span className="pointer-events-none absolute -right-24 top-1/3 select-none font-display text-[18rem] leading-none text-white/[0.03]">
          KW
        </span>
        <div className="relative">
          <Image
            src="/kw-sports-logo-white.svg"
            alt="KW Sports"
            width={2557}
            height={288}
            className="h-9 w-auto"
            priority
            unoptimized
          />
          <p className="eyebrow mt-10 text-brand-300 before:bg-brand-300">{t.brand}</p>
          <h1 className="mt-4 max-w-xl font-display text-7xl uppercase leading-[0.9] tracking-[-0.01em]">
            {t.headline}
          </h1>
          <p className="mt-5 max-w-lg text-base font-light leading-7 text-slate-300">{t.intro}</p>
          <div className="mt-8 grid max-w-lg gap-3">
            <div className="kw-stripes rounded-sm border-l-2 border-l-white bg-brand-500 px-4 py-3 text-white">
              <Database className="mb-3 h-5 w-5 text-white" aria-hidden="true" />
              <p className="text-sm font-bold uppercase tracking-[0.08em]">{t.card1Title}</p>
              <p className="mt-1 text-sm leading-6 text-white/80">{t.card1Body}</p>
            </div>
            <div className="kw-stripes rounded-sm border-l-2 border-l-white bg-brand-500 px-4 py-3 text-white">
              <LockKeyhole className="mb-3 h-5 w-5 text-white" aria-hidden="true" />
              <p className="text-sm font-bold uppercase tracking-[0.08em]">{t.card2Title}</p>
              <p className="mt-1 text-sm leading-6 text-white/80">{t.card2Body}</p>
            </div>
          </div>
        </div>
        <p className="relative text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {t.footer}
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:hidden">
              <Image
                src="/kw-sports-logo.svg"
                alt="KW Sports"
                width={2557}
                height={288}
                className="h-7 w-auto"
                priority
                unoptimized
              />
              <span className="border-l border-slate-200 pl-3">
                <span className="block font-display text-xl uppercase leading-none text-navy-950">Club Needs</span>
                <span className="block text-xs text-neutral-500">{t.mobileSubtitle}</span>
              </span>
            </div>
            <div className="ml-auto">
              <AuthLanguageSwitcher locale={locale} />
            </div>
          </div>

          <form action={loginAction} className="panel space-y-5 border-l-2 border-l-brand-500 p-6">
            <div>
              <p className="eyebrow">{t.portal}</p>
              <h2 className="kw-title mt-2 text-4xl">{t.title}</h2>
              <p className="mt-1 text-sm text-neutral-600">{t.subtitle}</p>
            </div>

            {error ? (
              <div className="alert-error">{error}</div>
            ) : null}

            <Field label={t.email} htmlFor="email">
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>

            <Field label={t.password} htmlFor="password">
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </Field>

            <Button type="submit" className="w-full">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {t.submit}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
