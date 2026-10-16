"use client";

import { useState } from "react";
import { Footprints, MousePointerClick, Save, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LngLat } from "@/types/map";
import { pathDistanceKm } from "@/utils/geo";
import { formatDistance, formatDuration } from "@/utils/format";

interface RouteCreatorPanelProps {
  points: LngLat[];
  onUndo: () => void;
  onClear: () => void;
  onSave: (name: string) => void;
  onExit: () => void;
  gpsMode: boolean;
  onToggleGpsMode: () => void;
}

// Estimates only — real elevation would come from Mapbox's Terrain API and
// real pace from the user's history once this ships for real.
const ASSUMED_PACE_SECONDS_PER_KM = 360;
const ASSUMED_ELEVATION_M_PER_KM = 9;

export function RouteCreatorPanel({ points, onUndo, onClear, onSave, onExit, gpsMode, onToggleGpsMode }: RouteCreatorPanelProps) {
  const [name, setName] = useState("");
  const distanceKm = pathDistanceKm(points);
  const canSave = points.length >= 2 && name.trim().length > 0;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-border bg-card p-4 shadow-2xl sm:mx-auto sm:max-w-md sm:rounded-2xl sm:border">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Criar rota</p>
        <button
          type="button"
          onClick={onExit}
          aria-label="Sair do modo de criação"
          className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => gpsMode && onToggleGpsMode()}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
            !gpsMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          <MousePointerClick className="size-3.5" />
          Desenhar no mapa
        </button>
        <button
          type="button"
          onClick={() => !gpsMode && onToggleGpsMode()}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
            gpsMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          <Footprints className="size-3.5" />
          Gravar caminhando
        </button>
      </div>

      <p className="mt-2.5 text-xs text-muted-foreground">
        {gpsMode
          ? points.length === 0
            ? "Comece a caminhar — sua localização real vai desenhar o percurso."
            : "Continue caminhando para estender o percurso."
          : points.length === 0
            ? "Toque no mapa para adicionar o ponto inicial."
            : "Toque no mapa para adicionar mais pontos ao percurso."}
      </p>

      {points.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="font-semibold tabular-nums">{formatDistance(distanceKm)}</p>
            <p className="text-[11px] text-muted-foreground">Distância</p>
          </div>
          <div>
            <p className="font-semibold tabular-nums">{Math.round(distanceKm * ASSUMED_ELEVATION_M_PER_KM)} m</p>
            <p className="text-[11px] text-muted-foreground">Elevação (est.)</p>
          </div>
          <div>
            <p className="font-semibold tabular-nums">
              {formatDuration(distanceKm * ASSUMED_PACE_SECONDS_PER_KM)}
            </p>
            <p className="text-[11px] text-muted-foreground">Tempo (est.)</p>
          </div>
        </div>
      )}

      {points.length >= 2 && (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da rota"
          className="mt-3"
        />
      )}

      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onClear} disabled={points.length === 0}>
          Limpar
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onUndo} disabled={points.length === 0}>
          <Undo2 className="size-3.5" />
          Desfazer
        </Button>
        <Button size="sm" className="flex-1" onClick={() => onSave(name.trim())} disabled={!canSave}>
          <Save className="size-3.5" />
          Salvar
        </Button>
      </div>
    </div>
  );
}
