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
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-l-2 border-brand-500 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="kw-title mt-2 text-[2.5rem] sm:text-[3.25rem]">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
