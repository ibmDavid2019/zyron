"use client";

import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OUTDOOR_TYPE_CONFIG } from "@/constants/activities";
import type { GeneratedRoute } from "@/utils/route-generator";
import { staticRouteMapUrl } from "@/utils/static-map";
import { formatDistance } from "@/utils/format";
import { stashFollowRoute } from "@/utils/follow-route";

interface GeneratedRouteDetailsProps {
  route: GeneratedRoute;
  neighborhood: string | null;
  saved: boolean;
  onToggleSave: () => void;
  onViewOnMap: () => void;
}

/** Detail panel for a real, street-snapped loop generated around the user's location — same bottom-sheet slot as RouteDetails, sized for a GeneratedRoute instead of a catalog TrailRoute. */
export function GeneratedRouteDetails({ route, neighborhood, saved, onToggleSave, onViewOnMap }: GeneratedRouteDetailsProps) {
  const router = useRouter();
  const startType = route.profile === "cycling" ? "ciclismo" : "caminhada";
  const config = OUTDOOR_TYPE_CONFIG[startType];
  const mapUrl = staticRouteMapUrl(route.path, 600, 320, route.profile === "cycling" ? "3b82f6" : "22c55e");

  function handleUseRoute() {
    stashFollowRoute({ name: route.name, distanceKm: route.distanceKm, type: startType });
    router.push(`/map?mode=record&type=${startType}`);
  }

  return (
    <div className="space-y-4">
      {mapUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- external Mapbox Static Images thumbnail, not a local/optimizable asset
        <img src={mapUrl} alt={`Mapa da rota ${route.name}`} className="h-40 w-full rounded-xl object-cover" />
      )}

      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
          <config.icon className="size-3.5" />
          {config.label}
        </p>
        <h3 className="mt-1 text-lg font-bold">{route.name}</h3>
        <p className="text-xs text-muted-foreground">Ruas reais perto de {neighborhood ?? "você"}</p>
      </div>

      <div className="flex items-center gap-1.5 text-sm">
        <Ruler className="size-4 text-muted-foreground" />
        {formatDistance(route.distanceKm)}
      </div>

      <p className="rounded-lg bg-brand-muted px-2.5 py-1.5 text-xs font-medium text-brand">
        Sugerida para você · gerada em tempo real a partir da sua localização
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
