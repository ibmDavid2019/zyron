import {
  Bike,
  Dumbbell,
  Footprints,
  Mountain,
  PersonStanding,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const ACTIVITY_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "corrida", label: "Corrida", icon: Footprints },
  { value: "caminhada", label: "Caminhada", icon: PersonStanding },
  { value: "ciclismo", label: "Ciclismo", icon: Bike },
  { value: "trilhas", label: "Trilhas", icon: Mountain },
  { value: "academia", label: "Academia", icon: Dumbbell },
  { value: "outros", label: "Outros", icon: Sparkles },
];

export const GOAL_OPTIONS: { value: string; label: string }[] = [
  { value: "condicionamento", label: "Melhorar condicionamento" },
  { value: "correr-mais", label: "Correr mais" },
  { value: "pedalar-mais", label: "Pedalar mais" },
  { value: "emagrecer", label: "Emagrecer" },
  { value: "rotina", label: "Criar rotina" },
  { value: "competir", label: "Competir" },
];

export const LEVEL_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: "iniciante", label: "Iniciante", description: "Estou começando agora ou voltando a treinar." },
  { value: "intermediario", label: "Intermediário", description: "Treino com regularidade há alguns meses." },
  { value: "avancado", label: "Avançado", description: "Treino com consistência e busco performance." },
];
