"use client";

import { useState } from "react";
import { CalendarCheck, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OUTDOOR_TYPE_CONFIG } from "@/constants/activities";
import type { SportEvent } from "@/types/event";
import { formatDistance } from "@/utils/format";

export function EventDetails({ event }: { event: SportEvent }) {
  const [interested, setInterested] = useState(false);
  const config = OUTDOOR_TYPE_CONFIG[event.type];
  const date = new Date(event.date);

  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
          <config.icon className="size-3.5" />
          {config.label}
        </p>
        <h3 className="mt-1 text-lg font-bold">{event.name}</h3>
      </div>

      <div className="space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <CalendarCheck className="size-4 shrink-0" />
          {date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} às{" "}
          {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="size-4 shrink-0" />
          {event.location}
        </p>
        <p className="flex items-center gap-1.5">
          <Users className="size-4 shrink-0" />
          {event.participantsCount.toLocaleString("pt-BR")} participantes · {formatDistance(event.distanceKm)}
        </p>
      </div>

      <Button
        variant={interested ? "secondary" : "default"}
        className="w-full"
        onClick={() => {
          setInterested((i) => !i);
          if (!interested) toast.success("Interesse registrado!");
        }}
      >
        {interested ? "Interesse confirmado" : "Tenho interesse"}
      </Button>
    </div>
  );
}
