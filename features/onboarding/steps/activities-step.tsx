import { ACTIVITY_OPTIONS } from "@/features/onboarding/data";
import { cn } from "@/lib/utils";

interface ActivitiesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ActivitiesStep({ value, onChange }: ActivitiesStepProps) {
  function toggle(activity: string) {
    onChange(
      value.includes(activity) ? value.filter((a) => a !== activity) : [...value, activity]
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Quais atividades você pratica?</h1>
        <p className="text-sm text-muted-foreground">Selecione uma ou mais opções.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACTIVITY_OPTIONS.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-sm font-medium transition-colors",
                selected
                  ? "border-brand bg-brand-muted text-brand"
                  : "border-border hover:bg-muted"
              )}
            >
              <option.icon className="size-6" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
