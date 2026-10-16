"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <Logo size={32} />
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">Algo deu errado</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/">Página inicial</Link>
        </Button>
        <Button onClick={reset}>
          <RotateCcw className="size-4" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
