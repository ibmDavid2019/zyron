import type { Metadata } from "next";
import { NotificationsPage } from "@/features/notifications/notifications-page";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Notificações" };

export default function Notifications() {
  return <NotificationsPage notifications={MOCK_NOTIFICATIONS} />;
}
