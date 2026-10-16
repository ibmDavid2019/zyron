import { notFound } from "next/navigation";
import { CommunityDetail } from "@/features/communities/community-detail";
import { CURRENT_USER, MOCK_CHALLENGES, MOCK_COMMUNITIES, MOCK_EVENTS, MOCK_FEED_POSTS, MOCK_USERS } from "@/lib/mock-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const community = MOCK_COMMUNITIES.find((c) => c.id === id);
  return { title: community?.name ?? "Comunidade" };
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const community = MOCK_COMMUNITIES.find((c) => c.id === id);

  if (!community) notFound();

  return (
    <CommunityDetail
      community={community}
      members={[CURRENT_USER, ...MOCK_USERS]}
      posts={MOCK_FEED_POSTS}
      challenges={MOCK_CHALLENGES.slice(0, 4)}
      events={MOCK_EVENTS.slice(0, 3)}
    />
  );
}
