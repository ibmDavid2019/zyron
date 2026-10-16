import { Flame, Lock, Medal, Trophy, Zap } from "lucide-react";

const MEDALS = [
  { label: "5 km", unlocked: true },
  { label: "10 km", unlocked: true },
  { label: "21 km", unlocked: true },
  { label: "42 km", unlocked: false },
  { label: "30 dias", unlocked: true },
  { label: "100 km", unlocked: false },
];

// Illustrative example for this marketing showcase only — not tied to any
// real account (a brand-new ZYRON user naturally starts at level 1 with 0 XP).
const EXAMPLE_PROGRESS = { level: 12, xp: 3420, xpToNextLevel: 4000, streakDays: 6 };

export function GamificationSection() {
  const xpPercent = Math.round((EXAMPLE_PROGRESS.xp / EXAMPLE_PROGRESS.xpToNextLevel) * 100);
  const circumference = 2 * Math.PI * 40;
  const dash = (xpPercent / 100) * circumference;

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Cada treino conta. Literalmente.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            XP, níveis, medalhas e sequências para transformar consistência em conquista.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-muted-foreground">Nível atual</p>
            <div className="mt-4 flex items-center gap-5">
              <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
                <circle cx="44" cy="44" r="40" fill="none" stroke="var(--muted)" strokeWidth="8" />
                <circle
                  cx="44"
                  cy="44"
                  r="40"
                  fill="none"
                  stroke="var(--brand)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference}`}
                />
              </svg>
              <div>
                <p className="text-2xl font-bold">Nível {EXAMPLE_PROGRESS.level}</p>
                <p className="text-sm text-muted-foreground">
                  {EXAMPLE_PROGRESS.xp.toLocaleString("pt-BR")} / {EXAMPLE_PROGRESS.xpToNextLevel.toLocaleString("pt-BR")} XP
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-muted-foreground">Sequência</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-warning/15 text-warning">
                <Flame className="size-8" />
              </span>
              <div>
                <p className="text-2xl font-bold">{EXAMPLE_PROGRESS.streakDays} dias</p>
                <p className="text-sm text-muted-foreground">Continue treinando para manter o fogo aceso</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <Zap className="size-4 text-brand" /> Conquista recente
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                <Trophy className="size-8" />
              </span>
              <div>
                <p className="font-semibold">21 km na semana</p>
                <p className="text-sm text-muted-foreground">Desbloqueada há 2 dias</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-muted-foreground">Medalhas</p>
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {MEDALS.map((medal) => (
              <div key={medal.label} className="flex flex-col items-center gap-2">
                <span
                  className={`flex size-14 items-center justify-center rounded-full ${
                    medal.unlocked
                      ? "bg-gradient-brand text-brand-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {medal.unlocked ? <Medal className="size-6" /> : <Lock className="size-5" />}
                </span>
                <span className="text-xs text-muted-foreground">{medal.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
