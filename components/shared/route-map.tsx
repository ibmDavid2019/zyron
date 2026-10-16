import { cn } from "@/lib/utils";

const ROUTE_PATHS: Record<1 | 2 | 3, string> = {
  1: "M30 120 C 60 60, 90 100, 120 70 S 180 20, 210 50 S 260 40, 270 30",
  2: "M25 40 C 70 30, 60 90, 110 100 S 190 110, 210 70 S 260 90, 275 120",
  3: "M20 100 C 50 30, 100 30, 130 80 C 160 130, 210 130, 240 70 S 280 30, 280 30",
};

interface RouteMapProps {
  variant?: 1 | 2 | 3;
  animated?: boolean;
  label?: string;
  className?: string;
}

/**
 * Abstract, fully custom map illustration — a gradient surface with a grid
 * and an SVG route path. Not a real map; stands in until Mapbox is wired up.
 */
export function RouteMap({ variant = 1, animated = false, label, className }: RouteMapProps) {
  const path = ROUTE_PATHS[variant];

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-brand", className)}>
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 300 150" preserveAspectRatio="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 30} x2="300" y2={i * 30} stroke="white" strokeWidth="1" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="150" stroke="white" strokeWidth="1" />
        ))}
      </svg>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 150" fill="none" preserveAspectRatio="none">
        <path d={path} stroke="white" strokeOpacity="0.5" strokeWidth="7" strokeLinecap="round" />
        <path d={path} stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 10" />
      </svg>
      {label && (
        <div className="absolute bottom-3 left-3 rounded-lg bg-black/25 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {label}
        </div>
      )}
      {animated && (
        <span className="absolute right-6 top-6 flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-white" />
        </span>
      )}
    </div>
  );
}
