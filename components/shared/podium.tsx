import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

export interface PodiumEntry {
  rank: number;
  name: string;
  value: number;
  isCurrentUser?: boolean;
}

const MEDALS = ["🥇", "🥈", "🥉"];

const PEDESTAL_ORDER = [1, 0, 2]; // 2nd, 1st, 3rd
const PEDESTAL_HEIGHT = ["h-20", "h-28", "h-16"];

export function Podium({
  entries,
  unit = "km",
  className,
}: {
  entries: PodiumEntry[];
  unit?: string;
  className?: string;
}) {
  const top3 = entries.slice(0, 3);

  return (
    <div className={cn("flex items-end justify-center gap-3 sm:gap-6", className)}>
      {PEDESTAL_ORDER.map((entryIndex, i) => {
        const entry = top3[entryIndex];
        if (!entry) return <div key={i} className="flex-1 max-w-28" />;

        return (
          <div key={entry.rank} className="flex flex-1 max-w-28 flex-col items-center">
            <span className="text-2xl">{MEDALS[entryIndex]}</span>
            <Avatar className={cn("size-12 border-2 sm:size-14", entry.isCurrentUser ? "border-brand" : "border-border")}>
              <AvatarFallback className="bg-brand-muted font-semibold text-brand">
                {getInitials(entry.name)}
              </AvatarFallback>
            </Avatar>
            <p className="mt-2 w-full truncate text-center text-sm font-semibold">{entry.name}</p>
            <p className="text-xs text-muted-foreground">
              {entry.value.toLocaleString("pt-BR")} {unit}
            </p>
            <div
              className={cn(
                "mt-3 flex w-full items-start justify-center rounded-t-lg bg-brand-muted pt-2 text-lg font-bold text-brand",
                PEDESTAL_HEIGHT[entryIndex]
              )}
            >
              {entry.rank}º
            </div>
          </div>
        );
      })}
    </div>
  );
}
