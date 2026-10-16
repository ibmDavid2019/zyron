"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "@/components/shared/google-icon";
import { signInWithGoogle } from "@/features/auth/google-auth";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, username },
          // Same same-browser-only limitation as forgot-password-form.tsx —
          // Supabase's default "Confirm signup" template uses a PKCE link.
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) {
        toast.error(error.message === "User already registered" ? "Esse e-mail já tem uma conta." : error.message);
        return;
      }
      if (data.session) {
        // Email confirmation is disabled on this project — already logged in.
        toast.success("Conta criada! Vamos configurar seu perfil.");
        router.push("/onboarding");
      } else {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch {
      toast.error("Supabase ainda não foi configurado nesta instância.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    const error = await signInWithGoogle("/onboarding");
    if (error) {
      setGoogleLoading(false);
      toast.error(error);
    }
    // On success the browser navigates away to Google — no further action needed.
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">Comece sua evolução hoje mesmo.</p>
      </div>

      <Button
        variant="outline"
        className="w-full"
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
      >
        {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
        Continuar com Google
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">ou</span>
        <Separator className="flex-1" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" placeholder="Seu nome" required autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username">Usuário</Label>
            <Input id="username" name="username" placeholder="seunome" required autoComplete="username" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@email.com" required autoComplete="email" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Repita a senha"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm">
          <Checkbox
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-0.5"
          />
          <span className="text-muted-foreground">
            Concordo com os{" "}
            <Link href="/terms" className="font-medium text-foreground hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="font-medium text-foreground hover:underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>

        <Button type="submit" className="w-full" disabled={loading || !agreed}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
