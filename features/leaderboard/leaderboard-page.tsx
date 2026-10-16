"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACTIVITY_TYPE_CONFIG, ACTIVITY_TYPES } from "@/constants/activities";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn, getInitials } from "@/lib/utils";
import { getProfileOverrides, getSavedActivities } from "@/utils/local-store";
import type { ActivityType } from "@/types/activity";

export function LeaderboardPage() {
  const [activityType, setActivityType] = useState<ActivityType | "todas">("todas");
  // Starts empty — the demo/seed activities elsewhere in the app aren't
  // something this account actually did, so a brand-new user genuinely has
  // 0 km here until they record a real activity.
  const [realActivities, setRealActivities] = useState<ReturnType<typeof getSavedActivities>>([]);
  const [city, setCity] = useState(CURRENT_USER.city ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRealActivities(getSavedActivities());
      const overrideCity = getProfileOverrides().city;
      if (overrideCity) setCity(overrideCity);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const totalKm = useMemo(() => {
    const relevant = activityType === "todas" ? realActivities : realActivities.filter((a) => a.type === activityType);
    return Math.round(relevant.reduce((sum, a) => sum + a.distanceKm, 0) * 10) / 10;
  }, [realActivities, activityType]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ranking</h1>
        <p className="text-muted-foreground">
          O ranking mostra só quem realmente usa o ZYRON — por enquanto, isso é só você.
        </p>
      </div>

      <Tabs value={activityType} onValueChange={(v) => setActivityType(v as ActivityType | "todas")}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          {ACTIVITY_TYPES.map((type) => (
            <TabsTrigger key={type} value={type}>
              {ACTIVITY_TYPE_CONFIG[type].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 border-2 border-brand">
            <AvatarFallback className="bg-brand-muted text-lg font-semibold text-brand">
              {getInitials(CURRENT_USER.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
              <Trophy className="size-3.5" />
              1º lugar
            </p>
            <p className="truncate font-semibold">{CURRENT_USER.name}</p>
            <p className="truncate text-xs text-muted-foreground">{city}</p>
          </div>
          <p className={cn("shrink-0 text-xl font-bold tabular-nums", totalKm === 0 && "text-muted-foreground")}>
            {totalKm.toLocaleString("pt-BR")} km
          </p>
        </div>

        <p className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          {totalKm === 0
            ? "Você ainda não registrou nenhuma atividade real. Grave uma no mapa para aparecer aqui com km de verdade."
            : "Nenhum outro participante ainda. Convide amigos para o ZYRON para ver mais gente aqui."}
        </p>
      </div>
    </div>
  );
}
