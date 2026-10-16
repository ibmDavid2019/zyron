"use client";

import { useState } from "react";
import { BarChart } from "@/components/shared/bar-chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DaySummary } from "@/utils/activity-stats";
import { formatDuration } from "@/utils/format";

type Metric = "distancia" | "tempo" | "atividades";

export function WeeklySummaryChart({ week }: { week: DaySummary[] }) {
  const [metric, setMetric] = useState<Metric>("distancia");

  const data = week.map((day) => ({
    label: day.label,
    highlighted: day.isToday,
    value:
      metric === "distancia"
        ? Number(day.distanceKm.toFixed(1))
        : metric === "tempo"
          ? Math.round(day.durationSeconds / 60)
          : day.count,
  }));

  const valueFormatter = (value: number) =>
    metric === "distancia" ? `${value} km` : metric === "tempo" ? formatDuration(value * 60) : `${value}x`;

  return (
    <div>
      <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
        <TabsList>
          <TabsTrigger value="distancia">Distância</TabsTrigger>
          <TabsTrigger value="tempo">Tempo</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
        </TabsList>
      </Tabs>
      <BarChart data={data} valueFormatter={valueFormatter} className="mt-6" />
    </div>
  );
}
