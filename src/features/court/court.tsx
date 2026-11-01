import type { AttackPosition, DefensePosition } from "@/types/domain";

/**
 * Shared handball half-court drawing (goal at the top, 1 unit = 10 cm, x 0–200, y 0 = goal line).
 * Positions are given in % of the drawn box so HTML markers can sit on top of the SVG.
 *
 * Two crops:
 *  - "full": down to y 180 (aspect 224/196), used for the demand court and the position picker
 *  - "mini": down to y 134 (aspect 224/150), used on need cards
 */
export type CourtCrop = "full" | "mini";

const VIEWS: Record<CourtCrop, { x: number; y: number; w: number; h: number }> = {
  full: { x: -12, y: -16, w: 224, h: 196 },
  mini: { x: -12, y: -16, w: 224, h: 150 }
};

export const COURT_ASPECT: Record<CourtCrop, string> = {
  full: "224 / 196",
  mini: "224 / 150"
};

// Marker centres in court units. The mini crop moves the back court up so it stays in view.
const ATTACK_UNITS: Record<CourtCrop, Record<AttackPosition, [number, number]>> = {
  full: { TW: [100, 14], LA: [16, 24], RA: [184, 24], KM: [100, 74], RL: [40, 116], RM: [100, 136], RR: [160, 116] },
  mini: { TW: [100, 14], LA: [16, 24], RA: [184, 24], KM: [100, 64], RL: [40, 100], RM: [100, 113], RR: [160, 100] }
};

// 6:0 defence along the 6 m line, numbered 1–6 from left to right.
const DEFENSE_UNITS: Record<DefensePosition, [number, number]> = {
  1: [18, 34],
  2: [50, 66],
  3: [82, 78],
  4: [118, 78],
  5: [150, 66],
  6: [182, 34]
};

function toPercent(crop: CourtCrop, [x, y]: [number, number]) {
  const view = VIEWS[crop];
  return { left: `${((x - view.x) / view.w) * 100}%`, top: `${((y - view.y) / view.h) * 100}%` };
}

export function attackSpot(position: AttackPosition, crop: CourtCrop = "full") {
  return toPercent(crop, ATTACK_UNITS[crop][position]);
}

export function defenseSpot(position: DefensePosition, crop: CourtCrop = "full") {
  return toPercent(crop, DEFENSE_UNITS[position]);
}

export function CourtLines({ crop = "full" }: { crop?: CourtCrop }) {
  const view = VIEWS[crop];
  const line = "rgba(255,255,255,0.55)";
  const faint = "rgba(255,255,255,0.2)";

  return (
    <svg
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* 6 m goal area */}
      <path d="M 25 0 A 60 60 0 0 0 85 60 L 115 60 A 60 60 0 0 0 175 0 Z" fill="rgba(0,85,255,0.16)" stroke={line} strokeWidth="1.3" />
      {/* 9 m free-throw line, leaving the court at the side lines */}
      <path
        d="M 0 29.6 A 90 90 0 0 0 85 90 L 115 90 A 90 90 0 0 0 200 29.6"
        fill="none"
        stroke={faint}
        strokeWidth="1.3"
        strokeDasharray="5 4"
      />
      <line x1="95" y1="70" x2="105" y2="70" stroke={line} strokeWidth="1.3" />
      <rect x="0" y="0" width="200" height="200" fill="none" stroke={line} strokeWidth="1.5" />
      <rect x="85" y="-8" width="30" height="8" fill="rgba(0,85,255,0.3)" stroke="#ffffff" strokeWidth="1.4" />
    </svg>
  );
}
