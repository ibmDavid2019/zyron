import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

const HIGHLIGHTS = [
  { icon: TrendingUp, text: "Analisa sua evolução semana a semana" },
  { icon: Zap, text: "Gera treinos sob medida para seu objetivo" },
  { icon: Sparkles, text: "Ajusta o plano conforme seu desempenho" },
];

export function AiSection() {
  return (
    <section id="zyron-ai" className="scroll-mt-16 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="size-3.5" />
            Zyron AI
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Seu treino. Sua evolução. Inteligência artificial.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            A Zyron AI acompanha cada atividade e transforma seus dados em recomendações
            práticas — como um treinador que nunca dorme.
          </p>

          <ul className="mt-6 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
                  <item.icon className="size-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>

          <Button size="lg" className="mt-8" asChild>
            <Link href="/register">
              Conheça o Zyron AI
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <p className="mt-4 max-w-md text-xs text-muted-foreground">
            A Zyron AI é uma assistente de treino e não substitui orientação médica ou de um
            profissional de educação física.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-2xl sm:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
            <Logo size={26} wordmark={false} />
            <div>
              <p className="text-sm font-semibold">Zyron AI</p>
              <p className="text-xs text-muted-foreground">Seu treinador inteligente</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-brand-foreground">
                <Sparkles className="size-3.5" />
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm">
                Você aumentou sua distância semanal em <strong>12%</strong>. 📈 Ótimo ritmo de
                evolução!
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-brand-foreground">
                <Sparkles className="size-3.5" />
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm">
                Seu próximo treino recomendado é uma <strong>corrida leve de 4 km</strong>,
                ritmo confortável.
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand px-4 py-2.5 text-sm text-brand-foreground">
                Quero correr 5 km esse fim de semana
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            {["Como está minha evolução?", "Crie um treino para mim", "Analise meu desempenho"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {chip}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
