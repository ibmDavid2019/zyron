"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, PlayCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { adsAvailable, showRewardedAd } from "@/lib/admob";
import type { Subscription } from "@/types/subscription";

const MONTHLY_PRICE_LABEL = "R$14,90/mês";
const CAKTO_OFFER_ID = process.env.NEXT_PUBLIC_CAKTO_OFFER_ID;

export function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  async function load(): Promise<Subscription | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    setEmail(user.email ?? null);
    setName((user.user_metadata?.name as string | undefined) ?? null);

    const { data } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at, is_admin, current_period_end, cancel_requested_at, cakto_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle<Subscription>();
    setSubscription(data);
    return data;
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      load().finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  async function handleWatchAd() {
    setUnlocking(true);
    try {
      const rewarded = await showRewardedAd();
      if (!rewarded) {
        toast.info("Anúncio não concluído. Assista até o final para remover os anúncios por 24h.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.rpc("grant_ad_unlock");
      if (error) {
        toast.error(error.message);
        return;
      }

      await load();
      toast.success("Anúncios removidos por 24h!");
    } catch {
      toast.error("Não foi possível carregar o anúncio agora. Tente de novo em alguns instantes.");
    } finally {
      setUnlocking(false);
    }
  }

  async function handleCheckAgain() {
    setChecking(true);
    const fresh = await load();
    setChecking(false);
    if (fresh?.is_admin === true || fresh?.status === "active") {
      toast.success("Assinatura confirmada! Seus anúncios foram removidos.");
    } else {
      toast.info("Ainda não identificamos seu pagamento. Se você acabou de pagar, aguarde alguns instantes e tente de novo.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isAdmin = subscription?.is_admin === true;
  const isPremium = isAdmin || subscription?.status === "active";

  const checkoutUrl = CAKTO_OFFER_ID
    ? `https://pay.cakto.com.br/${CAKTO_OFFER_ID}${email ? `?email=${encodeURIComponent(email)}${name ? `&name=${encodeURIComponent(name)}` : ""}` : ""}`
    : null;

  if (isPremium) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand">
          <CheckCircle2 className="size-6" />
        </span>
        <div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Você está no Premium</h1>
          <p className="mt-1 text-muted-foreground">
            {isAdmin
              ? "Sua conta tem acesso administrativo, sem anúncios."
              : subscription?.cakto_subscription_id
                ? "Sua assinatura está ativa. Sem anúncios enquanto ela durar."
                : subscription?.current_period_end
                  ? `Sem anúncios até ${new Date(subscription.current_period_end).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}.`
                  : "Sem anúncios."}
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={() => router.push("/dashboard")}>
          Ir para o Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Escolha como usar o ZYRON</h1>
        <p className="mt-1 text-muted-foreground">
          O app é sempre gratuito e completo. Você escolhe se quer ver anúncios ou pagar para removê-los.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <PlayCircle className="size-4" />
            Grátis, com anúncios
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">R$0</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Acesso completo ao ZYRON, com banners e anúncios entre as telas.
          </p>

          {adsAvailable() ? (
            <Button variant="outline" className="mt-5 w-full" onClick={handleWatchAd} disabled={unlocking}>
              {unlocking && <Loader2 className="size-4 animate-spin" />}
              Assistir anúncio e remover por 24h
            </Button>
          ) : (
            <p className="mt-5 text-xs text-muted-foreground">
              Esse recurso só funciona no app para Android.
            </p>
          )}
        </div>

        <div className="relative rounded-2xl border border-brand bg-card p-6 text-center shadow-xl">
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand">
            <Sparkles className="size-4" />
            Premium, sem anúncios
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{MONTHLY_PRICE_LABEL}</p>
          <p className="mt-1 text-xs text-muted-foreground">Cobrança recorrente mensal, cancele quando quiser.</p>

          {checkoutUrl ? (
            <Button asChild size="lg" className="mt-5 w-full">
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                Assinar por {MONTHLY_PRICE_LABEL}
              </a>
            </Button>
          ) : (
            <p className="mt-5 text-xs text-destructive">
              Pagamento ainda não configurado nesta instância. Fale com o suporte.
            </p>
          )}

          <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={handleCheckAgain} disabled={checking}>
            {checking && <Loader2 className="size-4 animate-spin" />}
            Já paguei, verificar de novo
          </Button>
        </div>
      </div>

      <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>
        Continuar grátis, com anúncios
      </Button>
    </div>
  );
}
