import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-xs font-black uppercase text-brand-700">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-black uppercase text-navy-950 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
