"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Bike, Footprints, Mountain, PersonStanding } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ActivityType } from "@/types/activity";

const MODALITIES: { type: "corrida" | "caminhada" | "ciclismo" | "trilha"; label: string; icon: typeof Footprints }[] = [
  { type: "corrida", label: "Corrida", icon: Footprints },
  { type: "caminhada", label: "Caminhada", icon: PersonStanding },
  { type: "ciclismo", label: "Ciclismo", icon: Bike },
  { type: "trilha", label: "Trilha", icon: Mountain },
];

interface RecordActivitySheetProps {
  trigger: ReactNode;
  /** Starts a real-GPS recording session for the chosen modality directly on the map. */
  onSelect: (type: ActivityType) => void;
}

export function RecordActivitySheet({ trigger, onSelect }: RecordActivitySheetProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(type: (typeof MODALITIES)[number]["type"]) {
    // The recording flow only models corrida/caminhada/ciclismo today —
    // trilha reuses the corrida tracking mode until it gets its own.
    if (type === "trilha") toast.info("Trilha usa o modo de gravação de corrida por enquanto.");
    setOpen(false);
    onSelect(type === "trilha" ? "corrida" : type);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Escolha sua atividade</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 px-4 pb-6">
          {MODALITIES.map((modality) => (
            <button
              key={modality.type}
              type="button"
              onClick={() => handleSelect(modality.type)}
              className="flex flex-col items-center gap-2.5 rounded-2xl border border-border p-5 text-sm font-medium transition-colors hover:border-brand hover:bg-brand-muted hover:text-brand"
            >
              <modality.icon className="size-6" />
              {modality.label}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
