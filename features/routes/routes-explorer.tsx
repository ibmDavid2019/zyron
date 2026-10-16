"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RouteMap } from "@/components/shared/route-map";
import { RouteCard } from "@/features/routes/route-card";
import { OUTDOOR_TYPE_CONFIG, OUTDOOR_TYPES } from "@/constants/activities";
import type { OutdoorActivityType } from "@/types/route";
import type { TrailRoute } from "@/types/route";

export function RoutesExplorer({ routes }: { routes: TrailRoute[] }) {
  const [filter, setFilter] = useState<OutdoorActivityType | "todas">("todas");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => (filter === "todas" ? routes : routes.filter((r) => r.type === filter)),
    [routes, filter]
  );

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Rota removida dos salvos.");
      } else {
        next.add(id);
        toast.success("Rota salva!");
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Rotas</h1>
        <p className="text-muted-foreground">Descubra e salve as melhores rotas perto de você.</p>
      </div>

      <div className="relative">
        <RouteMap variant={2} className="h-56 w-full sm:h-72" label="Mapa exploratório · Brasil" />
        <Button className="absolute right-3 top-3 shadow-lg" size="sm" asChild>
          <Link href="/map">
            <MapIcon className="size-3.5" />
            Ver no mapa interativo
          </Link>
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as OutdoorActivityType | "todas")}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          {OUTDOOR_TYPES.map((type) => (
            <TabsTrigger key={type} value={type}>
              {OUTDOOR_TYPE_CONFIG[type].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            saved={savedIds.has(route.id)}
            onToggleSave={toggleSave}
          />
        ))}
      </div>
    </div>
  );
}
