import type { Metadata } from "next";
import { RoutesExplorer } from "@/features/routes/routes-explorer";
import { MOCK_ROUTES } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Rotas" };

export default function RoutesPage() {
  return <RoutesExplorer routes={MOCK_ROUTES} />;
}
