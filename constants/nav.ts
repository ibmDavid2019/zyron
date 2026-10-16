import {
  Activity,
  Award,
  Compass,
  Crown,
  LayoutDashboard,
  Map,
  PlayCircle,
  Rss,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { NavItem } from "@/types/nav";

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Feed", href: "/feed", icon: Rss },
  { label: "Mapa", href: "/map", icon: Map },
  { label: "Atividades", href: "/activities", icon: Activity },
  { label: "Iniciar atividade", href: "/map", icon: PlayCircle },
  { label: "Explorar", href: "/explore", icon: Compass },
  { label: "Desafios", href: "/challenges", icon: Trophy },
  { label: "Ranking", href: "/leaderboard", icon: Crown },
  { label: "Conquistas", href: "/achievements", icon: Award },
  { label: "Comunidades", href: "/communities", icon: Users },
  { label: "Zyron AI", href: "/ai", icon: Sparkles },
  { label: "Perfil", href: "/profile", icon: User },
];

export const SIDEBAR_FOOTER_ITEMS: NavItem[] = [
  { label: "Configurações", href: "/settings", icon: Settings },
];

export const MOBILE_NAV_ITEMS: { label: string; href: string; icon: LucideIcon; exact?: boolean }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Atividades", href: "/activities", icon: Activity },
  { label: "Iniciar", href: "/map", icon: PlayCircle },
  { label: "Desafios", href: "/challenges", icon: Trophy },
  { label: "Perfil", href: "/profile", icon: User },
];
