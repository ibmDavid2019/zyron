import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Exact match required for active state (e.g. "/dashboard"). */
  exact?: boolean;
}
