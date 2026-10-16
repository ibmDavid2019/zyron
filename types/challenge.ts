import type { OutdoorActivityType } from "@/types/route";

export type ChallengeStatus = "descobrir" | "participando" | "concluido";

export interface ChallengeLeaderboardEntry {
  rank: number;
  name: string;
  username: string;
  progressKm: number;
  isCurrentUser?: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  goalKm: number;
  progressKm: number;
  participants: number;
  rank: number;
  status: ChallengeStatus;
  activityType: OutdoorActivityType | "todas";
  leaderboard: ChallengeLeaderboardEntry[];
  relatedActivityIds: string[];
}
