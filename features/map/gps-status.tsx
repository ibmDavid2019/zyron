import { Satellite, SatelliteDish } from "lucide-react";
import { cn } from "@/lib/utils";

interface GpsStatusProps {
  accuracy: number | null;
  className?: string;
}

function accuracyLabel(accuracy: number) {
  if (accuracy <= 15) return "GPS de alta precisão";
  if (accuracy <= 50) return "GPS moderado";
  return "GPS impreciso";
}

export function GpsStatus({ accuracy, className }: GpsStatusProps) {
  if (accuracy === null) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-lg",
        accuracy <= 15 ? "text-success" : "text-muted-foreground",
        className
      )}
    >
      {accuracy <= 15 ? <SatelliteDish className="size-3.5" /> : <Satellite className="size-3.5" />}
      {accuracyLabel(accuracy)} · ±{Math.round(accuracy)}m
    </div>
  );
}
