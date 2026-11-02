"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Jump navigation for long forms: numbered sections, the one in view highlighted.
 * Vertical and sticky next to the form on large screens, a scrollable strip on phones.
 */
export function FormSectionNav({ sections, label }: { sections: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const elements = sections.map((section) => document.getElementById(section.id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A section counts as current while it crosses the upper third of the screen.
      { rootMargin: "-30% 0px -60% 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label={label}
      className="sticky top-[4.3rem] z-10 md:top-[8.4rem] -mx-4 overflow-x-auto border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:mx-0 lg:overflow-visible lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none"
    >
      <ol className="flex gap-1 py-2 lg:flex-col lg:gap-0 lg:py-0">
        {sections.map((section, index) => {
          const current = section.id === active;
          return (
            <li key={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                aria-current={current ? "location" : undefined}
                onClick={() => setActive(section.id)}
                className={cn(
                  "flex min-h-10 items-center gap-2.5 whitespace-nowrap px-3 text-xs font-extrabold uppercase tracking-[0.08em] transition-colors lg:min-h-11 lg:border-l-2",
                  current
                    ? "bg-navy-950 text-white lg:border-brand-500 lg:bg-transparent lg:text-navy-950"
                    : "text-slate-600 hover:text-navy-950 lg:border-slate-200"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center font-display text-sm leading-none",
                    current ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {index + 1}
                </span>
                {section.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
