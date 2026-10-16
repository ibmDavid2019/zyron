import { Bike, Footprints, Mountain, PersonStanding, type LucideIcon } from "lucide-react";
import type { ActivityType } from "@/types/activity";
import type { OutdoorActivityType } from "@/types/route";

export const ACTIVITY_TYPE_CONFIG: Record<
  ActivityType,
  { label: string; icon: LucideIcon; description: string; unit: "pace" | "speed" }
> = {
  corrida: {
    label: "Corrida",
    icon: Footprints,
    description: "Rastreamento por GPS com ritmo em tempo real.",
    unit: "pace",
  },
  caminhada: {
    label: "Caminhada",
    icon: PersonStanding,
    description: "Ideal para regeneração e volume leve.",
    unit: "pace",
  },
  ciclismo: {
    label: "Ciclismo",
    icon: Bike,
    description: "Trajetos com velocidade média e elevação.",
    unit: "speed",
  },
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_TYPE_CONFIG) as ActivityType[];

export const OUTDOOR_TYPE_CONFIG: Record<OutdoorActivityType, { label: string; icon: LucideIcon }> = {
  corrida: { label: "Corrida", icon: ACTIVITY_TYPE_CONFIG.corrida.icon },
  caminhada: { label: "Caminhada", icon: ACTIVITY_TYPE_CONFIG.caminhada.icon },
  ciclismo: { label: "Ciclismo", icon: ACTIVITY_TYPE_CONFIG.ciclismo.icon },
  trilha: { label: "Trilhas", icon: Mountain },
};

export const OUTDOOR_TYPES = Object.keys(OUTDOOR_TYPE_CONFIG) as OutdoorActivityType[];
