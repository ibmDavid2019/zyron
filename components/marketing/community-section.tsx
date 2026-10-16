import { Heart, MessageCircle, Share2, Trophy, UserPlus, Users } from "lucide-react";
import { formatDistance, formatDuration } from "@/utils/format";

const HIGHLIGHTS = [
  { icon: Users, title: "Feed", description: "Acompanhe as atividades de quem você segue em tempo real." },
  { icon: UserPlus, title: "Amigos", description: "Encontre e siga pessoas com objetivos parecidos com os seus." },
  { icon: Users, title: "Comunidades", description: "Grupos por modalidade, cidade ou nível de treino." },
  { icon: Trophy, title: "Desafios e rankings", description: "Compare sua evolução e suba no ranking semanal." },
];

const LEADERBOARD = [
  { rank: 1, name: "Marina Alves", value: "42,1 km" },
  { rank: 2, name: "Rafael Souza", value: "38,7 km" },
  { rank: 3, name: "David Lukas", value: "35,2 km" },
];

export function CommunitySection() {
  return (
    <section id="comunidade" className="scroll-mt-16 bg-muted/40 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 space-y-6 lg:order-1">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand">
                ML
              </div>
              <div>
                <p className="text-sm font-semibold">Marina Alves</p>
                <p className="text-xs text-muted-foreground">há 2 horas · Corrida</p>
              </div>
            </div>
            <p className="mt-3 text-sm">
              Treino intervalado concluído! Sentindo a evolução a cada semana 🔥
            </p>
            <div className="mt-3 flex h-24 items-center justify-center rounded-xl bg-gradient-brand text-xs font-medium text-brand-foreground/90">
              Mapa da rota
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-semibold">{formatDistance(8.4)}</p>
                <p className="text-muted-foreground">Distância</p>
              </div>
              <div>
                <p className="font-semibold">{formatDuration(46 * 60 + 10)}</p>
                <p className="text-muted-foreground">Tempo</p>
              </div>
              <div>
                <p className="font-semibold">5:30/km</p>
                <p className="text-muted-foreground">Ritmo</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Heart className="size-3.5" /> 128
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-3.5" /> 14
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 className="size-3.5" /> Compartilhar
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xl">
            <p className="text-sm font-semibold">Ranking semanal</p>
            <ul className="mt-3 space-y-2">
              {LEADERBOARD.map((row) => (
                <li key={row.rank} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {row.rank}
                    </span>
                    {row.name}
                  </span>
                  <span className="text-muted-foreground">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Evolua junto com sua comunidade
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Movimento é melhor compartilhado. Conecte-se, motive-se e comemore cada conquista.
          </p>

          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
                  <item.icon className="size-4.5" />
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
