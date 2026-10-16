import { Route } from "lucide-react";
import { RouteCard } from "@/features/routes/route-card";
import type { TrailRoute } from "@/types/route";
import { formatDistance } from "@/utils/format";

interface CustomRoute {
  id: string;
  name: string;
  distanceKm: number;
}

interface MyRoutesPanelProps {
  routes: TrailRoute[];
  customRoutes: CustomRoute[];
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onSelectRoute: (id: string) => void;
}

export function MyRoutesPanel({ routes, customRoutes, savedIds, onToggleSave, onSelectRoute }: MyRoutesPanelProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Minhas rotas</h3>

      {customRoutes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Criadas por você</p>
          {customRoutes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => onSelectRoute(route.id)}
              className="flex w-full items-center gap-2.5 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
                <Route className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{route.name}</span>
                <span className="block text-xs text-muted-foreground">{formatDistance(route.distanceKm)}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Salvas</p>
        <div className="space-y-3">
          {routes.map((route) => (
            <div key={route.id} onClick={() => onSelectRoute(route.id)} className="cursor-pointer">
              <RouteCard route={route} saved={savedIds.has(route.id)} onToggleSave={onToggleSave} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
