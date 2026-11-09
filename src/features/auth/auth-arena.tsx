import Image from "next/image";
import { LEGAL_URLS, legalLabels } from "@/lib/legal";
import type { ReactNode } from "react";
import { AuthLanguageSwitcher } from "@/components/layout/auth-language-switcher";
import { CourtLines } from "@/features/court/court";
import type { AuthLocale } from "@/lib/auth-i18n";

/**
 * Shared "Arena" layout for all signed-out screens (login, set password, forgot password, invite):
 * dark KW page, copy on the left, a white box on a handball court on the right.
 */
export function AuthArena({
  locale,
  eyebrow,
  headline,
  intro,
  aside,
  footer,
  children
}: {
  locale: AuthLocale;
  eyebrow: string;
  /** First word white, the rest blue. */
  headline: string;
  intro: string;
  aside?: ReactNode;
  footer: string;
  children: ReactNode;
}) {
  const [headFirst, ...headRest] = headline.split(" ");

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-navy-950 text-white">
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

      <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 pb-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-12">
        <div className="flex max-w-[540px] flex-col gap-5">
          <p className="eyebrow eyebrow-light">{eyebrow}</p>
          <h1 className="font-display text-[4.5rem] uppercase leading-[0.84] tracking-[-0.01em] sm:text-[7rem]">
            {headFirst} {headRest.length > 0 ? <span className="block text-brand-500">{headRest.join(" ")}</span> : null}
          </h1>
          <p className="text-base font-light leading-7 text-white/75 sm:text-[1.05rem]">{intro}</p>
          {aside}
        </div>

        <div className="relative flex items-center justify-center lg:min-h-[560px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[118%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 opacity-80 lg:block"
            style={{ aspectRatio: "224 / 196" }}
          >
            <CourtLines crop="full" />
          </div>

          <div className="relative w-full max-w-[420px] lg:mt-24">
            <span aria-hidden="true" className="absolute -left-2.5 -top-2.5 h-7 w-7 border-l-[3px] border-t-[3px] border-brand-500" />
            <span aria-hidden="true" className="absolute -bottom-2.5 -right-2.5 h-7 w-7 border-b-[3px] border-r-[3px] border-brand-500" />
            <div className="bg-white p-6 text-navy-950 shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:p-8">{children}</div>
          </div>
        </div>
      </div>

      <footer className="relative flex flex-wrap justify-between gap-3 px-5 pb-6 pt-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/70 sm:px-10 lg:px-12">
        <span>{footer}</span>
        <span className="flex flex-wrap gap-x-5 gap-y-2">
          <a href={LEGAL_URLS.imprint} className="text-white/70 hover:text-white">
            {legalLabels[locale].imprint}
          </a>
          <a href={LEGAL_URLS.privacy} className="text-white/70 hover:text-white">
            {legalLabels[locale].privacy}
          </a>
          <a href="https://www.kwsports.de" className="text-white/70 hover:text-white">
            kwsports.de
          </a>
        </span>
      </footer>
    </main>
  );
}

/** Two short value points under the headline. */
export function ArenaPoints({ points }: { points: { title: string; body: string }[] }) {
  return (
    <div className="grid gap-5 pt-2 sm:grid-cols-2">
      {points.map((point) => (
        <div key={point.title} className="border-l-[3px] border-brand-500 pl-4">
          <p className="text-sm font-bold">{point.title}</p>
          <p className="mt-1 text-[0.82rem] leading-5 text-white/65">{point.body}</p>
        </div>
      ))}
    </div>
  );
}

/** Numbered onboarding steps (set-password screen). */
export function ArenaSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-col gap-3 pt-2">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-500 font-display text-xl">{index + 1}</span>
          <span className="text-sm font-semibold text-white/85">{step}</span>
        </li>
      ))}
    </ol>
  );
}
