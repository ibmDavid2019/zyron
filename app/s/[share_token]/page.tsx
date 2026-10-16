import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { PublicActivityUnavailable, PublicActivityView, type PublicActivitySnapshot } from "@/features/share/public-activity-view";

interface PageProps {
  params: Promise<{ share_token: string }>;
}

/**
 * Reads via the service-role admin client rather than a session-based
 * client — this page is unauthenticated by design (social crawlers and
 * anonymous visitors can't hold a Supabase session), so it explicitly
 * filters `is_public = true` in application code instead of relying on any
 * RLS policy (shared_activities intentionally has none for anon access).
 */
async function loadShare(shareToken: string) {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: shared } = await admin
    .from("shared_activities")
    .select("id, is_public, snapshot")
    .eq("share_token", shareToken)
    .eq("is_public", true)
    .maybeSingle();
  if (!shared) return null;

  const { data: media } = await admin
    .from("activity_media")
    .select("output_storage_path, status")
    .eq("shared_activity_id", shared.id)
    .eq("kind", "photo")
    .eq("status", "ready")
    .maybeSingle();

  let imageUrl: string | null = null;
  if (media?.output_storage_path) {
    const { data } = admin.storage.from("activity-shares").getPublicUrl(media.output_storage_path);
    imageUrl = data.publicUrl;
  }

  return { snapshot: shared.snapshot as PublicActivitySnapshot, imageUrl };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { share_token } = await params;
  const result = await loadShare(share_token);
  if (!result) return { title: "Atividade — ZYRON" };

  const { snapshot, imageUrl } = result;
  const title = `${snapshot.title} — ${snapshot.distanceLabel} de ${snapshot.typeLabel.toLowerCase()}`;
  const description = `${snapshot.distanceLabel} · ${snapshot.durationLabel} · ${snapshot.calories} kcal — registrado com o ZYRON.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1080, height: 1920 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function PublicSharePage({ params }: PageProps) {
  const { share_token } = await params;
  const result = await loadShare(share_token);

  if (!result) return <PublicActivityUnavailable />;
  return <PublicActivityView snapshot={result.snapshot} imageUrl={result.imageUrl} />;
}
