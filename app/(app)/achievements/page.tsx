import type { Metadata } from "next";
import { AchievementsPage } from "@/features/achievements/achievements-page";
import { MOCK_ACHIEVEMENTS } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Conquistas" };

export default function Achievements() {
  // Real progress (activities, challenges) only exists client-side, in
  // localStorage — AchievementsPage hydrates it after mount.
  return <AchievementsPage achievements={MOCK_ACHIEVEMENTS} />;
}
