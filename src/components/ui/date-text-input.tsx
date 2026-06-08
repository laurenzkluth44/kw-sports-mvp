import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/form";

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
  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <Input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="YYYY-MM-DD"
        pattern="\\d{4}-\\d{2}-\\d{2}"
        defaultValue={defaultValue || ""}
        required={required}
        className="pl-9"
      />
    </div>
  );
}
