"use client";

import { useState } from "react";

// Matches the h-5 thumb in .range-input; used to line the filled track up with the thumb centres.
const THUMB_PX = 20;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function percent(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}

function trackOffset(pct: number) {
  return `calc(${pct}% + ${THUMB_PX / 2 - (pct / 100) * THUMB_PX}px)`;
}

/**
 * Two-thumb slider for an optional range. A thumb resting on its outer end means
 * "no limit" and submits an empty value, so the field stays optional.
 */
export function RangeSlider({
  label,
  nameMin,
  nameMax,
  min,
  max,
  step = 1,
  defaultMin,
  defaultMax,
  anyLabel,
  unit = ""
}: {
  label: string;
  nameMin: string;
  nameMax: string;
  min: number;
  max: number;
  step?: number;
  defaultMin?: number | null;
  defaultMax?: number | null;
  anyLabel: string;
  unit?: string;
}) {
  const [low, setLow] = useState(clamp(defaultMin ?? min, min, max));
  const [high, setHigh] = useState(clamp(defaultMax ?? max, min, max));
  const lowPct = percent(low, min, max);
  const highPct = percent(high, min, max);
  const lowText = low === min ? anyLabel : `${low}${unit}`;
  const highText = high === max ? anyLabel : `${high}${unit}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="field-label">{label}</span>
        <span className="text-sm font-bold text-navy-950">
          {low === min && high === max ? anyLabel : `${lowText} – ${highText}`}
        </span>
      </div>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: trackOffset(lowPct), right: `calc(100% - ${trackOffset(highPct)})` }}
        />
        <input
          type="range"
          className="range-input"
          // Lift the lower thumb when both sit at the top end, otherwise it can't be grabbed.
          style={{ zIndex: lowPct > 90 ? 3 : 2 }}
          min={min}
          max={max}
          step={step}
          value={low}
          aria-label={`${label} min`}
          aria-valuetext={lowText}
          onChange={(event) => setLow(Math.min(Number(event.target.value), high))}
        />
        <input
          type="range"
          className="range-input"
          style={{ zIndex: 2 }}
          min={min}
          max={max}
          step={step}
          value={high}
          aria-label={`${label} max`}
          aria-valuetext={highText}
          onChange={(event) => setHigh(Math.max(Number(event.target.value), low))}
        />
      </div>
      <input type="hidden" name={nameMin} value={low === min ? "" : low} />
      <input type="hidden" name={nameMax} value={high === max ? "" : high} />
    </div>
  );
}

/** Single-thumb slider for an optional minimum; the leftmost position submits an empty value. */
export function MinSlider({
  label,
  name,
  min,
  max,
  step = 1,
  defaultValue,
  anyLabel,
  unit = ""
}: {
  label: string;
  name: string;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number | null;
  anyLabel: string;
  unit?: string;
}) {
  const [value, setValue] = useState(clamp(defaultValue ?? min, min, max));
  const valueText = value === min ? anyLabel : `≥ ${value}${unit}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="field-label">{label}</span>
        <span className="text-sm font-bold text-navy-950">{valueText}</span>
      </div>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: trackOffset(percent(value, min, max)), display: value === min ? "none" : undefined }}
        />
        <input
          type="range"
          // A single slider can also be set by clicking the track.
          className="range-input pointer-events-auto"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          aria-valuetext={valueText}
          onChange={(event) => setValue(Number(event.target.value))}
        />
      </div>
      <input type="hidden" name={name} value={value === min ? "" : value} />
    </div>
  );
}
