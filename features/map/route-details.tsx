"use client";

import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Mountain, Ruler, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OUTDOOR_TYPE_CONFIG } from "@/constants/activities";
import type { TrailRoute } from "@/types/route";
import { formatDistance } from "@/utils/format";
import { stashFollowRoute } from "@/utils/follow-route";

interface RouteDetailsProps {
  route: TrailRoute;
  rating: number;
  saved: boolean;
  onToggleSave: () => void;
  onViewOnMap: () => void;
}

export function RouteDetails({ route, rating, saved, onToggleSave, onViewOnMap }: RouteDetailsProps) {
  const router = useRouter();
  const config = OUTDOOR_TYPE_CONFIG[route.type];
  const startType = route.type === "trilha" ? "corrida" : route.type;

  function handleUseRoute() {
    stashFollowRoute({ name: route.name, distanceKm: route.distanceKm, type: startType });
    router.push(`/map?mode=record&type=${startType}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
          <config.icon className="size-3.5" />
          {config.label}
        </p>
        <h3 className="mt-1 text-lg font-bold">{route.name}</h3>
        <p className="text-xs text-muted-foreground">{route.city}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5">
          <Ruler className="size-4 text-muted-foreground" />
          {formatDistance(route.distanceKm)}
        </div>
        <div className="flex items-center gap-1.5">
          <Mountain className="size-4 text-muted-foreground" />
          {route.elevationM} m
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="size-4 fill-warning text-warning" />
          {rating.toFixed(1)}
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="size-4 text-muted-foreground" />
          {route.savedByCount.toLocaleString("pt-BR")}
        </div>
      </div>

      <p className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
        Dificuldade: {route.difficulty}
      </p>

      <div className="space-y-2">
        <Button variant="outline" className="w-full" onClick={onViewOnMap}>
          Ver rota
        </Button>
        <Button variant={saved ? "secondary" : "outline"} className="w-full" onClick={onToggleSave}>
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          {saved ? "Rota salva" : "Salvar"}
        </Button>
        <Button className="w-full" onClick={handleUseRoute}>
          Usar esta rota
        </Button>
      </div>
    </div>
  );
}
