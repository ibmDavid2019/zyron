"use client";

import { LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecenterButtonProps {
  onClick: () => void;
  className?: string;
}

/** Shown once the user pans the map away from their live position during a GPS recording. */
export function RecenterButton({ onClick, className }: RecenterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-brand bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground shadow-lg transition-transform hover:scale-105",
        className
      )}
    >
      <LocateFixed className="size-3.5" />
      Voltar para minha localização
    </button>
  );
}
