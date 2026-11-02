"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { AlertTriangle, Check, FileText, ImageIcon, Loader2, RotateCcw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { duplicatesToSkip, matchFile, type BulkKind, type BulkMatch } from "./bulk-match";
import { uploadPlayerFileAction } from "./actions";
import type { NeedType } from "@/types/domain";

export type BulkUploadPlayer = {
  id: string;
  first_name: string;
  last_name: string;
  kind: NeedType;
  has_photo: boolean;
  has_cv: boolean;
};

type Status = "ready" | "uploading" | "done" | "error";
type Row = {
  key: string;
  file: File;
  kind: BulkKind | null;
  playerId: string;
  problem: BulkMatch["problem"];
  include: boolean;
  duplicate: boolean;
  status: Status;
};

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const MAX_CV_BYTES = 10 * 1024 * 1024;
const PHOTO_MIME: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

const PROBLEM_TEXT: Record<NonNullable<BulkMatch["problem"]>, string> = {
  type: "Nur PDF (CV) oder JPG, PNG, WebP (Foto). Word-Dateien bitte vorher als PDF exportieren.",
  unmatched: "Kein Spieler mit diesem Namen gefunden. Bitte unten auswählen.",
  ambiguous: "Mehrere Spieler passen. Bitte unten auswählen."
};

/** Large photos are scaled down in the browser (longest side 1600 px) instead of being rejected. */
async function shrinkPhoto(file: File): Promise<File> {
  if (file.size <= MAX_PHOTO_BYTES) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}

/** Browsers sometimes drop the MIME type on drag and drop; the extension is reliable. */
function withType(file: File, kind: BulkKind): File {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  const type = kind === "cv" ? "application/pdf" : PHOTO_MIME[ext];
  return type && file.type !== type ? new File([file], file.name, { type }) : file;
}

