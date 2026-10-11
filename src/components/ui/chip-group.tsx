import { cn } from "@/lib/utils";

export type ChipOption = {
  value: string;
  label: string;
};

export function ChipGroup({
  legend,
  name,
  options,
  defaultValues = [],
  type = "checkbox",
  help,
  className
}: {
  legend: string;
  name: string;
  options: ChipOption[];
  defaultValues?: readonly (string | number)[];
  type?: "checkbox" | "radio";
  help?: string;
  className?: string;
}) {
  const selected = defaultValues.map(String);

  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="field-label mb-1.5">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const id = `${name}_${option.value}`;

          return (
            <label key={option.value} htmlFor={id}>
              <input
                id={id}
                type={type}
                name={name}
                value={option.value}
                defaultChecked={selected.includes(option.value)}
                className="peer sr-only"
              />
              <span className="chip">{option.label}</span>
            </label>
          );
        })}
      </div>
      {help ? <p className="field-help mt-1.5">{help}</p> : null}
    </fieldset>
  );
}
