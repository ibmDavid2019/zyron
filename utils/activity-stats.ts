import type { Activity, ActivityType } from "@/types/activity";

export type ActivityPeriod = "semana" | "mes" | "ano";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Monday-based start of the week containing `date`. */
function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

export interface DaySummary {
  label: string;
  dateISO: string;
  distanceKm: number;
  durationSeconds: number;
  count: number;
  isToday: boolean;
}

/** Aggregates activities into a Mon-Sun week view for chart display. */
export function getWeeklySummary(activities: Activity[], referenceDate = new Date()): DaySummary[] {
  const weekStart = startOfWeek(referenceDate);
  const today = startOfDay(referenceDate).getTime();

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const dayTime = day.getTime();

    const dayActivities = activities.filter(
      (a) => startOfDay(new Date(a.date)).getTime() === dayTime
    );

    return {
      label: WEEKDAY_LABELS[day.getDay()],
      dateISO: day.toISOString(),
      distanceKm: dayActivities.reduce((sum, a) => sum + a.distanceKm, 0),
      durationSeconds: dayActivities.reduce((sum, a) => sum + a.durationSeconds, 0),
      count: dayActivities.length,
      isToday: dayTime === today,
    };
  });
}

export function filterByPeriod(
  activities: Activity[],
  period: ActivityPeriod,
  referenceDate = new Date()
): Activity[] {
  const from = new Date(referenceDate);
  if (period === "semana") from.setDate(from.getDate() - 7);
  if (period === "mes") from.setMonth(from.getMonth() - 1);
  if (period === "ano") from.setFullYear(from.getFullYear() - 1);

  return activities.filter((a) => new Date(a.date) >= from);
}

export function filterByType(activities: Activity[], type: ActivityType | "todas"): Activity[] {
  return type === "todas" ? activities : activities.filter((a) => a.type === type);
}

export interface EvolutionPoint {
  label: string;
  value: number;
  highlighted?: boolean;
}

/** Distance (km) summed per week for the last `weeksCount` weeks, oldest first. */
export function getRecentWeeksSummary(
  activities: Activity[],
  weeksCount = 4,
  referenceDate = new Date()
): EvolutionPoint[] {
  const currentWeekStart = startOfWeek(referenceDate);

  return Array.from({ length: weeksCount }, (_, i) => {
    const offset = weeksCount - 1 - i;
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - offset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const value = activities
      .filter((a) => {
        const d = new Date(a.date);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((sum, a) => sum + a.distanceKm, 0);

    return { label: offset === 0 ? "Atual" : `-${offset}sem`, value: Math.round(value * 10) / 10, highlighted: offset === 0 };
  });
}

/** Distance (km) summed per month for the last `monthsCount` months, oldest first. */
export function getRecentMonthsSummary(
  activities: Activity[],
  monthsCount = 6,
  referenceDate = new Date()
): EvolutionPoint[] {
  return Array.from({ length: monthsCount }, (_, i) => {
    const offset = monthsCount - 1 - i;
    const monthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1);

    const value = activities
      .filter((a) => {
        const d = new Date(a.date);
        return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
      })
      .reduce((sum, a) => sum + a.distanceKm, 0);

    const label = monthDate.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return { label: label.charAt(0).toUpperCase() + label.slice(1), value: Math.round(value * 10) / 10, highlighted: offset === 0 };
  });
}

export interface AggregateStats {
  count: number;
  distanceKm: number;
  durationSeconds: number;
  calories: number;
}

export function aggregateStats(activities: Activity[]): AggregateStats {
  return activities.reduce(
    (acc, a) => ({
      count: acc.count + 1,
      distanceKm: acc.distanceKm + a.distanceKm,
      durationSeconds: acc.durationSeconds + a.durationSeconds,
      calories: acc.calories + a.calories,
    }),
    { count: 0, distanceKm: 0, durationSeconds: 0, calories: 0 }
  );
}
