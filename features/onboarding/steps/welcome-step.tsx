import { Bike, Footprints, PersonStanding, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export function WelcomeStep() {
  return (
    <div className="space-y-8 text-center">
      <div className="relative mx-auto flex size-24 items-center justify-center">
        <div className="bg-gradient-brand glow-brand absolute inset-0 rounded-3xl" />
        <Logo size={48} wordmark={false} className="relative" />
        {[Footprints, Bike, PersonStanding, Sparkles].map((Icon, i) => (
          <span
            key={i}
            className="absolute flex size-9 items-center justify-center rounded-xl border border-border bg-card text-brand shadow-lg"
            style={
              [
                { top: "-14px", left: "-14px" },
                { top: "-14px", right: "-14px" },
                { bottom: "-14px", left: "-14px" },
                { bottom: "-14px", right: "-14px" },
              ][i]
            }
          >
            <Icon className="size-4.5" />
          </span>
        ))}
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao ZYRON</h1>
        <p className="text-muted-foreground text-balance">
          Vamos configurar sua experiência em menos de 2 minutos para personalizar seus treinos
          e recomendações.
        </p>
      </div>
    </div>
  );
}
