import { Check } from "lucide-react";
import { STATUSES, STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { updateClubNeedStatusAction } from "@/features/player-needs/actions";
import { CLUB_STATUS_LABELS, clubCopy, type ClubLocale } from "@/lib/club-i18n";
import type { PlayerNeed } from "@/types/domain";

export function NeedStatusForm({ need, locale }: { need: PlayerNeed; locale?: ClubLocale }) {
  const statusLabels = locale ? CLUB_STATUS_LABELS[locale] : STATUS_LABELS;
  const copy = locale ? clubCopy[locale].dashboard : null;

  return (
    <form action={updateClubNeedStatusAction} className="flex max-w-sm flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={need.id} />
      <label className="sr-only" htmlFor={`status-${need.id}`}>
        {copy?.changeStatus || "Status ändern"}
      </label>
      <Select
        id={`status-${need.id}`}
        name="status"
        defaultValue={need.status}
        className="w-44"
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status]}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="secondary" className="px-3" title={copy?.setStatus || "Status setzen"}>
        <Check className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{copy?.setStatus || "Status setzen"}</span>
      </Button>
    </form>
  );
}
