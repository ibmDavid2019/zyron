import type { ActivityType } from "@/types/activity";

export interface FeedAuthor {
  name: string;
  username: string;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  activityType: ActivityType;
  title: string;
  createdAt: string;
  distanceKm: number;
  durationSeconds: number;
  routeVariant: 1 | 2 | 3;
  likes: number;
  liked: boolean;
  comments: number;
}
