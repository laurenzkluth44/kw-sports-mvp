import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CoverageStatus } from "@/features/squad/squad-model";

/**
 * Handball half court seen from above, goal at the top, attackers facing it.
 * Court coordinates: 1 unit = 10 cm, x 0–200 (20 m wide), y 0 = goal line, y 200 = centre line.
 * Markers are HTML elements positioned in % on top of the SVG so text stays crisp and accessible.
 */
const VIEW = { x: -12, y: -16, size: 224 };

export function courtToPercent(x: number, y: number) {
  return {
    left: `${((x - VIEW.x) / VIEW.size) * 100}%`,
    top: `${((y - VIEW.y) / VIEW.size) * 100}%`
  };
}

export type BoardSlot = {
  key: string;
  label: string;
  x: number;
  y: number;
  status: CoverageStatus;
  count: number;
  flexibleCount: number;
  names: string[];
  href: string;
  title: string;
};

const markerClasses: Record<CoverageStatus, string> = {
  ok: "border-brand-500 bg-brand-500 text-white shadow-blueGlow",
  thin: "border-amber-400 bg-white text-navy-950",
  gap: "border-dashed border-red-400 bg-red-500/10 text-red-200"
};

export function TacticsBoard({
  slots,
  moreLabel,
  ariaLabel
}: {
  slots: BoardSlot[];
  moreLabel: (count: number) => string;
  ariaLabel: string;
}) {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[640px] overflow-hidden rounded-sm bg-navy-950"
      role="group"
      aria-label={ariaLabel}
    >
      <Court />

      {slots.map((slot) => {
        const position = courtToPercent(slot.x, slot.y);
        const visibleNames = slot.names.slice(0, 3);
        const hiddenCount = slot.names.length - visibleNames.length;

        return (
          <Link
            key={slot.key}
            href={slot.href}
            title={slot.title}
            className="group absolute flex w-[16%] -translate-x-1/2 -translate-y-[22px] flex-col items-center text-center focus:outline-none sm:-translate-y-[26px]"
            style={position}
          >
            <span className="relative">
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border-2 font-display text-2xl leading-none transition-transform duration-300 ease-out-expo group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-white sm:h-[52px] sm:w-[52px] sm:text-[1.75rem]",
                  markerClasses[slot.status]
                )}
              >
                {slot.count}
              </span>
              {slot.flexibleCount > 0 ? (
                <span className="absolute -right-2 -top-1 rounded-full border border-white/20 bg-navy-800 px-1.5 py-0.5 text-[0.6rem] font-bold leading-none text-white">
                  +{slot.flexibleCount}
                </span>
              ) : null}
            </span>
            <span className="mt-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-white">
              {slot.label}
            </span>
            {visibleNames.length > 0 ? (
              <span className="mt-0.5 hidden w-full flex-col text-[0.68rem] leading-[1.3] text-slate-300 sm:flex">
                {visibleNames.map((name, index) => (
                  <span key={`${slot.key}-${index}`} className="truncate">
                    {name}
                  </span>
                ))}
                {hiddenCount > 0 ? <span className="text-brand-300">{moreLabel(hiddenCount)}</span> : null}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

function Court() {
  const line = "rgba(255,255,255,0.55)";
  const faint = "rgba(255,255,255,0.18)";
  // 9 m arcs leave the court at the side lines: y = sqrt(90² - 85²) ≈ 29.6
  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.size} ${VIEW.size}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id="court-stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.025)" strokeWidth="3" />
        </pattern>
        <linearGradient id="court-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0055ff" stopOpacity="0.22" />
          <stop offset="0.55" stopColor="#0055ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={VIEW.x} y={VIEW.y} width={VIEW.size} height={VIEW.size} fill="url(#court-stripes)" />
      {/* 6 m goal area */}
      <path d="M 25 0 A 60 60 0 0 0 85 60 L 115 60 A 60 60 0 0 0 175 0 Z" fill="url(#court-glow)" />
      <path d="M 25 0 A 60 60 0 0 0 85 60 L 115 60 A 60 60 0 0 0 175 0" fill="none" stroke={line} strokeWidth="1.2" />
      {/* 9 m free-throw line */}
      <path
        d="M 0 29.6 A 90 90 0 0 0 85 90 L 115 90 A 90 90 0 0 0 200 29.6"
        fill="none"
        stroke={faint}
        strokeWidth="1.2"
        strokeDasharray="5 4"
      />
      {/* 7 m line and 4 m goalkeeper line */}
      <line x1="95" y1="70" x2="105" y2="70" stroke={line} strokeWidth="1.2" />
      <line x1="98" y1="40" x2="102" y2="40" stroke={faint} strokeWidth="1.2" />
      {/* court outline: side lines, goal line, centre line */}
      <rect x="0" y="0" width="200" height="200" fill="none" stroke={line} strokeWidth="1.4" />
      {/* goal */}
      <rect x="85" y="-8" width="30" height="8" fill="rgba(0,85,255,0.25)" stroke="#ffffff" strokeWidth="1.4" />
      {/* centre circle hint */}
      <path d="M 70 200 A 30 30 0 0 1 130 200" fill="none" stroke={faint} strokeWidth="1.2" />
    </svg>
  );
}

export function BoardLegend({ ok, thin, gap, flexible }: { ok: string; thin: string; gap: string; flexible: string }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate-300">
      <li className="flex items-center gap-2">
        <span className="h-3.5 w-3.5 rounded-full border-2 border-brand-500 bg-brand-500" aria-hidden="true" />
        {ok}
      </li>
      <li className="flex items-center gap-2">
        <span className="h-3.5 w-3.5 rounded-full border-2 border-amber-400 bg-white" aria-hidden="true" />
        {thin}
      </li>
      <li className="flex items-center gap-2">
        <span className="h-3.5 w-3.5 rounded-full border-2 border-dashed border-red-400" aria-hidden="true" />
        {gap}
      </li>
      <li className="text-slate-400 normal-case tracking-normal">{flexible}</li>
    </ul>
  );
}
