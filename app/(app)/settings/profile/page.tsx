import type { Metadata } from "next";
import { EditProfileForm } from "@/features/settings/edit-profile-form";

export const metadata: Metadata = { title: "Editar perfil" };

export default function EditProfilePage() {
  return <EditProfileForm />;
}
