import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/constants/marketing";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section id="precos" className="scroll-mt-16 bg-muted/40 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simples, transparente, sem pegadinhas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Use o ZYRON de graça, com anúncios, ou assine para remover todos eles.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:items-start">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative w-full rounded-2xl border bg-card p-6",
                plan.highlighted ? "border-brand shadow-xl" : "border-border"
              )}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 right-6 bg-brand text-brand-foreground">
                  {plan.badge}
                </Badge>
              )}
              <p className="font-semibold">{plan.name}</p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="mt-6 w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
