"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity as ActivityIcon, Award, Clock, MapPin, Pencil, Ruler } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/shared/stat-tile";
import { ActivityCard } from "@/features/activities/activity-card";
import { CURRENT_USER, MOCK_ACHIEVEMENTS } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import { getProfileAchievementValues, getProfileStats } from "@/utils/profile-stats";
import { formatDistance, formatDuration } from "@/utils/format";
import { getProfileOverrides, getSavedActivities } from "@/utils/local-store";
import type { Activity } from "@/types/activity";

export function MyProfile() {
  // Renders the static mock user/activities first so SSR and first paint
  // match, then layers in localStorage overrides once mounted.
  const [user, setUser] = useState(CURRENT_USER);
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setUser((current) => ({ ...current, ...getProfileOverrides() }));
      setSavedActivities(getSavedActivities());
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const stats = getProfileStats(user, savedActivities);
  const achievementValues = getProfileAchievementValues(user, savedActivities);
  const unlockedCount = MOCK_ACHIEVEMENTS.filter((a) => achievementValues[a.category] >= a.threshold).length;
  const recentActivities = savedActivities.slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar className="size-20 border border-border">
          <AvatarFallback className="bg-brand-muted text-2xl font-semibold text-brand">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
          {user.city && (
            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
              <MapPin className="size-3.5" />
              {user.city}
            </p>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href="/settings/profile">
            <Pencil className="size-4" />
            Editar perfil
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={ActivityIcon} label="Atividades" value={String(stats.activitiesCount)} />
        <StatTile icon={Ruler} label="Distância" value={formatDistance(stats.distanceKm)} />
        <StatTile icon={Clock} label="Tempo" value={formatDuration(stats.durationSeconds)} />
        <StatTile icon={Award} label="XP" value={user.xp.toLocaleString("pt-BR")} href="/achievements" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Conquistas</p>
          <Link href="/achievements" className="text-sm font-medium text-brand hover:underline">
            Ver todas
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {unlockedCount} de {MOCK_ACHIEVEMENTS.length} medalhas desbloqueadas.
        </p>
      </div>

      <div>
        <p className="mb-3 font-semibold">Atividades recentes</p>
        {recentActivities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="font-semibold">Nenhuma atividade ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">Grave sua primeira atividade para vê-la aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
