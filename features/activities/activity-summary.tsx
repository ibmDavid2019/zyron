"use client";

import { useRef, useState, type ChangeEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Flame,
  Gauge,
  Globe,
  Lock,
  Mountain,
  Share2,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteMap } from "@/components/shared/route-map";
import { BarChart } from "@/components/shared/bar-chart";
import { StatTile } from "@/components/shared/stat-tile";
import { RouteLine } from "@/features/map/route-line";
import { UserLocationMarker } from "@/features/map/user-location-marker";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import { cn } from "@/lib/utils";
import type { Activity, ActivityPrivacy } from "@/types/activity";
import { formatDate, formatDistance, formatDuration, formatPace } from "@/utils/format";
import { boundsOf } from "@/utils/geo";
import type { MapRef } from "react-map-gl/mapbox";

const RecordedRouteMap = dynamic(() => import("@/features/map/zyron-map").then((m) => m.ZyronMap), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full rounded-2xl sm:h-72" />,
});

const PRIVACY_OPTIONS: { value: ActivityPrivacy; label: string; icon: LucideIcon }[] = [
  { value: "publico", label: "Público", icon: Globe },
  { value: "amigos", label: "Amigos", icon: Users },
  { value: "privado", label: "Privado", icon: Lock },
];

export function ActivitySummary({ activity }: { activity: Activity }) {
  const router = useRouter();
  const config = ACTIVITY_TYPE_CONFIG[activity.type];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description);
  const [privacy, setPrivacy] = useState<ActivityPrivacy>(activity.privacy);
  const [photo, setPhoto] = useState<string | null>(null);

  const pace = activity.durationSeconds / activity.distanceKm;
  const speed = activity.distanceKm / (activity.durationSeconds / 3600);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleShare() {
    router.push(`/activity/${activity.id}/share`);
  }

  function handleSave() {
    // TODO(supabase): persist title/description/photo/privacy updates.
    toast.success("Atividade atualizada!");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/activities"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Minhas atividades
        </Link>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="size-4" />
          Compartilhar
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-brand">
          <config.icon className="size-3.5" />
          {config.label}
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{activity.title}</h1>
        <p className="text-sm text-muted-foreground">{formatDate(new Date(activity.date))}</p>
      </div>

      {activity.path && activity.path.length > 1 ? (
        <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-border sm:h-72">
          <RecordedRouteMap
            baseStyle="streets"
            onMapLoad={(map: MapRef) => map.fitBounds(boundsOf(activity.path!), { padding: 40, duration: 0 })}
          >
            <RouteLine id="activity-track" path={activity.path} width={5} />
            <UserLocationMarker position={activity.path[activity.path.length - 1]} />
          </RecordedRouteMap>
        </div>
      ) : (
        <RouteMap variant={activity.routeVariant} className="h-56 w-full sm:h-72" />
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile icon={Gauge} label="Distância" value={formatDistance(activity.distanceKm)} />
        <StatTile icon={Timer} label="Tempo" value={formatDuration(activity.durationSeconds)} />
        <StatTile icon={Gauge} label="Ritmo médio" value={formatPace(pace)} />
        <StatTile icon={Gauge} label="Velocidade média" value={`${speed.toFixed(1)} km/h`} />
        <StatTile
          icon={Flame}
          label={activity.caloriesEstimated ? "Calorias (estimativa)" : "Calorias"}
          value={`${activity.calories} kcal`}
          iconClassName="bg-warning/15 text-warning"
        />
        <StatTile
          icon={Mountain}
          label={activity.elevationSource === "estimate" ? "Elevação (estimativa)" : "Elevação"}
          value={`${activity.elevationM} m`}
        />
      </div>

      {activity.splitsSecondsPerKm.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold">Ritmo por km</p>
          <BarChart
            className="mt-6"
            data={activity.splitsSecondsPerKm.map((seconds, i) => ({
              label: `${i + 1}km`,
              value: seconds,
            }))}
            valueFormatter={(v) => formatPace(v)}
          />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="font-semibold">Como foi sua atividade?</p>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="activity-title">Título</Label>
            <Input id="activity-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity-description">Descrição</Label>
            <Textarea
              id="activity-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Como você se sentiu nessa atividade?"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Foto</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:bg-muted"
              style={photo ? { backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              {!photo && (
                <>
                  <Camera className="size-4" />
                  Adicionar foto
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </button>
          </div>

          <div className="space-y-1.5">
            <Label>Privacidade</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRIVACY_OPTIONS.map((option) => {
                const selected = privacy === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrivacy(option.value)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors",
                      selected ? "border-brand bg-brand-muted text-brand" : "border-border hover:bg-muted"
                    )}
                  >
                    <option.icon className="size-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button className="w-full" onClick={handleSave}>
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
