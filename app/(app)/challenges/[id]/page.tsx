import { notFound } from "next/navigation";
import { ChallengeDetail } from "@/features/challenges/challenge-detail";
import { MOCK_ACTIVITIES, MOCK_CHALLENGES } from "@/lib/mock-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = MOCK_CHALLENGES.find((c) => c.id === id);
  return { title: challenge?.name ?? "Desafio" };
}

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = MOCK_CHALLENGES.find((c) => c.id === id);

  if (!challenge) notFound();

  const relatedActivities = challenge.relatedActivityIds
    .map((activityId) => MOCK_ACTIVITIES.find((a) => a.id === activityId))
    .filter((a): a is (typeof MOCK_ACTIVITIES)[number] => Boolean(a));

  return <ChallengeDetail challenge={challenge} relatedActivities={relatedActivities} />;
}
