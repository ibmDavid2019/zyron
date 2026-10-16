import { notFound } from "next/navigation";
import { PublicProfile } from "@/features/profile/public-profile";
import { CURRENT_USER, MOCK_USERS } from "@/lib/mock-data";

function findUser(username: string) {
  if (username === CURRENT_USER.username) return CURRENT_USER;
  return MOCK_USERS.find((u) => u.username === username);
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = findUser(username);
  return { title: user ? user.name : "Perfil" };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = findUser(username);

  if (!user) notFound();

  return <PublicProfile user={user} />;
}
