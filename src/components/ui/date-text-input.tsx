"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function DateTextInput({
  id,
  name,
  defaultValue,
  required = false
}: {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const initialValue = normalizeDateInput(defaultValue || "") || "";
  const [value, setValue] = useState(initialValue);
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthDate(initialValue));
  const days = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  function commitDate(nextValue: string) {
    setValue(nextValue);
    setDisplayValue(nextValue);
    setVisibleMonth(getMonthDate(nextValue));
    setOpen(false);
  }

  function handleDisplayChange(nextValue: string) {
    setDisplayValue(nextValue);

    const normalized = normalizeDateInput(nextValue);
    setValue(normalized || "");
    if (normalized) setVisibleMonth(getMonthDate(normalized));
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value} />
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="YYYY-MM-DD"
        pattern="(\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[./-]\\d{1,2}[./-]\\d{4})"
        value={displayValue}
        onChange={(event) => handleDisplayChange(event.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          const normalized = normalizeDateInput(displayValue);
          if (normalized) {
            setValue(normalized);
            setDisplayValue(normalized);
          }
        }}
        required={required}
        className="pr-20 pl-9"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            setDisplayValue("");
            setOpen(false);
          }}
          className="absolute right-11 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-navy-950"
          aria-label="Datum leeren"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100"
        aria-label="Kalender öffnen"
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute left-0 z-40 mt-2 w-full min-w-[18rem] rounded-md border border-slate-200 bg-white p-3 shadow-soft sm:w-80">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-navy-950 hover:bg-slate-50"
              aria-label="Vorheriger Monat"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-sm font-black uppercase text-navy-950">{formatMonthLabel(visibleMonth)}</p>
            <button
              type="button"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-navy-950 hover:bg-slate-50"
              aria-label="Nächster Monat"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdayLabels.map((weekday) => (
              <span key={weekday} className="py-1 text-xs font-black uppercase text-slate-400">
                {weekday}
              </span>
            ))}
            {days.map((day) => {
              const isoValue = formatDateValue(day.date);
              const selected = isoValue === value;
              const today = isoValue === formatDateValue(new Date());

              return (
                <button
                  key={isoValue}
                  type="button"
                  onClick={() => commitDate(isoValue)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-md text-sm font-bold transition",
                    day.inCurrentMonth ? "text-navy-950" : "text-slate-300",
                    today && !selected ? "bg-slate-100 text-navy-950" : "",
                    selected ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25" : "hover:bg-brand-50"
                  )}
                  aria-pressed={selected}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={() => commitDate(formatDateValue(new Date()))}
              className="rounded-md px-3 py-2 text-sm font-black uppercase text-brand-700 hover:bg-brand-50"
            >
              Heute
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-black uppercase text-slate-500 hover:bg-slate-50"
            >
              Schließen
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizeDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) return normalizeDateParts(isoMatch[1], isoMatch[2], isoMatch[3]);

  const localMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(trimmed);
  if (localMatch) return normalizeDateParts(localMatch[3], localMatch[2], localMatch[1]);

  return null;
}

function normalizeDateParts(yearValue: string, monthValue: string, dayValue: string) {
  const year = Number.parseInt(yearValue, 10);
  const month = Number.parseInt(monthValue, 10);
  const day = Number.parseInt(dayValue, 10);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return formatDateValue(date);
}

function getMonthDate(value?: string) {
  const normalized = value ? normalizeDateInput(value) : null;
  const source = normalized ? parseIsoDate(normalized) : new Date();
  return new Date(source.getFullYear(), source.getMonth(), 1);
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getCalendarDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      inCurrentMonth: date.getMonth() === monthDate.getMonth()
    };
  });
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric"
  });
}
