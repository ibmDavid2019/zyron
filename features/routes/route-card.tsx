"use client";

import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Mountain, Ruler, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RouteMap } from "@/components/shared/route-map";
import { OUTDOOR_TYPE_CONFIG } from "@/constants/activities";
import { cn } from "@/lib/utils";
import type { LngLat } from "@/types/map";
import type { RouteDifficulty, TrailRoute } from "@/types/route";
import { formatDistance } from "@/utils/format";
import { staticRouteMapUrl } from "@/utils/static-map";
import { stashFollowRoute } from "@/utils/follow-route";

const DIFFICULTY_CLASSNAME: Record<RouteDifficulty, string> = {
  Fácil: "bg-success/15 text-success",
  Moderada: "bg-warning/15 text-warning",
  Difícil: "bg-destructive/15 text-destructive",
};

interface RouteCardProps {
  route: TrailRoute;
  saved: boolean;
  onToggleSave: (id: string) => void;
  /** Real coordinates, when known — renders an actual Mapbox thumbnail instead of the decorative illustration. */
  path?: LngLat[];
  /** When provided, the thumbnail becomes clickable and opens this route on the interactive map. */
  onOpen?: (id: string) => void;
}

export function RouteCard({ route, saved, onToggleSave, path, onOpen }: RouteCardProps) {
  const router = useRouter();
  const config = OUTDOOR_TYPE_CONFIG[route.type];
  const mapUrl = path ? staticRouteMapUrl(path, 400, 200) : null;
  const startType = route.type === "trilha" ? "corrida" : route.type;

  function handleUseRoute() {
    stashFollowRoute({ name: route.name, distanceKm: route.distanceKm, type: startType });
    router.push(`/map?mode=record&type=${startType}`);
  }

  const thumbnail = mapUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- external Mapbox Static Images thumbnail, not a local/optimizable asset
    <img src={mapUrl} alt={`Mapa da rota ${route.name}`} className="size-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
  ) : (
    <RouteMap variant={route.routeVariant} className="size-full rounded-none" />
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(route.id)}
          aria-label={`Abrir rota ${route.name} no mapa`}
          className="group relative block h-32 w-full"
        >
          {thumbnail}
          <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
        </button>
      ) : (
        <div className="relative h-32 w-full">{thumbnail}</div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{route.name}</p>
            <p className="text-xs text-muted-foreground">{route.city}</p>
          </div>
          <Badge className={cn("shrink-0", DIFFICULTY_CLASSNAME[route.difficulty])} variant="secondary">
            {route.difficulty}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-brand">
            <config.icon className="size-3.5" />
            {config.label}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="size-3.5" />
            {formatDistance(route.distanceKm)}
          </span>
          <span className="flex items-center gap-1.5">
            <Mountain className="size-3.5" />
            {route.elevationM} m
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {route.savedByCount.toLocaleString("pt-BR")}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <Button variant={saved ? "secondary" : "outline"} className="w-full" onClick={() => onToggleSave(route.id)}>
            {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
            {saved ? "Rota salva" : "Salvar rota"}
          </Button>
          <Button className="w-full" onClick={handleUseRoute}>
            Usar esta rota
          </Button>
        </div>
      </div>
    </div>
  );
}
