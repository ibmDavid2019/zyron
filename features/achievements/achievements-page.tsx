"use client";

import { useEffect, useState } from "react";
import { Flame, Gauge, Repeat, Trophy } from "lucide-react";
import { LevelRing } from "@/components/shared/level-ring";
import { AchievementBadge } from "@/features/achievements/achievement-badge";
import { CURRENT_USER, MOCK_CHALLENGES } from "@/lib/mock-data";
import { getSavedActivities } from "@/utils/local-store";
import { aggregateStats } from "@/utils/activity-stats";
import type { Achievement, AchievementCategory } from "@/types/achievement";

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; icon: typeof Gauge }> = {
  distancia: { label: "Distância", icon: Gauge },
  frequencia: { label: "Frequência", icon: Repeat },
  desafios: { label: "Desafios", icon: Trophy },
  sequencia: { label: "Sequência", icon: Flame },
};

const EMPTY_VALUES: Record<AchievementCategory, number> = { distancia: 0, frequencia: 0, desafios: 0, sequencia: 0 };

interface AchievementsPageProps {
  achievements: Achievement[];
}

export function AchievementsPage({ achievements }: AchievementsPageProps) {
  // Starts fully zeroed — a brand-new account hasn't unlocked anything yet;
  // real progress (from real activities and real completed challenges)
  // hydrates once localStorage is available.
  const [currentValues, setCurrentValues] = useState<Record<AchievementCategory, number>>(EMPTY_VALUES);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const stats = aggregateStats(getSavedActivities());
      const challengesCompleted = MOCK_CHALLENGES.filter((c) => c.status === "concluido").length;
      setCurrentValues({
        distancia: Math.round(stats.distanceKm * 10) / 10,
        frequencia: stats.count,
        desafios: challengesCompleted,
        sequencia: CURRENT_USER.streakDays,
      });
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const categories = Object.keys(CATEGORY_CONFIG) as AchievementCategory[];
  const unlockedCount = achievements.filter((a) => currentValues[a.category] >= a.threshold).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Conquistas</h1>
        <p className="text-muted-foreground">
          {unlockedCount} de {achievements.length} medalhas desbloqueadas.
        </p>
      </div>

      <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5">
        <LevelRing level={CURRENT_USER.level} xp={CURRENT_USER.xp} xpToNextLevel={CURRENT_USER.xpToNextLevel} />
        <div>
          <p className="text-lg font-bold">Nível {CURRENT_USER.level}</p>
          <p className="text-sm text-muted-foreground">
            {CURRENT_USER.xp.toLocaleString("pt-BR")} / {CURRENT_USER.xpToNextLevel.toLocaleString("pt-BR")} XP
            para o próximo nível
          </p>
        </div>
      </div>

      {categories.map((category) => {
        const config = CATEGORY_CONFIG[category];
        const items = achievements.filter((a) => a.category === category);
        const currentValue = currentValues[category];

        return (
          <section key={category} className="space-y-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <config.icon className="size-4 text-brand" />
              {config.label}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {items.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  currentValue={currentValue}
                  unlocked={currentValue >= achievement.threshold}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
