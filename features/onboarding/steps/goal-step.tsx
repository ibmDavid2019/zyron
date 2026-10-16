import { Check } from "lucide-react";
import { GOAL_OPTIONS } from "@/features/onboarding/data";
import { cn } from "@/lib/utils";

interface GoalStepProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function GoalStep({ value, onChange }: GoalStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Qual é seu objetivo?</h1>
        <p className="text-sm text-muted-foreground">Escolha o que mais te representa hoje.</p>
      </div>

      <div className="space-y-2.5">
        {GOAL_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                selected
                  ? "border-brand bg-brand-muted text-brand"
                  : "border-border hover:bg-muted"
              )}
            >
              {option.label}
              {selected && <Check className="size-4 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
