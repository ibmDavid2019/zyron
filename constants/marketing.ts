import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bike,
  Footprints,
  MapPin,
  PersonStanding,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

export const MARKETING_NAV_LINKS: { label: string; href: string }[] = [
  { label: "Início", href: "#top" },
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Zyron AI", href: "#zyron-ai" },
  { label: "Comunidade", href: "#comunidade" },
  { label: "Preços", href: "#precos" },
];

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  { icon: Footprints, title: "Corridas", description: "Registre cada corrida com pace, distância e ritmo cardíaco." },
  { icon: Bike, title: "Ciclismo", description: "Trajetos, cadência e elevação para suas pedaladas." },
  { icon: PersonStanding, title: "Caminhadas", description: "Acompanhe passos, distância e tempo em movimento." },
  { icon: MapPin, title: "Rastreamento GPS", description: "Rotas precisas com mapa em tempo real durante a atividade." },
  { icon: Sparkles, title: "Zyron AI", description: "Treinos personalizados que evoluem com o seu desempenho." },
  { icon: Trophy, title: "Desafios", description: "Metas em grupo ou solo para manter a motivação em alta." },
  { icon: Users, title: "Comunidade", description: "Siga amigos, participe de grupos e compartilhe conquistas." },
  { icon: BarChart3, title: "Estatísticas", description: "Evolução detalhada por semana, mês e ano." },
];

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
}

const CORE_FEATURES = [
  "Rastreamento GPS ilimitado",
  "Planos de treino com Zyron AI",
  "Histórico completo de atividades",
  "Feed, comunidade e desafios",
  "Estatísticas e análises de desempenho",
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Grátis",
    price: "R$ 0",
    description: "Acesso completo ao ZYRON, com anúncios.",
    features: CORE_FEATURES,
    cta: "Criar conta grátis",
    href: "/register",
    badge: "Sem cartão",
  },
  {
    name: "Premium",
    price: "R$ 14,90",
    period: "/mês",
    description: "Acesso completo ao ZYRON, sem nenhum anúncio.",
    features: [...CORE_FEATURES, "Zero anúncios"],
    cta: "Assinar agora",
    href: "/billing",
    highlighted: true,
    badge: "Sem anúncios",
  },
];
