import type { AttackPosition, DefensePosition } from "@/types/domain";

// Marker centres in court coordinates (see tactics-board.tsx): x 0–200, y 0 = goal line.

export const ATTACK_LAYOUT: Record<AttackPosition, { x: number; y: number }> = {
  TW: { x: 100, y: 14 },
  LA: { x: 16, y: 24 },
  RA: { x: 184, y: 24 },
  KM: { x: 100, y: 74 },
  RL: { x: 40, y: 116 },
  RM: { x: 100, y: 136 },
  RR: { x: 160, y: 116 }
};

// 6:0 defence along the 6 m line, numbered 1–6 from left to right.
export const DEFENSE_LAYOUT: Record<DefensePosition, { x: number; y: number }> = {
  1: { x: 18, y: 34 },
  2: { x: 50, y: 66 },
  3: { x: 82, y: 78 },
  4: { x: 118, y: 78 },
  5: { x: 150, y: 66 },
  6: { x: 182, y: 34 }
};

export const DEFENSE_GOALKEEPER = { x: 100, y: 14 };
