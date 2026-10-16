import { Compass, ListTree, Play, Route } from "lucide-react";
import { RecordActivitySheet } from "@/features/map/record-activity-sheet";
import { cn } from "@/lib/utils";
import type { ActivityType } from "@/types/activity";
import type { MapMode } from "@/types/map";

interface MapSidebarProps {
  mode: MapMode;
  onModeChange: (mode: MapMode) => void;
  myRoutesOpen: boolean;
  onToggleMyRoutes: () => void;
  onStartRecording: (type: ActivityType) => void;
}

export function MapSidebar({ mode, onModeChange, myRoutesOpen, onToggleMyRoutes, onStartRecording }: MapSidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <nav className="flex flex-col gap-1 px-3 py-3">
        <button
          type="button"
          onClick={() => onModeChange(mode === "explore" ? "view" : "explore")}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            mode === "explore" ? "bg-brand-muted text-brand" : "text-foreground/80 hover:bg-muted"
          )}
        >
          <Compass className="size-4.5" />
          Explorar
        </button>

        <RecordActivitySheet
          onSelect={onStartRecording}
          trigger={
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
            >
              <Play className="size-4.5" />
              Gravar
            </button>
          }
        />

        <button
          type="button"
          onClick={() => onModeChange(mode === "create-route" ? "view" : "create-route")}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            mode === "create-route" ? "bg-brand-muted text-brand" : "text-foreground/80 hover:bg-muted"
          )}
        >
          <Route className="size-4.5" />
          Criar rota
        </button>

        <button
          type="button"
          onClick={onToggleMyRoutes}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            myRoutesOpen ? "bg-brand-muted text-brand" : "text-foreground/80 hover:bg-muted"
          )}
        >
          <ListTree className="size-4.5" />
          Minhas rotas
        </button>
      </nav>
    </aside>
  );
}
