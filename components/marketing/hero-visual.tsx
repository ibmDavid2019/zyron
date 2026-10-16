import { Flame, Sparkles } from "lucide-react";
import { formatDistance, formatDuration, formatPace } from "@/utils/format";

const WEEK_BARS = [
  { day: "S", value: 30 },
  { day: "T", value: 55 },
  { day: "Q", value: 40 },
  { day: "Q", value: 70 },
  { day: "S", value: 35 },
  { day: "S", value: 90 },
  { day: "D", value: 60 },
];

/**
 * Custom hero composition: no stock imagery — a self-contained "live
 * activity" mock built from SVG + CSS to represent map, stats, chart and
 * progress at a glance.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
      <div className="absolute -top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-lg sm:right-8">
        <Sparkles className="size-3.5 text-brand" />
        <span className="text-success">+12%</span>
        <span className="text-muted-foreground">essa semana</span>
      </div>

      <div className="glow-brand rounded-3xl border border-border bg-card p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-warning/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            Atividade ao vivo
          </div>
        </div>

        <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-brand sm:h-52">
          <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 300 150">
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 30} x2="300" y2={i * 30} stroke="white" strokeWidth="1" />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="150" stroke="white" strokeWidth="1" />
            ))}
          </svg>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 150" fill="none">
            <path
              d="M30 120 C 60 60, 90 100, 120 70 S 180 20, 210 50 S 260 40, 270 30"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="1 10"
            />
            <path
              d="M30 120 C 60 60, 90 100, 120 70 S 180 20, 210 50 S 260 40, 270 30"
              stroke="white"
              strokeOpacity="0.5"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="30" cy="120" r="5" fill="white" />
            <circle cx="270" cy="30" r="7" fill="white" />
            <circle cx="270" cy="30" r="7" fill="white" className="animate-ping opacity-60" />
          </svg>
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/25 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            Corrida no Parque Ibirapuera
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold tabular-nums">{formatDistance(5.2)}</p>
            <p className="text-[11px] text-muted-foreground">Distância</p>
          </div>
          <div className="border-x border-border">
            <p className="text-lg font-bold tabular-nums">{formatDuration(32 * 60 + 15)}</p>
            <p className="text-[11px] text-muted-foreground">Tempo</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{formatPace(6 * 60 + 12)}</p>
            <p className="text-[11px] text-muted-foreground">Ritmo</p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-1.5">
          {WEEK_BARS.map((bar, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-12 w-full max-w-6 items-end overflow-hidden rounded-md bg-muted">
                <div
                  className={`w-full rounded-md ${i === 5 ? "bg-brand" : "bg-brand/30"}`}
                  style={{ height: `${bar.value}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-lg sm:left-8">
        <Flame className="size-3.5 text-warning" />
        Sequência de 6 dias
      </div>
    </div>
  );
}
