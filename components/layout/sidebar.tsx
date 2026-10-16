"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, LogOut } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SIDEBAR_FOOTER_ITEMS, SIDEBAR_NAV_ITEMS } from "@/constants/nav";
import { signOut } from "@/features/auth/sign-out";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn, getInitials } from "@/lib/utils";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard">
          <Logo size={30} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0",
                      active ? "text-brand" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-3">
        <Separator className="mb-2 bg-sidebar-border" />
        <ul className="space-y-1">
          {SIDEBAR_FOOTER_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                >
                  <Icon className="size-4.5 shrink-0 text-sidebar-foreground/50" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/help"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            >
              <HelpCircle className="size-4.5 shrink-0 text-sidebar-foreground/50" />
              Ajuda
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4.5 shrink-0 text-sidebar-foreground/50" />
              Sair
            </button>
          </li>
        </ul>

        <Separator className="my-2 bg-sidebar-border" />

        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent/60"
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-brand-muted text-brand font-semibold">
              {getInitials(CURRENT_USER.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{CURRENT_USER.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/50">Nível {CURRENT_USER.level}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
