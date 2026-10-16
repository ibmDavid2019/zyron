import type { TrainingLevel } from "@/types/training-plan";

export interface StrengthSplitDay {
  key: "A" | "B" | "C";
  focus: string;
  exercises: string;
}

/**
 * Classic Push/Pull/Legs A-B-C split, one exercise list per level. Shared by
 * the training plan catalog and the Zyron AI chat so both stay consistent.
 */
export const STRENGTH_SPLITS: Record<TrainingLevel, StrengthSplitDay[]> = {
  Iniciante: [
    {
      key: "A",
      focus: "Peito, Ombro e Tríceps",
      exercises: "Supino reto 3x10, Desenvolvimento com halteres 3x10, Tríceps na corda 3x12",
    },
    {
      key: "B",
      focus: "Costas e Bíceps",
      exercises: "Puxada frontal 3x10, Remada curvada 3x10, Rosca direta 3x12",
    },
    {
      key: "C",
      focus: "Pernas e Core",
      exercises: "Agachamento livre 3x10, Leg press 3x12, Panturrilha em pé 3x15, Prancha 3x30s",
    },
  ],
  Intermediário: [
    {
      key: "A",
      focus: "Peito, Ombro e Tríceps",
      exercises:
        "Supino reto 4x8-10, Supino inclinado com halteres 3x10, Desenvolvimento militar 4x10, Elevação lateral 3x12, Tríceps na corda 3x12, Tríceps testa 3x12",
    },
    {
      key: "B",
      focus: "Costas e Bíceps",
      exercises: "Barra fixa (ou puxada frontal) 4x8-10, Remada curvada 4x10, Remada unilateral 3x12, Rosca direta 3x12, Rosca alternada 3x12",
    },
    {
      key: "C",
      focus: "Pernas e Core",
      exercises:
        "Agachamento livre 4x8-10, Leg press 4x12, Cadeira extensora 3x12, Mesa flexora 3x12, Panturrilha em pé 4x15, Prancha 3x45s, Abdominal remador 3x15",
    },
  ],
  Avançado: [
    {
      key: "A",
      focus: "Peito, Ombro e Tríceps",
      exercises:
        "Supino reto 5x6-8, Supino inclinado com halteres 4x8-10, Crucifixo 3x12, Desenvolvimento militar 4x8, Elevação lateral 4x15, Tríceps na corda 4x12, Tríceps francês 3x12",
    },
    {
      key: "B",
      focus: "Costas e Bíceps",
      exercises: "Barra fixa 5x6-8, Remada curvada 4x10, Remada cavalinho 4x10, Puxada frontal 3x12, Rosca direta 4x10, Rosca martelo 3x12",
    },
    {
      key: "C",
      focus: "Pernas e Core",
      exercises:
        "Agachamento livre 5x6-8, Levantamento terra 4x8, Leg press 4x12, Cadeira extensora 4x12, Mesa flexora 4x12, Panturrilha em pé 5x15, Prancha 4x60s, Abdominal remador 4x15",
    },
  ],
};

export function formatSplitSummary(level: TrainingLevel): string {
  return STRENGTH_SPLITS[level].map((d) => `${d.key} (${d.focus}): ${d.exercises}`).join(" | ");
}

/** Reads the split key back out of a weekly-plan day's activity label (e.g. "Musculação A (Peito, Ombro e Tríceps)" → "A"), as written by mock-responses.ts's tryCreateWorkout. Returns null for anything that isn't a strength day. */
export function parseStrengthSplitKey(activity: string): "A" | "B" | "C" | null {
  const match = /musculação\s+([abc])\b/i.exec(activity);
  return match ? (match[1].toUpperCase() as "A" | "B" | "C") : null;
}
