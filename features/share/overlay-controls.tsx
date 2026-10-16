"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import type { ActivityType } from "@/types/activity";
import type { OverlaySpec, StatVisibility } from "@/types/share";

const STAT_LABELS: Record<keyof StatVisibility, string> = {
  distance: "Distância",
  duration: "Duração",
  pace: "Ritmo/Velocidade",
  elevation: "Elevação",
  calories: "Calorias",
};

interface OverlayControlsProps {
  activityType: ActivityType;
  spec: OverlaySpec;
  onSpecChange: (updater: (prev: OverlaySpec) => OverlaySpec) => void;
  /** Hides the photo zoom/pan control — there's no photo to zoom in the video flow. */
  showPhotoControls?: boolean;
}

export function OverlayControls({ activityType, spec, onSpecChange, showPhotoControls = true }: OverlayControlsProps) {
  const config = ACTIVITY_TYPE_CONFIG[activityType];

  function toggleStat(key: keyof StatVisibility) {
    onSpecChange((prev) => ({ ...prev, stats: { ...prev.stats, [key]: !prev.stats[key] } }));
  }

  function adjustRouteScale(delta: number) {
    onSpecChange((prev) => ({
      ...prev,
      route: { ...prev.route, scale: Math.min(2, Math.max(0.5, prev.route.scale + delta)) },
    }));
  }

  function adjustPhotoZoom(delta: number) {
    onSpecChange((prev) => ({
      ...prev,
      photo: { ...prev.photo, scale: Math.min(2.5, Math.max(1, prev.photo.scale + delta)) },
    }));
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Estatísticas</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {(Object.keys(STAT_LABELS) as (keyof StatVisibility)[]).map((key) => (
            <label key={key} className="flex items-center justify-between gap-2 text-sm">
              {key === "pace" ? (config.unit === "pace" ? "Ritmo" : "Velocidade") : STAT_LABELS[key]}
              <Switch checked={spec.stats[key]} onCheckedChange={() => toggleStat(key)} />
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          Rota do GPS
          <Switch
            checked={spec.route.visible}
            onCheckedChange={(checked) => onSpecChange((prev) => ({ ...prev, route: { ...prev.route, visible: checked } }))}
          />
        </label>
        {spec.route.visible && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-7" onClick={() => adjustRouteScale(-0.1)}>
              <Minus className="size-3.5" />
            </Button>
            <span className="w-8 text-center text-xs text-muted-foreground">{Math.round(spec.route.scale * 100)}%</span>
            <Button variant="outline" size="icon" className="size-7" onClick={() => adjustRouteScale(0.1)}>
              <Plus className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      {showPhotoControls && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm">Zoom da foto</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-7" onClick={() => adjustPhotoZoom(-0.1)}>
              <Minus className="size-3.5" />
            </Button>
            <span className="w-10 text-center text-xs text-muted-foreground">{Math.round(spec.photo.scale * 100)}%</span>
            <Button variant="outline" size="icon" className="size-7" onClick={() => adjustPhotoZoom(0.1)}>
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Arraste as estatísticas, a rota ou a logo ZYRON para reposicioná-las{showPhotoControls ? ", ou arraste a foto para movê-la" : ""}.
      </p>
    </div>
  );
}
