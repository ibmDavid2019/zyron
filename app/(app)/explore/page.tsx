import type { Metadata } from "next";
import { ExplorePage } from "@/features/explore/explore-page";
import { MOCK_EVENTS, MOCK_FEED_POSTS, MOCK_ROUTES } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Explorar" };

export default function Explore() {
  return <ExplorePage posts={MOCK_FEED_POSTS} routes={MOCK_ROUTES} events={MOCK_EVENTS} />;
}
