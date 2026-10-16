import Link from "next/link";
import { Flame, Gauge, Mountain, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import type { ActivityType } from "@/types/activity";

export interface PublicActivitySnapshot {
  type: ActivityType;
  typeLabel: string;
  title: string;
  distanceLabel: string;
  durationLabel: string;
  elevationM: number;
  calories: number;
  city: string | null;
}

export function PublicActivityView({ snapshot, imageUrl }: { snapshot: PublicActivitySnapshot; imageUrl: string | null }) {
  const config = ACTIVITY_TYPE_CONFIG[snapshot.type];

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center px-4 py-10 text-center">
      <Link href="/" className="mb-6 inline-flex">
        <Logo size={32} />
      </Link>

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL, not part of the Next.js image pipeline
        <img src={imageUrl} alt={snapshot.title} className="w-full max-w-70 rounded-2xl border border-border" />
      )}

      <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-brand">
        <config.icon className="size-4" />
        {snapshot.typeLabel}
      </div>
      <h1 className="mt-1 text-xl font-bold tracking-tight">{snapshot.title}</h1>
      {snapshot.city && <p className="text-sm text-muted-foreground">{snapshot.city}</p>}

      <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <Gauge className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-1 font-semibold">{snapshot.distanceLabel}</p>
          <p className="text-xs text-muted-foreground">Distância</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <Timer className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-1 font-semibold">{snapshot.durationLabel}</p>
          <p className="text-xs text-muted-foreground">Tempo</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <Mountain className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-1 font-semibold">{Math.round(snapshot.elevationM)} m</p>
          <p className="text-xs text-muted-foreground">Elevação</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <Flame className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-1 font-semibold">{snapshot.calories} kcal</p>
          <p className="text-xs text-muted-foreground">Calorias</p>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">Treine e acompanhe suas atividades com o ZYRON.</p>
      <Button size="lg" className="mt-3 w-full" asChild>
        <Link href="/register">Começar teste grátis</Link>
      </Button>
    </div>
  );
}

export function PublicActivityUnavailable() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
      <Link href="/" className="mb-6 inline-flex">
        <Logo size={32} />
      </Link>
      <p className="text-lg font-semibold">Essa atividade não está disponível</p>
      <p className="mt-1 text-sm text-muted-foreground">O link pode estar incorreto, ou a atividade não é mais pública.</p>
      <Button className="mt-6" asChild>
        <Link href="/">Conhecer o ZYRON</Link>
      </Button>
    </div>
  );
}
