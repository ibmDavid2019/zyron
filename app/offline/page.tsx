"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Logo size={36} />
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff className="size-6" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">Você está offline</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Não foi possível carregar esta página. Verifique sua conexão e tente novamente.
        </p>
      </div>
      <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
    </div>
  );
}
