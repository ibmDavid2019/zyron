import { CURRENT_USER, MOCK_CHALLENGES } from "@/lib/mock-data";
import type { AchievementCategory } from "@/types/achievement";
import type { Activity } from "@/types/activity";
import type { User } from "@/types/user";
import { aggregateStats } from "@/utils/activity-stats";

export interface ProfileStats {
  activitiesCount: number;
  distanceKm: number;
  durationSeconds: number;
}

/**
 * Real stats for the current user, from `extraActivities` only — the real,
 * locally-recorded activities (a brand-new account genuinely has none yet).
 * Other mock users get a deterministic level-based estimate, since only the
 * current user has a real activity history in this dataset.
 */
export function getProfileStats(user: User, extraActivities: Activity[] = []): ProfileStats {
  if (user.username === CURRENT_USER.username) {
    const stats = aggregateStats(extraActivities);
    return { activitiesCount: stats.count, distanceKm: Math.round(stats.distanceKm * 10) / 10, durationSeconds: stats.durationSeconds };
  }

  const activitiesCount = user.level * 3;
  const distanceKm = Math.round(user.level * 6.4 * 10) / 10;
  const durationSeconds = Math.round(distanceKm * 340);
  return { activitiesCount, distanceKm, durationSeconds };
}

export function getProfileAchievementValues(user: User, extraActivities: Activity[] = []): Record<AchievementCategory, number> {
  const stats = getProfileStats(user, extraActivities);
  const isCurrentUser = user.username === CURRENT_USER.username;
  const realChallengesCompleted = MOCK_CHALLENGES.filter((c) => c.status === "concluido").length;

  return {
    distancia: stats.distanceKm,
    frequencia: stats.activitiesCount,
    desafios: isCurrentUser ? realChallengesCompleted : Math.max(Math.floor(user.level / 8), 0),
    sequencia: user.streakDays,
  };
}
