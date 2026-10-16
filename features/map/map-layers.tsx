"use client";

import { Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAP_STYLE_LABELS } from "@/constants/map";
import { cn } from "@/lib/utils";
import type { MapBaseStyle, MapLayerVisibility } from "@/types/map";

interface MapLayersProps {
  baseStyle: MapBaseStyle;
  onBaseStyleChange: (style: MapBaseStyle) => void;
  visibility: MapLayerVisibility;
  onVisibilityChange: (visibility: MapLayerVisibility) => void;
  className?: string;
}

const OVERLAY_LABELS: Record<keyof MapLayerVisibility, string> = {
  routes: "Rotas",
  activities: "Atividades",
  events: "Eventos",
};

export function MapLayers({ baseStyle, onBaseStyleChange, visibility, onVisibilityChange, className }: MapLayersProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Camadas do mapa"
          className={cn(
            "flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted",
            className
          )}
        >
          <Layers className="size-4.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Estilo do mapa</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={baseStyle} onValueChange={(v) => onBaseStyleChange(v as MapBaseStyle)}>
          {(Object.keys(MAP_STYLE_LABELS) as MapBaseStyle[]).map((style) => (
            <DropdownMenuRadioItem key={style} value={style}>
              {MAP_STYLE_LABELS[style]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Camadas</DropdownMenuLabel>
        {(Object.keys(OVERLAY_LABELS) as (keyof MapLayerVisibility)[]).map((key) => (
          <DropdownMenuCheckboxItem
            key={key}
            checked={visibility[key]}
            onCheckedChange={(checked) => onVisibilityChange({ ...visibility, [key]: checked })}
            onSelect={(e) => e.preventDefault()}
          >
            {OVERLAY_LABELS[key]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
