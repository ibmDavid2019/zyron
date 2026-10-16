import type { Metadata } from "next";
import { EventsExplorer } from "@/features/events/events-explorer";
import { MOCK_EVENTS } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Eventos" };

export default function EventsPage() {
  return <EventsExplorer events={MOCK_EVENTS} />;
}
