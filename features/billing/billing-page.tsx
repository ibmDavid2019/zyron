"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2, PlayCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { adsAvailable, showRewardedAd } from "@/lib/admob";
import type { Subscription } from "@/types/subscription";

function daysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  async function load(): Promise<Subscription | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at, is_admin, current_period_end")
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
        toast.info("Anúncio não concluído. Assista até o final para liberar o acesso.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.rpc("grant_ad_unlock");
      if (error) {
        toast.error(error.message);
        return;
      }

      await load();
      toast.success("Acesso liberado por 24h!");
      router.push("/dashboard");
    } catch {
      toast.error("Não foi possível carregar o anúncio agora. Tente de novo em alguns instantes.");
    } finally {
      setUnlocking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const remaining = daysLeft(subscription?.trial_ends_at ?? null);
  const isAdmin = subscription?.is_admin === true;
  const isActive = isAdmin || subscription?.status === "active";
  const isTrialing = !isAdmin && subscription?.status === "trialing" && remaining !== null && remaining > 0;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand">
          {isActive ? <CheckCircle2 className="size-6" /> : isTrialing ? <Clock className="size-6" /> : <ShieldAlert className="size-6" />}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          {isAdmin
            ? "Acesso administrativo"
            : isActive
              ? "Seu acesso está liberado"
              : isTrialing
                ? "Você está no período de teste"
                : "Continue usando o ZYRON grátis"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isAdmin && "Sua conta tem acesso ilimitado a todos os recursos do ZYRON."}
          {!isAdmin && isActive && `Aproveite todos os recursos do ZYRON até ${new Date(subscription!.current_period_end!).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}.`}
          {!isAdmin && isTrialing && `Restam ${remaining} dia${remaining === 1 ? "" : "s"} do seu teste grátis de 7 dias.`}
          {!isAdmin &&
            !isActive &&
            !isTrialing &&
            "Seu período de teste grátis acabou. O ZYRON é grátis — assista a um anúncio para liberar mais 24h de acesso completo."}
        </p>
      </div>

      {!isActive && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand">
            <PlayCircle className="size-4" />
            Desbloqueio por anúncio
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Assista a um anúncio curto para liberar 24h de acesso completo ao ZYRON. Sem pagamento, sem assinatura.
          </p>

          {adsAvailable() ? (
            <Button size="lg" className="mt-5 w-full" onClick={handleWatchAd} disabled={unlocking}>
              {unlocking && <Loader2 className="size-4 animate-spin" />}
              Assistir anúncio e liberar 24h
            </Button>
          ) : (
            <p className="mt-5 text-xs text-muted-foreground">
              Os anúncios estão disponíveis apenas no app para Android. Abra o ZYRON pelo app instalado no seu
              celular para liberar o acesso.
            </p>
          )}
        </div>
      )}

      {isActive && (
        <Button size="lg" className="w-full" onClick={() => router.push("/dashboard")}>
          Ir para o Dashboard
        </Button>
      )}
    </div>
  );
}
