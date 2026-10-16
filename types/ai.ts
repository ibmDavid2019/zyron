export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

import type { TrainingLevel } from "@/types/training-plan";

export interface WeeklyPlanDay {
  day: string;
  activity: string;
  isRest: boolean;
  /** Which level's exercise list this day's musculação split (A/B/C) refers to — only set for strength days, so the detail view shows the exact exercises the user actually got, not a guess based on whatever plan happens to be active later. */
  level?: TrainingLevel;
}
