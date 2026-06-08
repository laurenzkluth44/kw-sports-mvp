import { Badge } from "@/components/ui/badge";
import {
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS
} from "@/lib/constants";
import type { PlayerNeed } from "@/types/domain";

export function NeedBadges({ need }: { need: Pick<PlayerNeed, "status" | "priority"> }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className={STATUS_BADGE_CLASSES[need.status]}>{STATUS_LABELS[need.status]}</Badge>
      <Badge className={PRIORITY_BADGE_CLASSES[need.priority]}>{PRIORITY_LABELS[need.priority]}</Badge>
    </div>
  );
}
