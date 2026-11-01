import type { ReactNode } from "react";

/** Large KW-style message panel for 404 / error states: ghost number, display title, clear way back. */
export function StatusScreen({
  ghost,
  eyebrow,
  title,
  body,
  actions
}: {
  ghost: string;
  eyebrow: string;
  title: string;
  body: string;
  actions: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 px-6 py-14 text-white shadow-card sm:px-12 sm:py-20">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 font-display text-[12rem] leading-[0.8] text-white/[0.06] sm:text-[20rem]"
      >
        {ghost}
      </span>
      <div className="relative max-w-xl space-y-5">
        <p className="eyebrow eyebrow-light">{eyebrow}</p>
        <h1 className="font-display text-[3.25rem] uppercase leading-[0.88] sm:text-[4.5rem]">{title}</h1>
        <p className="text-base font-light leading-7 text-white/75">{body}</p>
        <div className="flex flex-wrap gap-3 pt-2">{actions}</div>
      </div>
    </section>
  );
}
