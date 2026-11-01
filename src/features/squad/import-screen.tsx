"use client";

import { useActionState, useMemo, useRef, useState, type DragEvent } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, RotateCcw, Upload } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ImportIssue } from "@/features/squad/import-parse";
import type { SquadImportState } from "@/features/squad/import-actions";
import type { SquadImportCopy } from "@/lib/squad-import-i18n";
import { cn, formatDate } from "@/lib/utils";
import type { ClubLocale } from "@/lib/club-i18n";

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/**
 * Two steps on one screen: drop a file → see exactly what will be imported → confirm.
 * Nothing is saved before the club confirms; every row is checked again on the server.
 */
export function SquadImportScreen(props: {
  t: SquadImportCopy;
  locale: ClubLocale;
  previewAction: (state: SquadImportState, formData: FormData) => Promise<SquadImportState>;
  commitAction: (formData: FormData) => Promise<void>;
  initialState?: SquadImportState;
  saveError?: boolean;
}) {
  // "Other file" remounts the flow, so the previous preview can't flash back.
  const [round, setRound] = useState(0);
  return <ImportFlow key={round} {...props} initialState={round === 0 ? props.initialState : undefined} saveError={round === 0 && props.saveError} onRestart={() => setRound((value) => value + 1)} />;
}

function ImportFlow({
  t,
  locale,
  previewAction,
  commitAction,
  initialState = { status: "idle" },
  saveError,
  onRestart
}: {
  t: SquadImportCopy;
  locale: ClubLocale;
  previewAction: (state: SquadImportState, formData: FormData) => Promise<SquadImportState>;
  commitAction: (formData: FormData) => Promise<void>;
  initialState?: SquadImportState;
  saveError?: boolean;
  onRestart: () => void;
}) {
  const [state, formAction, pending] = useActionState(previewAction, initialState);

  if (state.status === "preview") {
    return <Preview state={state} t={t} locale={locale} commitAction={commitAction} onRestart={onRestart} />;
  }

  const errorText =
    state.status === "error"
      ? { file: t.errorFile, legacy: t.errorLegacy, size: t.errorSize, header: t.errorHeader }[state.code]
      : saveError
        ? t.errorSave
        : null;

  return <UploadStep t={t} formAction={formAction} pending={pending} errorText={errorText} />;
}

function UploadStep({
  t,
  formAction,
  pending,
  errorText
}: {
  t: SquadImportCopy;
  formAction: (formData: FormData) => void;
  pending: boolean;
  errorText: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = event.dataTransfer.files;
    if (!files.length || !inputRef.current) return;
    inputRef.current.files = files;
    formRef.current?.requestSubmit();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <form ref={formRef} action={formAction} className="panel p-5">
        {errorText ? (
          <div role="alert" className="alert-error mb-4 flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {errorText}
          </div>
        ) : null}
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative flex min-h-64 cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/50",
            pending && "pointer-events-none opacity-70"
          )}
        >
          <span aria-hidden="true" className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-brand-500" />
          <span aria-hidden="true" className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-brand-500" />
          {pending ? (
            <Loader2 className="h-10 w-10 animate-spin text-brand-500" aria-hidden="true" />
          ) : (
            <FileSpreadsheet className="h-10 w-10 text-brand-500" aria-hidden="true" />
          )}
          <span className="font-display text-3xl uppercase leading-none text-navy-950">{pending ? t.reading : t.drop}</span>
          {!pending ? (
            <>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.or}</span>
              <span className="inline-flex min-h-10 items-center gap-2 border border-navy-950 bg-navy-950 px-4 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-white">
                <Upload className="h-4 w-4" aria-hidden="true" />
                {t.choose}
              </span>
              <span className="text-xs text-slate-500">{t.formats}</span>
            </>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="sr-only"
            onChange={() => formRef.current?.requestSubmit()}
          />
        </label>
      </form>

      <aside className="panel flex flex-col gap-4 p-5">
        <h2 className="section-heading">{t.template}</h2>
        <p className="text-sm text-slate-600">{t.templateHint}</p>
        <p className="border-l-2 border-brand-500 pl-3 text-sm text-slate-700">{t.needed}</p>
        <a
          href="/club/squad/import/template"
          download
          className="inline-flex min-h-10 items-center gap-2 self-start border border-slate-200 bg-white px-4 py-2 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-navy-950 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {t.template}
        </a>
      </aside>
    </div>
  );
}

const ISSUE_KEY: Record<ImportIssue, "issueName" | "issuePosition" | "issueContract" | "issueDuplicate"> = {
  name: "issueName",
  position: "issuePosition",
  contract: "issueContract",
  duplicate: "issueDuplicate"
};

