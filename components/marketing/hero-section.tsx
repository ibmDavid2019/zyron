import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { APP_DESCRIPTION, APP_SLOGAN } from "@/constants/brand";

export function HeroSection() {
  return (
    <section className="overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-border bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
            Sua evolução esportiva, potencializada por IA
          </span>
          <h1 className="text-gradient-brand mt-5 text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-6xl">
            {APP_SLOGAN}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground text-balance lg:mx-0">
            {APP_DESCRIPTION} Corridas, pedaladas e caminhadas — tudo em um só lugar, com
            inteligência artificial guiando cada treino.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button size="lg" className="glow-brand w-full sm:w-auto" asChild>
              <Link href="/register">
                Criar conta grátis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <a href="#como-funciona">Como funciona</a>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Grátis para sempre, com anúncios.
          </p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
