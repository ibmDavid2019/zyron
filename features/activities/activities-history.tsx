"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity as ActivityIcon, Clock, Flame, Gauge } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "@/components/shared/bar-chart";
import { StatTile } from "@/components/shared/stat-tile";
import { ActivityCard } from "@/features/activities/activity-card";
import { ACTIVITY_TYPE_CONFIG, ACTIVITY_TYPES } from "@/constants/activities";
import type { Activity, ActivityType } from "@/types/activity";
import {
  aggregateStats,
  filterByPeriod,
  filterByType,
  getRecentMonthsSummary,
  getRecentWeeksSummary,
  getWeeklySummary,
  type ActivityPeriod,
} from "@/utils/activity-stats";
import { formatDistance, formatDuration } from "@/utils/format";
import { deleteActivity, getDeletedActivityIds, getSavedActivities } from "@/utils/local-store";

const PERIOD_LABELS: Record<ActivityPeriod, string> = {
  semana: "Semana",
  mes: "Mês",
  ano: "Ano",
};

export function ActivitiesHistory({ activities }: { activities: Activity[] }) {
  const [typeFilter, setTypeFilter] = useState<ActivityType | "todas">("todas");
  const [period, setPeriod] = useState<ActivityPeriod>("mes");
  const [allActivities, setAllActivities] = useState(activities);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const deletedIds = new Set(getDeletedActivityIds());
      setAllActivities([...getSavedActivities(), ...activities].filter((a) => !deletedIds.has(a.id)));
    }, 0);
    return () => clearTimeout(timeout);
  }, [activities]);

  function handleDelete(id: string) {
    const activity = allActivities.find((a) => a.id === id);
    deleteActivity(id);
    setAllActivities((prev) => prev.filter((a) => a.id !== id));
    toast.success(activity ? `"${activity.title}" excluída.` : "Atividade excluída.");
  }

  const byType = useMemo(() => filterByType(allActivities, typeFilter), [allActivities, typeFilter]);
  const filtered = useMemo(() => filterByPeriod(byType, period), [byType, period]);
  const stats = useMemo(() => aggregateStats(filtered), [filtered]);

  const evolution = useMemo(() => {
    if (period === "semana") {
      return getWeeklySummary(byType).map((d) => ({
        label: d.label,
        value: Number(d.distanceKm.toFixed(1)),
        highlighted: d.isToday,
      }));
    }
    if (period === "mes") return getRecentWeeksSummary(byType, 4);
    return getRecentMonthsSummary(byType, 6);
  }, [byType, period]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Minhas atividades</h1>
        <p className="text-muted-foreground">Acompanhe sua evolução ao longo do tempo.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActivityType | "todas")}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            {ACTIVITY_TYPES.map((type) => (
              <TabsTrigger key={type} value={type}>
                {ACTIVITY_TYPE_CONFIG[type].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as ActivityPeriod)}>
          <TabsList>
            {(Object.keys(PERIOD_LABELS) as ActivityPeriod[]).map((p) => (
              <TabsTrigger key={p} value={p}>
                {PERIOD_LABELS[p]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={ActivityIcon} label="Atividades" value={String(stats.count)} />
        <StatTile icon={Gauge} label="Distância" value={formatDistance(stats.distanceKm)} />
        <StatTile icon={Clock} label="Tempo" value={formatDuration(stats.durationSeconds)} />
        <StatTile icon={Flame} label="Calorias" value={`${Math.round(stats.calories)} kcal`} iconClassName="bg-warning/15 text-warning" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="font-semibold">Evolução</p>
        <BarChart className="mt-6" data={evolution} valueFormatter={(v) => `${v} km`} />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-semibold">Nenhuma atividade encontrada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajuste os filtros ou registre uma nova atividade.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/map">Começar minha primeira atividade</Link>
            </Button>
          </div>
        ) : (
          filtered.map((activity) => <ActivityCard key={activity.id} activity={activity} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  );
}
