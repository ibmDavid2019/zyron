"use client";

import { useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LngLat } from "@/types/map";

interface LocationButtonProps {
  onLocate: (position: LngLat, accuracy: number) => void;
  className?: string;
}

export function LocationButton({ onLocate, className }: LocationButtonProps) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocalização não é suportada neste navegador.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        toast.success("Localização atual");
        onLocate([position.coords.longitude, position.coords.latitude], position.coords.accuracy);
      },
      () => {
        setLoading(false);
        toast.error("Não foi possível acessar sua localização. Verifique as permissões do navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label="Minha localização"
      className={cn(
        "flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted disabled:opacity-60",
        className
      )}
    >
      {loading ? <Loader2 className="size-4.5 animate-spin" /> : <LocateFixed className="size-4.5" />}
    </button>
  );
}
