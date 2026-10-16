"use client";

import { CalendarCheck, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OUTDOOR_TYPE_CONFIG } from "@/constants/activities";
import type { SportEvent } from "@/types/event";
import { formatDistance } from "@/utils/format";

export function EventCard({
  event,
  interested,
  onToggleInterest,
}: {
  event: SportEvent;
  interested: boolean;
  onToggleInterest: (id: string) => void;
}) {
  const config = OUTDOOR_TYPE_CONFIG[event.type];
  const date = new Date(event.date);
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-muted text-brand">
        <span className="text-xs font-semibold">{month}</span>
        <span className="text-2xl font-bold leading-none">{date.getDate()}</span>
      </div>

      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand">
          <config.icon className="size-3.5" />
          {config.label}
        </span>
        <p className="mt-0.5 truncate font-semibold">{event.name}</p>
        <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarCheck className="size-3.5 shrink-0" />
            {date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} às {time}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            {event.participantsCount.toLocaleString("pt-BR")} participantes · {formatDistance(event.distanceKm)}
          </p>
        </div>

        <Button
          size="sm"
          variant={interested ? "secondary" : "outline"}
          className="mt-3"
          onClick={() => onToggleInterest(event.id)}
        >
          {interested ? "Interesse confirmado" : "Tenho interesse"}
        </Button>
      </div>
    </div>
  );
}
