import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-navy-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
