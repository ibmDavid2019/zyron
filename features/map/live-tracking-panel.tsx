"use client";

import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import type { ActivityType } from "@/types/activity";
import { formatDistance, formatDuration, formatPace } from "@/utils/format";

interface LiveTrackingPanelProps {
  type: ActivityType;
  elapsedSeconds: number;
  distanceKm: number;
  paused: boolean;
  onPauseResume: () => void;
  onFinish: () => void;
}

export function LiveTrackingPanel({
  type,
  elapsedSeconds,
  distanceKm,
  paused,
  onPauseResume,
  onFinish,
}: LiveTrackingPanelProps) {
  const config = ACTIVITY_TYPE_CONFIG[type];
  const paceSecondsPerKm = distanceKm > 0 ? elapsedSeconds / distanceKm : 0;
  const speedKmH = elapsedSeconds > 0 ? distanceKm / (elapsedSeconds / 3600) : 0;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-border bg-card p-4 shadow-2xl sm:mx-auto sm:max-w-md sm:rounded-2xl sm:border">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand">
        <config.icon className="size-4" />
        {config.label}
        {paused && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Pausado
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold tabular-nums">{formatDuration(elapsedSeconds)}</p>
          <p className="text-[11px] text-muted-foreground">Tempo</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{formatDistance(distanceKm)}</p>
          <p className="text-[11px] text-muted-foreground">Distância</p>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="font-semibold tabular-nums">
          {config.unit === "pace"
            ? formatPace(paceSecondsPerKm)
            : `${speedKmH.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km/h`}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {config.unit === "pace" ? "Ritmo médio" : "Velocidade média"}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="lg" className="flex-1" onClick={onPauseResume}>
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          {paused ? "Retomar" : "Pausar"}
        </Button>
        <Button size="lg" variant="destructive" className="flex-1" onClick={onFinish}>
          <Square className="size-4" />
          Finalizar
        </Button>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Mantenha o ZYRON aberto e a tela ligada para um rastreamento mais preciso.
      </p>
    </div>
  );
}
