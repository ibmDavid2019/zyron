"use client";

import type { ShareLayout } from "@/types/share";
import { cn } from "@/lib/utils";

const LAYOUTS: { id: ShareLayout; label: string }[] = [
  { id: "minimal", label: "Minimal" },
  { id: "sport", label: "Sport" },
  { id: "dynamic", label: "Dynamic" },
];

export function LayoutPicker({ value, onChange }: { value: ShareLayout; onChange: (layout: ShareLayout) => void }) {
  return (
    <div className="flex gap-2">
      {LAYOUTS.map((layout) => (
        <button
          key={layout.id}
          type="button"
          onClick={() => onChange(layout.id)}
          className={cn(
            "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
            value === layout.id
              ? "border-brand bg-brand-muted text-brand"
              : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          {layout.label}
        </button>
      ))}
    </div>
  );
}
