import type { Metadata } from "next";
import { HelpPage } from "@/features/help/help-page";

export const metadata: Metadata = { title: "Central de ajuda" };

export default function Help() {
  return <HelpPage />;
}
