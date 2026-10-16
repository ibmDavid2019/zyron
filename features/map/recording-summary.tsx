"use client";

import { useState } from "react";
import { Flame, Loader2, MapPin, Mountain, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import type { ActivityType } from "@/types/activity";
import { formatDistance, formatDuration, formatPace } from "@/utils/format";

// Estimates only — real elevation would come from Mapbox's Terrain API and
// real calorie burn from the user's profile (weight, heart rate) once this
// ships against a real backend.
export const ELEVATION_M_PER_KM_ESTIMATE = 9;
export const CALORIES_PER_KM_ESTIMATE: Record<ActivityType, number> = {
  corrida: 62,
  caminhada: 48,
  ciclismo: 26,
};

interface RecordingSummaryProps {
  type: ActivityType;
  distanceKm: number;
  durationSeconds: number;
  /** Real elevation gain from GPS altitude, when the device reported it — null falls back to a distance-based estimate. */
  elevationGainM: number | null;
  city: string | null;
  cityLoading: boolean;
  onSave: (title: string) => void;
  onShare: (title: string) => void;
  onDiscard: () => void;
}

export function RecordingSummary({
  type,
  distanceKm,
  durationSeconds,
  elevationGainM,
  city,
  cityLoading,
  onSave,
  onShare,
  onDiscard,
}: RecordingSummaryProps) {
  const config = ACTIVITY_TYPE_CONFIG[type];
  const [title, setTitle] = useState(`${config.label} de ${new Date().toLocaleDateString("pt-BR", { weekday: "long" })}`);

  const paceSecondsPerKm = distanceKm > 0 ? durationSeconds / distanceKm : 0;
  const speedKmH = durationSeconds > 0 ? distanceKm / (durationSeconds / 3600) : 0;
  const calories = Math.round(distanceKm * CALORIES_PER_KM_ESTIMATE[type]);
  const hasRealElevation = elevationGainM !== null;
  const elevationM = hasRealElevation ? elevationGainM : Math.round(distanceKm * ELEVATION_M_PER_KM_ESTIMATE);

  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-brand">
        <config.icon className="size-4" />
        Atividade concluída
      </div>

      {(cityLoading || city) && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {cityLoading ? <Loader2 className="size-3 animate-spin" /> : <MapPin className="size-3" />}
          {cityLoading ? "Identificando cidade..." : city}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold tabular-nums">{formatDistance(distanceKm)}</p>
          <p className="text-[11px] text-muted-foreground">Distância</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{formatDuration(durationSeconds)}</p>
          <p className="text-[11px] text-muted-foreground">Tempo</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="font-semibold tabular-nums">
            {config.unit === "pace" ? formatPace(paceSecondsPerKm) : `${speedKmH.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km/h`}
          </p>
          <p className="text-[11px] text-muted-foreground">{config.unit === "pace" ? "Ritmo" : "Velocidade"}</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 font-semibold tabular-nums">
            <Flame className="size-3.5 text-warning" />
            {calories}
          </p>
          <p className="text-[11px] text-muted-foreground">Calorias (est.)</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 font-semibold tabular-nums">
            <Mountain className="size-3.5 text-muted-foreground" />
            {elevationM} m
          </p>
          <p className="text-[11px] text-muted-foreground">{hasRealElevation ? "Elevação (GPS)" : "Elevação (est.)"}</p>
        </div>
      </div>

      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da atividade" className="mt-4" />

      <div className="mt-3 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onDiscard}>
          Descartar
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => onShare(title.trim() || config.label)}>
          <Share2 className="size-4" />
          Compartilhar
        </Button>
      </div>
      <Button className="mt-2 w-full" onClick={() => onSave(title.trim() || config.label)}>
        Salvar atividade
      </Button>
    </div>
  );
}
