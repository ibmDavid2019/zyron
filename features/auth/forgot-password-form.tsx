"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email") as string;

    setLoading(true);
    try {
      const supabase = createClient();
      // Supabase's default "Reset Password" email template (can't be
      // customized without a custom SMTP provider configured) uses a PKCE
      // link, which only completes on the same browser/app that requested
      // it — see the note on the confirmation screen below.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setSentTo(email);
    } catch {
      toast.error("Supabase ainda não foi configurado nesta instância.");
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <div className="space-y-6 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand">
          <MailCheck className="size-6" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">Verifique seu e-mail</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de recuperação para <strong className="text-foreground">{sentTo}</strong>.
          </p>
          <p className="text-xs text-muted-foreground">
            Abra o link no mesmo navegador ou app que você usou para pedir a recuperação — em outro, ele não funciona.
          </p>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">
            <ArrowLeft className="size-4" />
            Voltar para o login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Esqueceu sua senha?</h1>
        <p className="text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@email.com" required autoComplete="email" />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Enviar link de recuperação
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
          <ArrowLeft className="size-3.5" />
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
