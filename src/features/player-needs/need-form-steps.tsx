"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { NeedFormFlowCopy } from "@/lib/need-form-i18n";
import { cn } from "@/lib/utils";

type Validatable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function stepOfText(template: string, step: number, total: number) {
  return template.replace("{step}", String(step)).replace("{total}", String(total));
}

function isValidatable(element: Element): element is Validatable {
  return (
    element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement
  );
}

/** Positions for players, a role for coaches: the same rule the server action enforces. */
function missingPositionOrRole(form: HTMLFormElement) {
  const data = new FormData(form);
  if (data.get("need_type") === "trainer") return !data.get("coach_role");
  return data.getAll("attack_positions").length === 0 && data.getAll("defense_positions").length === 0;
}

/**
 * Shows the need form one step at a time. All steps stay in the DOM (only hidden),
 * so the form still submits every field in one go and nothing typed is lost when
 * moving back and forth. Validation runs across all steps and jumps to the step
 * that needs attention.
 */
export function NeedFormSteps({
  steps,
  copy,
  submit,
  submitOnEveryStep = false
}: {
  steps: ReactNode[];
  copy: NeedFormFlowCopy;
  submit: ReactNode;
  submitOnEveryStep?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const pendingFocus = useRef<Validatable | null>(null);
  const shouldScroll = useRef(false);
  const last = steps.length - 1;

  useEffect(() => {
    if (shouldScroll.current && ref.current) {
      // The app header is sticky, so scroll to just below it instead of to the very top.
      const header = document.querySelector("header");
      const offset = (header?.getBoundingClientRect().height ?? 0) + 16;
      const top = ref.current.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      shouldScroll.current = false;
    }
    if (pendingFocus.current) {
      const element = pendingFocus.current;
      pendingFocus.current = null;
      requestAnimationFrame(() => element.reportValidity());
    }
  }, [current]);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    // Hidden steps can't show the browser's own validation bubble, so validation runs here.
    form.noValidate = true;

    function handleSubmit(event: SubmitEvent) {
      if (missingPositionOrRole(form!)) {
        event.preventDefault();
        shouldScroll.current = true;
        setCurrent(0);
        return;
      }
      const invalid = Array.from(form!.elements).find((element) => isValidatable(element) && !element.checkValidity());
      if (invalid && isValidatable(invalid)) {
        event.preventDefault();
        const index = Number(invalid.closest("[data-step-index]")?.getAttribute("data-step-index") ?? 0);
        pendingFocus.current = invalid;
        shouldScroll.current = true;
        setCurrent(index);
      }
    }

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  function go(index: number) {
    shouldScroll.current = true;
    setCurrent(index);
  }

  function next() {
    const section = ref.current?.querySelector(`[data-step-index="${current}"]`);
    const form = ref.current?.closest("form");
    if (current === 0 && form && missingPositionOrRole(form)) {
      // Let the form's guard show its message, then stay on this step.
      form.requestSubmit();
      return;
    }
    const invalid = section
      ? Array.from(section.querySelectorAll("input, select, textarea")).find(
          (element) => isValidatable(element) && !element.checkValidity()
        )
      : undefined;
    if (invalid && isValidatable(invalid)) {
      invalid.reportValidity();
      return;
    }
    go(Math.min(current + 1, last));
  }

  return (
    <div ref={ref}>
      <nav aria-label={stepOfText(copy.stepOf, current + 1, steps.length)} className="grid grid-cols-2 gap-[2px] bg-slate-200 sm:grid-cols-4">
        {copy.steps.slice(0, steps.length).map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => go(index)}
            aria-current={index === current ? "step" : undefined}
            className={cn(
              "flex min-h-14 items-center gap-3 border-b-[3px] bg-white px-4 text-left text-[0.72rem] font-extrabold uppercase tracking-[0.08em] transition-colors",
              index === current
                ? "border-brand-500 text-navy-950"
                : index < current
                  ? "border-navy-950 text-navy-950 hover:bg-slate-50"
                  : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-navy-950"
            )}
          >
            <span className={cn("font-display text-[1.7rem] leading-none", index === current ? "text-brand-500" : "")}>
              {index + 1}
            </span>
            {label}
          </button>
        ))}
      </nav>

      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-brand-600">
          {stepOfText(copy.stepOf, current + 1, steps.length)}
        </p>
        <p className="mt-1 text-sm text-slate-600">{copy.stepHints[current]}</p>
      </div>

      {steps.map((step, index) => (
        <div key={index} data-step-index={index} hidden={index !== current}>
          {step}
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-5">
        {current > 0 ? (
          <button
            type="button"
            onClick={() => go(current - 1)}
            className="inline-flex min-h-11 items-center gap-2 border border-slate-300 bg-white px-4 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-navy-950 hover:border-brand-300 hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {copy.back}
          </button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
          {current < last ? (
            <button
              type="button"
              onClick={next}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 px-5 text-[0.8rem] font-bold uppercase tracking-[0.08em]",
                submitOnEveryStep
                  ? "border border-slate-300 bg-white text-navy-950 hover:border-brand-300 hover:text-brand-600"
                  : "border border-brand-500 bg-brand-500 text-white shadow-blueGlow hover:bg-blue-bright"
              )}
            >
              {copy.next}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          {current === last || submitOnEveryStep ? submit : null}
        </div>
      </div>
    </div>
  );
}
