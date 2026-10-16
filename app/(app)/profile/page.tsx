import type { Metadata } from "next";
import { MyProfile } from "@/features/profile/my-profile";

export const metadata: Metadata = { title: "Meu perfil" };

export default function ProfilePage() {
  return <MyProfile />;
}
