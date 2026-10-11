"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Catches the two conditional requirements (positions for players, role for coaches)
 * before submit, so the server round-trip doesn't wipe what the user entered.
 * The server action validates the same rules.
 */
export function NeedFormGuard({ positionsError, coachRoleError }: { positionsError: string; coachRoleError: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;

    function missingRequirement(data: FormData) {
      if (data.get("need_type") === "trainer") return data.get("coach_role") ? null : coachRoleError;
      const hasPosition = data.getAll("attack_positions").length > 0 || data.getAll("defense_positions").length > 0;
      return hasPosition ? null : positionsError;
    }

    function handleSubmit(event: SubmitEvent) {
      const missing = missingRequirement(new FormData(form!));

      setMessage(missing);
      if (missing) {
        event.preventDefault();
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    function handleChange() {
      setMessage(null);
    }

    form.addEventListener("submit", handleSubmit);
    form.addEventListener("change", handleChange);
    return () => {
      form.removeEventListener("submit", handleSubmit);
      form.removeEventListener("change", handleChange);
    };
  }, [positionsError, coachRoleError]);

  return (
    <div ref={ref} role="alert" className={message ? "alert-error md:col-span-2" : "hidden"}>
      {message}
    </div>
  );
}
