import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

/**
 * "Where am I, how do I get back": on phones a single back link to the parent page,
 * from tablet up the full trail (e.g. Bedarfe › HSG Musterstadt › Bearbeiten).
 */
export function Breadcrumbs({ items, label = "Navigationspfad" }: { items: Crumb[]; label?: string }) {
  const parent = [...items].reverse().find((item) => item.href);

  return (
    <nav aria-label={label} className="-mb-2">
      {parent?.href ? (
        <Link
          href={parent.href}
          className="inline-flex min-h-10 items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-brand-600 hover:text-brand-700 sm:hidden"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {parent.label}
        </Link>
      ) : null}
      <ol className="hidden flex-wrap items-center gap-1 text-[0.75rem] font-bold uppercase tracking-[0.1em] sm:flex">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {item.href && !last ? (
                <Link href={item.href} className="inline-flex min-h-10 items-center gap-2 text-brand-600 hover:text-brand-700">
                  {index === 0 ? <ArrowLeft className="h-4 w-4" aria-hidden="true" /> : null}
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="truncate text-slate-500">
                  {item.label}
                </span>
              )}
              {!last ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
