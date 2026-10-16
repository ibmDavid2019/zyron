import type { Metadata } from "next";
import { ActivitiesHistory } from "@/features/activities/activities-history";

export const metadata: Metadata = { title: "Minhas atividades" };

export default function ActivitiesPage() {
  // A brand-new account has no activity history yet — only real, locally
  // recorded activities (hydrated inside ActivitiesHistory) show up here.
  return <ActivitiesHistory activities={[]} />;
}
