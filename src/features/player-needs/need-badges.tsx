import { Badge } from "@/components/ui/badge";
import {
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS
} from "@/lib/constants";
import { CLUB_PRIORITY_LABELS, CLUB_STATUS_LABELS, type ClubLocale } from "@/lib/club-i18n";
import type { PlayerNeed } from "@/types/domain";

export function NeedBadges({
  need,
  locale
}: {
  need: Pick<PlayerNeed, "status" | "priority">;
  locale?: ClubLocale;
}) {
  const statusLabel = locale ? CLUB_STATUS_LABELS[locale][need.status] : STATUS_LABELS[need.status];
  const priorityLabel = locale ? CLUB_PRIORITY_LABELS[locale][need.priority] : PRIORITY_LABELS[need.priority];

  return (
    <div className="flex flex-wrap gap-2">
      <Badge className={STATUS_BADGE_CLASSES[need.status]}>{statusLabel}</Badge>
      <Badge className={PRIORITY_BADGE_CLASSES[need.priority]}>{priorityLabel}</Badge>
    </div>
  );
}
