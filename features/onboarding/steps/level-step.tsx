import { Check } from "lucide-react";
import { LEVEL_OPTIONS } from "@/features/onboarding/data";
import { cn } from "@/lib/utils";

interface LevelStepProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function LevelStep({ value, onChange }: LevelStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Qual é seu nível?</h1>
        <p className="text-sm text-muted-foreground">
          Isso ajuda a Zyron AI a calibrar seus treinos.
        </p>
      </div>

      <div className="space-y-2.5">
        {LEVEL_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors",
                selected
                  ? "border-brand bg-brand-muted"
                  : "border-border hover:bg-muted"
              )}
            >
              <span>
                <span className={cn("block text-sm font-semibold", selected && "text-brand")}>
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {option.description}
                </span>
              </span>
              {selected && <Check className="mt-0.5 size-4 shrink-0 text-brand" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
