import type { Metadata } from "next";
import { FeedList } from "@/features/feed/feed-list";
import { MOCK_FEED_POSTS } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Feed" };

export default function FeedPage() {
  return <FeedList posts={MOCK_FEED_POSTS} />;
}
