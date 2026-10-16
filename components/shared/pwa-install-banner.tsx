"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { APP_NAME } from "@/constants/brand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "zyron-pwa-install-dismissed";

export function PwaInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  // Safe to read synchronously: this component always renders null until
  // `installEvent` is set (which only happens after mount), so the
  // server/client value mismatch here never reaches the DOM.
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(DISMISSED_KEY) === "1"
  );

  useEffect(() => {
    function handlePrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    dismiss();
  }

  if (!installEvent || dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-2xl lg:bottom-4 lg:left-72 lg:right-4">
      <Logo size={32} wordmark={false} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Instalar {APP_NAME}</p>
        <p className="text-xs text-muted-foreground">Acesso rápido direto da sua tela inicial.</p>
      </div>
      <Button size="sm" onClick={handleInstall}>
        <Download className="size-3.5" />
        Instalar
      </Button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dispensar"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
