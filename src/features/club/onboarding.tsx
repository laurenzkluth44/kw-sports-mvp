import Link from "next/link";
import { ArrowRight, BookOpen, Check, Clock, FileDown, X } from "lucide-react";
import { quickstartPdf } from "@/features/help";
import { hideOnboardingAction } from "@/features/club/onboarding-actions";
import type { OnboardingStep } from "@/features/club/onboarding-model";
import type { ClubLocale } from "@/lib/club-i18n";
import { cockpitCopy, format } from "@/lib/cockpit-i18n";
import { cn } from "@/lib/utils";

type Copy = (typeof cockpitCopy)[ClubLocale];

function ActionLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 px-3 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] transition-colors",
        primary ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-slate-200 bg-white text-navy-950 hover:border-brand-500 hover:text-brand-600"
      )}
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}

function stepText(step: OnboardingStep, t: Copy) {
  switch (step.id) {
    case "access":
      return { title: t.obAccess, body: t.obAccessBody, actions: null };
    case "squad":
      return {
        title: t.obSquad,
        body: t.obSquadBody,
        actions: (
          <>
            <ActionLink href="/club/squad/import" label={t.obSquadImport} primary />
            <ActionLink href="/club/squad/new" label={t.obSquadAdd} />
          </>
        )
      };
    case "need":
      return { title: t.obNeed, body: t.obNeedBody, actions: <ActionLink href="/club/needs/new" label={t.obNeedAction} primary /> };
    case "answer":
      return step.state === "waiting"
        ? { title: t.obAnswer, body: t.obAnswerWaiting, actions: null }
        : { title: t.obAnswer, body: t.obAnswerBody, actions: <ActionLink href="/club/suggestions" label={t.obAnswerAction} primary /> };
  }
}

/** "Ready in three steps" checklist for new clubs, shown on the overview until the setup is done or hidden. */
export function ClubOnboarding({ steps, locale }: { steps: OnboardingStep[]; locale: ClubLocale }) {
  const t = cockpitCopy[locale];
  const done = steps.filter((step) => step.state === "done").length;
  // Only the first open step shows its buttons, so it's always clear what to do next.
  const current = steps.find((step) => step.state === "todo")?.id;

  return (
    <section aria-labelledby="onboarding-title" className="panel overflow-hidden border-t-[3px] border-brand-500">
      <div className="flex flex-col gap-3 px-5 pb-3 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{t.obEyebrow}</p>
          <h2 id="onboarding-title" className="mt-1 font-display text-3xl uppercase leading-none text-navy-950">
            {t.obTitle}
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">{t.obIntro}</p>
        </div>
        <div className="min-w-[10rem] sm:text-right">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-500">
            {format(t.obProgress, { done, total: steps.length })}
          </p>
          <div className="mt-1.5 flex gap-1" aria-hidden="true">
            {steps.map((step) => (
              <span key={step.id} className={cn("h-1.5 flex-1", step.state === "done" ? "bg-brand-500" : "bg-slate-200")} />
            ))}
          </div>
        </div>
      </div>

      <ol className="grid gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const text = stepText(step, t);
          const isCurrent = step.id === current;
          return (
            <li
              key={step.id}
              className={cn("flex flex-col gap-3 px-5 py-4", isCurrent ? "bg-brand-50" : "bg-white")}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center font-display text-lg leading-none",
                    step.state === "done" && "bg-brand-500 text-white",
                    step.state === "todo" && (isCurrent ? "bg-navy-950 text-white" : "border-2 border-navy-950 text-navy-950"),
                    step.state === "waiting" && "border-2 border-dashed border-slate-300 text-slate-400"
                  )}
                >
                  {step.state === "done" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : step.state === "waiting" ? (
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0">
                  <p className={cn("text-sm font-bold", step.state === "done" ? "text-slate-500 line-through decoration-brand-500/60" : "text-navy-950")}>
                    {text.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{text.body}</p>
                </div>
              </div>
              {isCurrent && text.actions ? <div className="flex flex-wrap gap-2 pl-10">{text.actions}</div> : null}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 bg-slate-50 px-5 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.08em]">
        <Link href="/help" prefetch={false} className="inline-flex items-center gap-1.5 text-navy-950 hover:text-brand-600">
          <BookOpen className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
          {t.obGuide}
        </Link>
        <a href={quickstartPdf(locale)} download className="inline-flex items-center gap-1.5 text-navy-950 hover:text-brand-600">
          <FileDown className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
          {t.obPdf}
        </a>
        <form action={hideOnboardingAction} className="ml-auto">
          <button type="submit" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-navy-950">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {t.obHide}
          </button>
        </form>
      </div>
    </section>
  );
}
