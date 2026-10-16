"use client";

import Link from "next/link";
import { Bell, HelpCircle, LogOut, Settings, User } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { GlobalSearch } from "@/components/shared/global-search";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/sign-out";
import { CURRENT_USER } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";

export function Header() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-30 border-b border-border bg-background/80 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-16 items-center gap-3 px-4 lg:pl-[272px] lg:pr-6">
        <MobileMenu />

        <Link href="/dashboard" className="lg:hidden">
          <Logo size={28} wordmark={false} />
        </Link>

        <GlobalSearch />

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications" aria-label="Notificações">
              <Bell className="size-4.5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-background" />
            </Link>
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 rounded-full outline-none ring-brand/40 focus-visible:ring-2">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-brand-muted text-xs font-semibold text-brand">
                    {getInitials(CURRENT_USER.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-semibold">{CURRENT_USER.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{CURRENT_USER.username}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="size-4" />
                  Meu perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="size-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircle className="size-4" />
                  Ajuda
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => signOut()}>
                <LogOut className="size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
