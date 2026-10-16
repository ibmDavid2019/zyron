import type { ActivityType } from "@/types/activity";

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  city?: string;
  bio?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  favoriteActivityType?: ActivityType;
}
