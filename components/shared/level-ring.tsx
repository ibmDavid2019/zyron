interface LevelRingProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  size?: number;
}

export function LevelRing({ level, xp, xpToNextLevel, size = 88 }: LevelRingProps) {
  const percent = Math.min(Math.round((xp / xpToNextLevel) * 100), 100);
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none">{level}</span>
        <span className="text-[10px] text-muted-foreground">nível</span>
      </div>
    </div>
  );
}
