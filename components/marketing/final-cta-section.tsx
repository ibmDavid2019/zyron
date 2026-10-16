import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="bg-gradient-brand relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 80% 60%, white 0, transparent 40%)",
          }}
        />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-balance text-brand-foreground sm:text-4xl">
            Pronto para começar sua evolução?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-brand-foreground/80 text-balance">
            Junte-se a milhares de pessoas que já transformaram seus treinos com o ZYRON.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/register">
              Criar minha conta
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
