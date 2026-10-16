import type { Metadata } from "next";
import { LeaderboardPage } from "@/features/leaderboard/leaderboard-page";

export const metadata: Metadata = { title: "Ranking" };

export default function Leaderboard() {
  return <LeaderboardPage />;
}
