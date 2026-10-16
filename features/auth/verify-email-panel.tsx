"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "seu e-mail";
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    setResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("E-mail de confirmação reenviado.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      toast.error("Supabase ainda não foi configurado nesta instância.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-6 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand">
        <MailCheck className="size-6" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Confirme seu e-mail</h1>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de confirmação para <strong className="text-foreground">{email}</strong>.
          Clique no link para ativar sua conta.
        </p>
        <p className="text-xs text-muted-foreground">
          Abra o link no mesmo navegador ou app que você usou para se cadastrar — em outro, ele não funciona.
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleResend}
        disabled={cooldown > 0 || resending}
      >
        {resending && <Loader2 className="size-4 animate-spin" />}
        {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar e-mail"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
          <ArrowLeft className="size-3.5" />
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
