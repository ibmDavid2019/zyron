import { ActivitySummaryLoader } from "@/features/activities/activity-summary-loader";
import { MOCK_ACTIVITIES } from "@/lib/mock-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = MOCK_ACTIVITIES.find((a) => a.id === id);
  return { title: activity?.title ?? "Atividade" };
}

export default async function ActivitySummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ActivitySummaryLoader id={id} />;
}
