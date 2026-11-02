"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { COURT_ASPECT, CourtLines, attackSpot, defenseSpot } from "@/features/court/court";
import { ATTACK_POSITIONS, DEFENSE_POSITIONS } from "@/lib/constants";
import type { NeedFormFlowCopy } from "@/lib/need-form-i18n";
import { cn } from "@/lib/utils";
import type { AttackPosition, DefensePosition } from "@/types/domain";

/**
 * Pick attack positions and 6:0 defence positions by tapping a handball court.
 * Writes the same form fields as before (`attack_positions`, `defense_positions`),
 * so the server action and its validation are unchanged.
 */
export function CourtPositionPicker({
  attackDefault = [],
  defenseDefault = [],
  attackLabels,
  attackShort,
  defenseLabels,
  legendAttack,
  legendDefense,
  helpAttack,
  helpDefense,
  copy
}: {
  attackDefault?: AttackPosition[];
  defenseDefault?: DefensePosition[];
  attackLabels: Record<AttackPosition, string>;
  attackShort: Record<AttackPosition, string>;
  defenseLabels: Record<DefensePosition, string>;
  legendAttack: string;
  legendDefense: string;
  helpAttack: string;
  helpDefense: string;
  copy: NeedFormFlowCopy["picker"];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"attack" | "defense">(
    attackDefault.length === 0 && defenseDefault.length > 0 ? "defense" : "attack"
  );
  const [attack, setAttack] = useState<AttackPosition[]>(attackDefault);
  const [defense, setDefense] = useState<DefensePosition[]>(defenseDefault);

  // Lets the form's guard clear its "pick a position" message, like a normal input would.
  function notifyChange() {
    requestAnimationFrame(() => ref.current?.dispatchEvent(new Event("change", { bubbles: true })));
  }

  function toggleAttack(position: AttackPosition) {
    setAttack((current) => (current.includes(position) ? current.filter((p) => p !== position) : [...current, position]));
    notifyChange();
  }

  function toggleDefense(position: DefensePosition) {
    setDefense((current) => (current.includes(position) ? current.filter((p) => p !== position) : [...current, position]));
    notifyChange();
  }

  const selectedAttack = ATTACK_POSITIONS.filter((position) => attack.includes(position));
  const selectedDefense = DEFENSE_POSITIONS.filter((position) => defense.includes(position));

  const markerClass = (on: boolean) =>
    cn(
      "flex h-11 w-11 items-center justify-center rounded-full font-display text-xl leading-none transition duration-300 ease-out-expo group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-white sm:h-14 sm:w-14 sm:text-2xl",
      on
        ? "bg-brand-500 text-white shadow-[0_0_0_5px_rgba(0,85,255,0.35),0_6px_28px_rgba(0,85,255,0.5)]"
        : "border-2 border-white/45 bg-white/[0.04] text-white"
    );

  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      {selectedAttack.map((position) => (
        <input key={position} type="hidden" name="attack_positions" value={position} />
      ))}
      {selectedDefense.map((position) => (
        <input key={`d${position}`} type="hidden" name="defense_positions" value={String(position)} />
      ))}

      <div className="flex flex-col bg-navy-950 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <p className="eyebrow eyebrow-light">{copy.tap}</p>
          <div role="group" aria-label={`${copy.attack} / ${copy.defense}`} className="flex border border-white/20 p-[3px]">
            {(["attack", "defense"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-pressed={view === value}
                className={cn(
                  "min-h-9 px-3 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] transition-colors",
                  view === value ? "bg-white text-navy-950" : "text-white/75 hover:text-white"
                )}
              >
                {value === "attack" ? copy.attack : copy.defense}
              </button>
            ))}
          </div>
        </div>
        <div className="px-3 pb-4 pt-2 sm:px-4">
          <div className="relative mx-auto w-full max-w-[560px]" style={{ aspectRatio: COURT_ASPECT.full }}>
            <CourtLines crop="full" />
            {view === "attack"
              ? ATTACK_POSITIONS.map((position) => {
                  const on = attack.includes(position);
                  return (
                    <button
                      key={position}
                      type="button"
                      onClick={() => toggleAttack(position)}
                      aria-pressed={on}
                      aria-label={attackLabels[position]}
                      className="group absolute flex -translate-x-1/2 -translate-y-[22px] flex-col items-center gap-1 focus:outline-none sm:-translate-y-7"
                      style={attackSpot(position, "full")}
                    >
                      <span className={markerClass(on)}>{attackShort[position]}</span>
                      <span className="hidden whitespace-nowrap text-[0.7rem] font-semibold text-white/80 sm:block">
                        {attackLabels[position].split(" · ").pop()}
                      </span>
                    </button>
                  );
                })
              : DEFENSE_POSITIONS.map((position) => {
                  const on = defense.includes(position);
                  return (
                    <button
                      key={position}
                      type="button"
                      onClick={() => toggleDefense(position)}
                      aria-pressed={on}
                      aria-label={`${copy.defensePrefix} ${defenseLabels[position]}`}
                      className="group absolute flex -translate-x-1/2 -translate-y-[22px] flex-col items-center gap-1 focus:outline-none sm:-translate-y-7"
                      style={defenseSpot(position, "full")}
                    >
                      <span className={markerClass(on)}>{position}</span>
                      <span className="hidden whitespace-nowrap text-[0.7rem] font-semibold text-white/80 sm:block">
                        {defenseLabels[position].split(" · ").pop()}
                      </span>
                    </button>
                  );
                })}
          </div>
          <p className="px-1 pt-2 text-xs leading-5 text-slate-300">{view === "attack" ? helpAttack : helpDefense}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border border-slate-200 bg-white p-5">
        <p className="eyebrow">{copy.selected}</p>
        {selectedAttack.length + selectedDefense.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">{copy.none}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedAttack.map((position) => (
              <SelectedRow
                key={position}
                code={attackShort[position]}
                label={attackLabels[position].split(" · ").pop() ?? attackLabels[position]}
                group={legendAttack}
                removeLabel={copy.remove.replace("{label}", attackLabels[position])}
                onRemove={() => toggleAttack(position)}
              />
            ))}
            {selectedDefense.map((position) => (
              <SelectedRow
                key={`d${position}`}
                code={String(position)}
                label={defenseLabels[position].split(" · ").pop() ?? defenseLabels[position]}
                group={legendDefense}
                removeLabel={copy.remove.replace("{label}", `${copy.defensePrefix} ${defenseLabels[position]}`)}
                onRemove={() => toggleDefense(position)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SelectedRow({
  code,
  label,
  group,
  removeLabel,
  onRemove
}: {
  code: string;
  label: string;
  group: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border border-brand-100 bg-brand-50 py-1 pl-3 pr-1">
      <span className="flex min-w-0 items-center gap-3">
        <span className="font-display text-2xl leading-none text-brand-600">{code}</span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-navy-950">{label}</span>
          <span className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-slate-500">{group}</span>
        </span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-500 hover:text-navy-950"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}