function Preview({
  state,
  t,
  locale,
  commitAction,
  onRestart
}: {
  state: Extract<SquadImportState, { status: "preview" }>;
  t: SquadImportCopy;
  locale: ClubLocale;
  commitAction: (formData: FormData) => Promise<void>;
  onRestart: () => void;
}) {
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const chosen = useMemo(() => state.rows.filter((item) => !excluded.has(item.line)).map((item) => item.row), [state.rows, excluded]);
  const allOn = excluded.size === 0;
  const count = chosen.length;

  const toggle = (line: number) =>
    setExcluded((current) => {
      const next = new Set(current);
      if (next.has(line)) next.delete(line);
      else next.add(line);
      return next;
    });

  return (
    <div className="space-y-5">
      <section className="panel overflow-hidden">
        <header className="flex flex-wrap items-end justify-between gap-3 bg-navy-950 px-5 py-5 text-white">
          <div>
            <p className="eyebrow eyebrow-light">{fill(t.from, { file: state.fileName })}</p>
            <h2 className="mt-2 font-display text-[2.4rem] uppercase leading-[0.9]">
              {state.rows.length === 0 ? t.previewNone : state.rows.length === 1 ? t.previewTitleOne : fill(t.previewTitle, { n: state.rows.length })}
            </h2>
            {state.rows.length > 1 ? <p className="mt-1 text-sm text-white/65">{t.hintUntick}</p> : null}
          </div>
          <Button type="button" variant="ghost" onClick={onRestart} className="border-white/20 text-white">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t.other}
          </Button>
        </header>

        {state.rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      aria-label={t.include}
                      checked={allOn}
                      onChange={() => setExcluded(allOn ? new Set(state.rows.map((item) => item.line)) : new Set())}
                      className="h-4 w-4 accent-brand-500"
                    />
                  </th>
                  <th className="px-2 py-3">{t.colNumber}</th>
                  <th className="px-2 py-3">{t.colName}</th>
                  <th className="px-2 py-3">{t.colPosition}</th>
                  <th className="px-2 py-3">{t.colDefense}</th>
                  <th className="px-5 py-3">{t.colContract}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.rows.map(({ line, row }) => {
                  const on = !excluded.has(line);
                  return (
                    <tr key={line} className={cn("transition-colors", on ? "bg-white" : "bg-slate-50 text-slate-400")}>
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          aria-label={`${t.include}: ${row.first_name} ${row.last_name}`}
                          checked={on}
                          onChange={() => toggle(line)}
                          className="h-4 w-4 accent-brand-500"
                        />
                      </td>
                      <td className="px-2 py-3 font-display text-lg">{row.jersey_number ?? "–"}</td>
                      <td className={cn("px-2 py-3 font-bold", !on && "line-through")}>
                        {row.first_name} {row.last_name}
                      </td>
                      <td className="px-2 py-3">
                        <span className={cn("px-2 py-0.5 text-[0.7rem] font-extrabold tracking-[0.1em]", on ? "bg-brand-500 text-white" : "bg-slate-200")}>
                          {row.position}
                        </span>
                        {row.secondary_positions.length ? (
                          <span className="ml-1.5 text-xs text-slate-500">+ {row.secondary_positions.join(" · ")}</span>
                        ) : null}
                      </td>
                      <td className="px-2 py-3 text-slate-600">{row.defense_positions.length ? row.defense_positions.map((p) => `A${p}`).join(" · ") : "–"}</td>
                      <td className="px-5 py-3 tabular-nums">{formatDate(row.contract_until, locale)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {state.skipped.length > 0 ? (
          <div className="border-t border-amber-200 bg-amber-50/70 px-5 py-4">
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-amber-900">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {state.skipped.length === 1 ? t.skippedTitleOne : fill(t.skippedTitle, { n: state.skipped.length })}
            </h3>
            <ul className="mt-2 grid gap-1 text-sm text-amber-950 sm:grid-cols-2">
              {state.skipped.slice(0, 20).map((item) => (
                <li key={item.line} className="flex gap-2">
                  <span className="shrink-0 font-bold tabular-nums">{fill(t.row, { n: item.line })}</span>
                  <span className="min-w-0 truncate">
                    {item.label} · {t[ISSUE_KEY[item.issue]]}
                    {item.value ? ` („${item.value}“)` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <form action={commitAction} className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 shadow-[0_-8px_24px_rgba(10,10,10,0.06)] backdrop-blur">
        <input type="hidden" name="rows" value={JSON.stringify(chosen)} />
        <LinkButton href="/club/squad" variant="secondary">
          {t.cancel}
        </LinkButton>
        <SubmitButton variant="accent" disabled={count === 0} pendingLabel={t.importing}>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {count === 1 ? t.importOne : fill(t.import, { n: count })}
        </SubmitButton>
      </form>
    </div>
  );
}
