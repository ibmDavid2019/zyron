import { Lock, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types/achievement";

interface AchievementBadgeProps {
  achievement: Achievement;
  currentValue: number;
  unlocked: boolean;
}

export function AchievementBadge({ achievement, currentValue, unlocked }: AchievementBadgeProps) {
  const percent = Math.min(Math.round((currentValue / achievement.threshold) * 100), 100);

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center">
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full",
          unlocked ? "bg-gradient-brand text-brand-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {unlocked ? <Medal className="size-6" /> : <Lock className="size-5" />}
      </span>
      <p className="text-sm font-semibold">{achievement.title}</p>
      <p className="text-xs text-muted-foreground">{achievement.description}</p>
      {!unlocked && (
        <p className="text-[11px] font-medium text-brand">
          {currentValue.toLocaleString("pt-BR")} / {achievement.threshold} {achievement.unit} · {percent}%
        </p>
      )}
    </div>
  );
}
