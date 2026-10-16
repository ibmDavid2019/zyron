import type { Metadata } from "next";
import { CommunitiesPage } from "@/features/communities/communities-page";
import { MOCK_COMMUNITIES } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Comunidades" };

export default function Communities() {
  return <CommunitiesPage communities={MOCK_COMMUNITIES} />;
}
