"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ChevronRight,
  Clock,
  Download,
  Eye,
  EyeOff,
  Laptop,
  Loader2,
  Lock,
  Mail,
  Monitor,
  Moon,
  Pencil,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { getSavedActivities } from "@/utils/local-store";
import type { Subscription } from "@/types/subscription";

function daysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">{title}</h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">{children}</div>
    </section>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  description,
  action,
  href,
  external,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  action?: React.ReactNode;
  href?: string;
  /** Opens href in a new tab via a plain <a> instead of Next's client-side <Link> — for links leaving the app. */
  external?: boolean;
}) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {action ?? (href && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />)}
    </>
  );

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
      >
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-3 p-4">{content}</div>;
}

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    if (password !== formData.get("confirmPassword")) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Senha alterada com sucesso.");
      onOpenChange(false);
    } catch {
      toast.error("Supabase ainda não foi configurado nesta instância.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
          <DialogDescription>Escolha uma senha forte e fácil de lembrar.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="password">Nova senha</Label>
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
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Alterar senha
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [account, setAccount] = useState<{ email: string | null; subscription: Subscription | null } | null>(
    null
  );
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [privacy, setPrivacy] = useState({ publicProfile: true, showActivities: true, shareLocation: false });
  const [notifications, setNotifications] = useState({ likes: true, comments: true, followers: true, challenges: false });

  useEffect(() => {
    async function loadAccount() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("status, trial_ends_at, is_admin, current_period_end")
          .eq("user_id", user.id)
          .maybeSingle<Subscription>();

        setAccount({ email: user.email ?? null, subscription: subscription ?? null });
      } catch {
        // Supabase not configured in this instance — keep the mock email fallback.
      }
    }
    loadAccount();
  }, []);

  function updatePrivacy(key: keyof typeof privacy) {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preferência atualizada.");
  }

  function updateNotifications(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preferência atualizada.");
  }

  function handleExportData() {
    const data = { usuario: CURRENT_USER, atividades: getSavedActivities() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zyron-dados.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Seus dados foram exportados.");
  }

  function handleDeleteAccount() {
    toast.success("Conta marcada para exclusão (demonstração).");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências do ZYRON.</p>
      </div>

      <SettingsSection title="Conta">
        <SettingsRow icon={Pencil} label="Editar perfil" description="Foto, nome, bio e cidade" href="/settings/profile" />
        <SettingsRow
          icon={Mail}
          label="E-mail"
          description={account?.email ?? `${CURRENT_USER.username}@email.com`}
          action={
            <Button size="sm" variant="outline" onClick={() => toast.info("Alteração de e-mail em breve.")}>
              Alterar
            </Button>
          }
        />
        <SettingsRow
          icon={Lock}
          label="Senha"
          description="Última alteração há 3 meses"
          action={
            <Button size="sm" variant="outline" onClick={() => setPasswordDialogOpen(true)}>
              Alterar
            </Button>
          }
        />
        {account?.subscription?.is_admin ? (
          <SettingsRow
            icon={ShieldCheck}
            label="Administrador"
            description="Acesso ilimitado e gratuito a todos os recursos do ZYRON"
            action={
              <span className="rounded-full bg-brand-muted px-2.5 py-1 text-xs font-semibold text-brand">Ativo</span>
            }
          />
        ) : account?.subscription ? (
          account.subscription.status === "active" ? (
            <SettingsRow
              icon={PlayCircle}
              label="Acesso"
              description={`Liberado por anúncio · até ${formatDate(account.subscription.current_period_end)}`}
              href="/billing"
              action={
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  Ativo
                </span>
              }
            />
          ) : (
            (() => {
              const remaining = daysLeft(account.subscription.trial_ends_at);
              const trialActive = remaining !== null && remaining > 0 && account.subscription.status === "trialing";
              return (
                <SettingsRow
                  icon={trialActive ? Clock : PlayCircle}
                  label={trialActive ? "Teste grátis" : "Acesso"}
                  description={
                    trialActive
                      ? `Restam ${remaining} dia${remaining === 1 ? "" : "s"} · depois assista um anúncio`
                      : "Seu teste grátis acabou · assista um anúncio para liberar 24h"
                  }
                  action={
                    <Button size="sm" asChild>
                      <Link href="/billing">{trialActive ? "Ver opções" : "Assistir anúncio"}</Link>
                    </Button>
                  }
                />
              );
            })()
          )
        ) : null}
      </SettingsSection>

      <SettingsSection title="Privacidade">
        <SettingsRow
          icon={Lock}
          label="Perfil público"
          description="Qualquer pessoa pode ver seu perfil"
          action={<Switch checked={privacy.publicProfile} onCheckedChange={() => updatePrivacy("publicProfile")} />}
        />
        <SettingsRow
          icon={Lock}
          label="Mostrar atividades no feed"
          description="Suas atividades aparecem para seguidores"
          action={<Switch checked={privacy.showActivities} onCheckedChange={() => updatePrivacy("showActivities")} />}
        />
        <SettingsRow
          icon={Lock}
          label="Compartilhar localização"
          description="Exibir cidade nas suas atividades"
          action={<Switch checked={privacy.shareLocation} onCheckedChange={() => updatePrivacy("shareLocation")} />}
        />
      </SettingsSection>

      <SettingsSection title="Notificações">
        <SettingsRow
          icon={Mail}
          label="Curtidas"
          action={<Switch checked={notifications.likes} onCheckedChange={() => updateNotifications("likes")} />}
        />
        <SettingsRow
          icon={Mail}
          label="Comentários"
          action={<Switch checked={notifications.comments} onCheckedChange={() => updateNotifications("comments")} />}
        />
        <SettingsRow
          icon={Mail}
          label="Novos seguidores"
          action={<Switch checked={notifications.followers} onCheckedChange={() => updateNotifications("followers")} />}
        />
        <SettingsRow
          icon={Mail}
          label="Desafios"
          action={<Switch checked={notifications.challenges} onCheckedChange={() => updateNotifications("challenges")} />}
        />
      </SettingsSection>

      <section className="space-y-3">
        <h2 className="font-semibold">Aparência</h2>
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-2">
          {[
            { value: "light", label: "Claro", icon: Sun },
            { value: "dark", label: "Escuro", icon: Moon },
            { value: "system", label: "Sistema", icon: Monitor },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              suppressHydrationWarning
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl py-3 text-sm font-medium transition-colors",
                theme === option.value ? "bg-brand-muted text-brand" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <option.icon className="size-4.5" />
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <SettingsSection title="Segurança">
        <SettingsRow
          icon={Laptop}
          label="Este dispositivo"
          description="Windows · São Paulo, BR · ativo agora"
          action={<span className="text-xs font-medium text-success">Atual</span>}
        />
        <SettingsRow
          icon={Smartphone}
          label="iPhone de David"
          description="Último acesso há 2 dias"
          action={
            <Button size="sm" variant="ghost" onClick={() => toast.success("Sessão encerrada.")}>
              Encerrar
            </Button>
          }
        />
      </SettingsSection>

      <SettingsSection title="Dados da conta">
        <SettingsRow
          icon={Download}
          label="Exportar dados"
          description="Baixe uma cópia dos seus dados em JSON"
          action={
            <Button size="sm" variant="outline" onClick={handleExportData}>
              Exportar
            </Button>
          }
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-destructive/5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-destructive">Excluir conta</p>
                <p className="text-xs text-muted-foreground">Essa ação não pode ser desfeita</p>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
              <AlertDialogDescription>
                Todos os seus dados, atividades e conquistas serão removidos permanentemente. Essa ação não
                pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={handleDeleteAccount}
              >
                Excluir conta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SettingsSection>

      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </div>
  );
}
