import type { Metadata } from "next";
import { ShareEditorLoader } from "@/features/share/share-editor-loader";

export const metadata: Metadata = { title: "Compartilhar atividade" };

export default async function ActivityShareEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShareEditorLoader id={id} />;
}
