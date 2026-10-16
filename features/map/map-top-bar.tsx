"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MapSearch } from "@/features/map/map-search";
import { CURRENT_USER } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import type { LngLat } from "@/types/map";

interface MapTopBarProps {
  onResultSelect: (position: LngLat, label: string) => void;
}

export function MapTopBar({ onResultSelect }: MapTopBarProps) {
  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-5">
      <Link href="/dashboard" className="hidden shrink-0 sm:block">
        <Logo size={28} />
      </Link>
      <Link href="/dashboard" className="shrink-0 sm:hidden">
        <Logo size={28} wordmark={false} />
      </Link>

      <MapSearch onResultSelect={onResultSelect} className="max-w-md" />

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/notifications" aria-label="Notificações">
            <Bell className="size-4.5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-card" />
          </Link>
        </Button>
        <ThemeToggle />
        <Link href="/profile" className="ml-1 rounded-full outline-none ring-brand/40 focus-visible:ring-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-brand-muted text-xs font-semibold text-brand">
              {getInitials(CURRENT_USER.name)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