export function BulkUpload({ players }: { players: BulkUploadPlayer[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const byId = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const incoming = Array.from(list).filter((file) => !rows.some((row) => row.file.name === file.name && row.file.size === file.size));
    const all = [...rows.map((row) => row.file), ...incoming];
    const matches = all.map((file) => ({ match: matchFile(file.name, players), size: file.size }));
    const skip = duplicatesToSkip(matches);
    setRows(
      all.map((file, index) => {
        const previous = rows[index];
        const { match } = matches[index];
        // Keep manual corrections on files that were already in the list.
        if (previous) return { ...previous, duplicate: skip.has(index), include: previous.include && !skip.has(index) };
        return {
          key: `${file.name}-${file.size}-${index}`,
          file,
          kind: match.kind,
          playerId: match.playerId ?? "",
          problem: match.problem,
          include: !match.problem && !skip.has(index),
          duplicate: skip.has(index),
          status: "ready"
        };
      })
    );
  };

  const update = (key: string, patch: Partial<Row>) => setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const tooBig = (row: Row) => row.kind === "cv" && row.file.size > MAX_CV_BYTES;
  const usable = (row: Row) => row.kind !== null && row.playerId !== "" && !tooBig(row);
  const queue = rows.filter((row) => row.include && usable(row) && row.status !== "done");
  const done = rows.filter((row) => row.status === "done").length;
  const failed = rows.filter((row) => row.status === "error").length;
  const open = rows.filter((row) => row.status !== "done" && (!usable(row) || !row.include)).length;

  const upload = async () => {
    setRunning(true);
    for (const row of queue) {
      update(row.key, { status: "uploading" });
      try {
        const file = row.kind === "photo" ? await shrinkPhoto(withType(row.file, "photo")) : withType(row.file, "cv");
        const formData = new FormData();
        formData.set("id", row.playerId);
        formData.set("kind", row.kind!);
        formData.set("file", file);
        const result = await uploadPlayerFileAction(formData);
        update(row.key, { status: result.ok ? "done" : "error" });
      } catch {
        update(row.key, { status: "error" });
      }
    }
    setRunning(false);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => a.last_name.localeCompare(b.last_name, "de") || a.first_name.localeCompare(b.first_name, "de")),
    [players]
  );

  return (
    <div className="space-y-5">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-6 text-center transition-colors",
          rows.length ? "min-h-36 py-6" : "min-h-64 py-10",
          dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/50",
          running && "pointer-events-none opacity-60"
        )}
      >
        <span aria-hidden="true" className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-brand-500" />
        <span aria-hidden="true" className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-brand-500" />
        <Upload className="h-9 w-9 text-brand-500" aria-hidden="true" />
        <span className="font-display text-3xl uppercase leading-none text-navy-950">
          {rows.length ? "Weitere Dateien hierher ziehen" : "CVs und Fotos hierher ziehen"}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">oder</span>
        <span className="inline-flex min-h-10 items-center gap-2 border border-navy-950 bg-navy-950 px-4 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-white">
          Dateien auswählen
        </span>
        <span className="max-w-xl text-xs leading-5 text-slate-500">
          Beliebig viele auf einmal. CVs als PDF, Fotos als JPG, PNG oder WebP. Die Zuordnung läuft über den Dateinamen, z.&nbsp;B.{" "}
          <code className="font-mono">20261027_KW_CV_Alexander_Schoss.pdf</code> oder <code className="font-mono">athlete-luca-krist.jpg</code>.
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {rows.length ? (
        <>
          <ul className="panel divide-y divide-slate-100">
            {rows.map((row) => {
              const player = row.playerId ? byId.get(row.playerId) : undefined;
              const replaces = player && row.kind && (row.kind === "cv" ? player.has_cv : player.has_photo);
              const blocked = !usable(row);
              const Icon = row.kind === "photo" ? ImageIcon : FileText;
              return (
                <li
                  key={row.key}
                  className={cn(
                    "grid gap-3 px-4 py-3 sm:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center",
                    !row.include && row.status !== "done" && "bg-slate-50/70"
                  )}
                >
                  <input
                    type="checkbox"
                    aria-label={`${row.file.name} hochladen`}
                    checked={row.include && !blocked}
                    disabled={blocked || running || row.status === "done"}
                    onChange={(event) => update(row.key, { include: event.target.checked })}
                    className="hidden h-4 w-4 accent-brand-500 sm:block"
                  />
                  <div className="flex min-w-0 items-start gap-3">
                    <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", row.kind ? "text-brand-500" : "text-slate-400")} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-navy-950" title={row.file.name}>
                        {row.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.kind === "cv" ? "CV" : row.kind === "photo" ? "Foto" : "Nicht unterstützt"} · {(row.file.size / 1024 / 1024).toFixed(1)} MB
                        {row.kind === "photo" && row.file.size > MAX_PHOTO_BYTES ? " · wird verkleinert" : ""}
                      </p>
                      {row.kind && row.problem && !row.playerId ? (
                        <p className="mt-1 text-xs font-semibold text-amber-800">{PROBLEM_TEXT[row.problem]}</p>
                      ) : null}
                      {!row.kind ? <p className="mt-1 text-xs font-semibold text-amber-800">{PROBLEM_TEXT.type}</p> : null}
                      {tooBig(row) ? <p className="mt-1 text-xs font-semibold text-amber-800">CV ist größer als 10 MB.</p> : null}
                      {row.duplicate && !row.include && row.status !== "done" ? (
                        <p className="mt-1 text-xs text-slate-500">Weitere Datei für denselben Spieler. Genommen wird der neueste deutsche CV.</p>
                      ) : null}
                    </div>
                  </div>
                  {row.kind ? (
                    <div className="min-w-0">
                      <select
                        aria-label={`Spieler für ${row.file.name}`}
                        value={row.playerId}
                        disabled={running || row.status === "done"}
                        onChange={(event) => update(row.key, { playerId: event.target.value, include: event.target.value !== "", problem: null })}
                        className={cn("w-full", !row.playerId && "border-amber-400")}
                      >
                        <option value="">Spieler wählen …</option>
                        {sortedPlayers.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.last_name}, {option.first_name}
                            {option.kind === "trainer" ? " (Trainer)" : ""}
                          </option>
                        ))}
                      </select>
                      {replaces && row.status !== "done" ? (
                        <p className="mt-1 text-xs text-slate-500">Ersetzt {row.kind === "cv" ? "den vorhandenen CV" : "das vorhandene Foto"}.</p>
                      ) : null}
                    </div>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <RowStatus status={row.status} />
                    {row.status !== "done" && !running ? (
                      <button
                        type="button"
                        onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                        aria-label={`${row.file.name} entfernen`}
                        className="flex h-9 w-9 items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-navy-950"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:border sm:px-5">
            <p className="text-sm text-slate-600">
              <strong className="text-navy-950">{queue.length}</strong> bereit
              {done ? <> · <strong className="text-navy-950">{done}</strong> hochgeladen</> : null}
              {open ? <> · {open} ausgelassen</> : null}
              {failed ? <> · <strong className="text-red-700">{failed} fehlgeschlagen</strong></> : null}
            </p>
            <div className="flex flex-wrap gap-2">
              {!running && done > 0 && queue.length === 0 ? (
                <>
                  <Button type="button" variant="secondary" onClick={() => setRows([])}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Neue Runde
                  </Button>
                  <Link href="/admin/players" className="inline-flex min-h-10 items-center gap-2 border border-brand-500 bg-brand-500 px-4 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-white">
                    Zur Spielerdatenbank
                  </Link>
                </>
              ) : (
                <Button type="button" variant="accent" disabled={running || queue.length === 0} onClick={upload}>
                  {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                  {running ? "Lädt hoch …" : `${queue.length} ${queue.length === 1 ? "Datei" : "Dateien"} hochladen`}
                </Button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function RowStatus({ status }: { status: Status }) {
  if (status === "uploading") return <Loader2 className="h-5 w-5 animate-spin text-brand-500" aria-label="Lädt hoch" />;
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-brand-600">
        <Check className="h-4 w-4" aria-hidden="true" /> Fertig
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-red-700">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Fehler
      </span>
    );
  return null;
}
