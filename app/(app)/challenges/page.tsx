import type { Metadata } from "next";
import { ChallengesPage } from "@/features/challenges/challenges-page";
import { MOCK_CHALLENGES } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Desafios" };

export default function Challenges() {
  return <ChallengesPage challenges={MOCK_CHALLENGES} />;
}
