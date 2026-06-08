import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-5 h-1 w-16 rounded-full bg-brand-500" />
      <h2 className="text-xl font-black text-navy-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
