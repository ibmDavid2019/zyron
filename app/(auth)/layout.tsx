import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { APP_DESCRIPTION, APP_SLOGAN } from "@/constants/brand";

const STATS = [
  { label: "Atividades essa semana", value: "12,4k+" },
  { label: "Cidades ativas", value: "50+" },
  { label: "Avaliação média", value: "4.9★" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="bg-gradient-brand relative hidden w-[42%] flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, white 0, transparent 30%), radial-gradient(circle at 85% 85%, white 0, transparent 35%)",
          }}
        />
        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5">
          <Logo size={30} wordmark={false} />
          <span className="text-lg font-bold tracking-tight text-white">ZYRON</span>
        </Link>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight text-balance text-white xl:text-5xl">
            {APP_SLOGAN}
          </h1>
          <p className="mt-4 max-w-sm text-balance text-white/80">{APP_DESCRIPTION}</p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar para o site
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-sm">
            <Link href="/" className="mb-8 inline-flex lg:hidden">
              <Logo size={30} />
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
