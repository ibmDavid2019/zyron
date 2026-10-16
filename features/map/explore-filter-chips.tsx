"use client";

import { OUTDOOR_TYPE_CONFIG, OUTDOOR_TYPES } from "@/constants/activities";
import { cn } from "@/lib/utils";
import type { OutdoorActivityType } from "@/types/route";

interface ExploreFilterChipsProps {
  active: OutdoorActivityType | "todas";
  onChange: (value: OutdoorActivityType | "todas") => void;
  className?: string;
}

export function ExploreFilterChips({ active, onChange, className }: ExploreFilterChipsProps) {
  return (
    <div className={cn("no-scrollbar flex gap-2 overflow-x-auto", className)}>
      <button
        type="button"
        onClick={() => onChange("todas")}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg transition-colors",
          active === "todas" ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card text-foreground"
        )}
      >
        Todas
      </button>
      {OUTDOOR_TYPES.map((type) => {
        const config = OUTDOOR_TYPE_CONFIG[type];
        const selected = active === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg transition-colors",
              selected ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card text-foreground"
            )}
          >
            <config.icon className="size-3.5" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
