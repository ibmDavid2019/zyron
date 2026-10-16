"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Award, Clock, Flame, MapPin, Pencil, Ruler, Share2, Star, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatTile } from "@/components/shared/stat-tile";
import { ActivityCard } from "@/features/activities/activity-card";
import { ActivityPreviewCard } from "@/features/explore/activity-preview-card";
import { AchievementBadge } from "@/features/achievements/achievement-badge";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import { CURRENT_USER, MOCK_ACHIEVEMENTS, MOCK_FEED_POSTS } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import type { Activity as ActivityRecord } from "@/types/activity";
import type { User } from "@/types/user";
import { getProfileAchievementValues, getProfileStats } from "@/utils/profile-stats";
import { getSavedActivities } from "@/utils/local-store";
import { formatDistance, formatDuration } from "@/utils/format";

export function PublicProfile({ user }: { user: User }) {
  const isCurrentUser = user.username === CURRENT_USER.username;
  const [following, setFollowing] = useState(false);
  // Real activities only exist client-side — a brand-new account has none yet.
  const [ownActivities, setOwnActivities] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    if (!isCurrentUser) return;
    const timeout = setTimeout(() => setOwnActivities(getSavedActivities()), 0);
    return () => clearTimeout(timeout);
  }, [isCurrentUser]);

  const stats = getProfileStats(user, ownActivities);
  const achievementValues = getProfileAchievementValues(user, ownActivities);
  const favoriteConfig = user.favoriteActivityType ? ACTIVITY_TYPE_CONFIG[user.favoriteActivityType] : null;
  const posts = MOCK_FEED_POSTS.filter((p) => p.author.username === user.username);

  function handleFollow() {
    setFollowing((f) => !f);
    toast.success(following ? `Você deixou de seguir ${user.name}.` : `Agora você segue ${user.name}!`);
  }

  function handleShare() {
    navigator.clipboard?.writeText(`https://zyron.app/profile/${user.username}`).catch(() => {});
    toast.success("Link do perfil copiado!");
  }

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
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-start">
            {user.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {user.city}
              </span>
            )}
            {favoriteConfig && (
              <span className="flex items-center gap-1.5">
                <favoriteConfig.icon className="size-3.5" />
                {favoriteConfig.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          {isCurrentUser ? (
            <Button variant="outline" asChild>
              <Link href="/settings/profile">
                <Pencil className="size-4" />
                Editar perfil
              </Link>
            </Button>
          ) : (
            <Button variant={following ? "secondary" : "default"} onClick={handleFollow}>
              <UserPlus className="size-4" />
              {following ? "Seguindo" : "Seguir"}
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleShare} aria-label="Compartilhar perfil">
            <Share2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Activity} label="Atividades" value={String(stats.activitiesCount)} />
        <StatTile icon={Ruler} label="Distância" value={formatDistance(stats.distanceKm)} />
        <StatTile icon={Clock} label="Tempo" value={formatDuration(stats.durationSeconds)} />
        <StatTile icon={Award} label="XP" value={user.xp.toLocaleString("pt-BR")} />
      </div>

      <Tabs defaultValue="atividades">
        <TabsList>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="atividades" className="mt-4">
          {isCurrentUser ? (
            ownActivities.length > 0 ? (
              <div className="space-y-3">
                {ownActivities.slice(0, 5).map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma atividade ainda. Grave a primeira no mapa.</p>
            )
          ) : posts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <ActivityPreviewCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma atividade pública ainda.</p>
          )}
        </TabsContent>

        <TabsContent value="conquistas" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MOCK_ACHIEVEMENTS.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              currentValue={achievementValues[achievement.category]}
              unlocked={achievementValues[achievement.category] >= achievement.threshold}
            />
          ))}
        </TabsContent>

        <TabsContent value="estatisticas" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile icon={Star} label="Nível" value={String(user.level)} />
          <StatTile icon={Flame} label="Sequência" value={`${user.streakDays} dias`} iconClassName="bg-warning/15 text-warning" />
          <StatTile icon={Activity} label="Atividades" value={String(stats.activitiesCount)} />
          <StatTile icon={Ruler} label="Distância total" value={formatDistance(stats.distanceKm)} />
          <StatTile icon={Clock} label="Tempo total" value={formatDuration(stats.durationSeconds)} />
          <StatTile icon={Award} label="XP total" value={user.xp.toLocaleString("pt-BR")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
