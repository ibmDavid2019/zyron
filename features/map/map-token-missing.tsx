import { MapPinOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function MapTokenMissing({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-gradient-brand flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center",
        className
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-white/15 text-white">
        <MapPinOff className="size-6" />
      </span>
      <div className="max-w-sm space-y-1.5">
        <p className="text-lg font-bold text-white">Mapa não configurado</p>
        <p className="text-sm text-white/80">
          Adicione um token público do Mapbox em{" "}
          <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> no
          arquivo <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">.env.local</code> para ativar o
          mapa interativo.
        </p>
      </div>
    </div>
  );
}
