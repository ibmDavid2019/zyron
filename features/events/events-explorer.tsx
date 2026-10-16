"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/features/events/event-card";
import { OUTDOOR_TYPE_CONFIG, OUTDOOR_TYPES } from "@/constants/activities";
import type { OutdoorActivityType } from "@/types/route";
import type { SportEvent } from "@/types/event";

export function EventsExplorer({ events }: { events: SportEvent[] }) {
  const [filter, setFilter] = useState<OutdoorActivityType | "todas">("todas");
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => (filter === "todas" ? events : events.filter((e) => e.type === filter)),
    [events, filter]
  );

  function toggleInterest(id: string) {
    setInterestedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        toast.success("Interesse registrado!");
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Eventos</h1>
        <p className="text-muted-foreground">Corridas, pedais e trilhas para participar.</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as OutdoorActivityType | "todas")}>
        <TabsList>
          <TabsTrigger value="todas">Todos</TabsTrigger>
          {OUTDOOR_TYPES.map((type) => (
            <TabsTrigger key={type} value={type}>
              {OUTDOOR_TYPE_CONFIG[type].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            interested={interestedIds.has(event.id)}
            onToggleInterest={toggleInterest}
          />
        ))}
      </div>
    </div>
  );
}
