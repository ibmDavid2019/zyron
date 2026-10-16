import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { AiChat } from "@/features/ai/ai-chat";
import { AiContextPanel } from "@/features/ai/ai-context-panel";

export const metadata: Metadata = { title: "Zyron AI" };

export default function AiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Sparkles className="size-6 text-brand" />
          Zyron AI
        </h1>
        <p className="text-muted-foreground">Seu treinador inteligente.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <AiChat />
        <AiContextPanel />
      </div>

      <p className="max-w-2xl text-xs text-muted-foreground">
        A Zyron AI é uma assistente de treino baseada nos seus dados de atividade e não substitui
        orientação médica ou de um profissional de educação física.
      </p>
    </div>
  );
}
