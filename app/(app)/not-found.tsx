import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand">
        <Compass className="size-6" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">Página não encontrada</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          O que você procura não existe ou foi movido. Vamos te levar de volta.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Ir para o dashboard</Link>
      </Button>
    </div>
  );
}
