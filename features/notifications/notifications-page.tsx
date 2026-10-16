"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCheck,
  Heart,
  Mail,
  MessageCircle,
  Trophy,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/types/notification";
import { formatRelativeTime } from "@/utils/format";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  curtida: Heart,
  comentario: MessageCircle,
  seguidor: UserPlus,
  convite: Mail,
  desafio: Trophy,
  conquista: CalendarCheck,
};

type Filter = "todas" | "nao-lidas" | "lidas";

export function NotificationsPage({ notifications: initial }: { notifications: AppNotification[] }) {
  const [notifications, setNotifications] = useState(initial);
  const [filter, setFilter] = useState<Filter>("todas");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "nao-lidas") return !n.read;
    if (filter === "lidas") return n.read;
    return true;
  });

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notificações</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} não lidas` : "Você está em dia!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="size-4" />
            <span className="hidden sm:inline">Marcar todas como lidas</span>
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="nao-lidas">Não lidas</TabsTrigger>
          <TabsTrigger value="lidas">Lidas</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-semibold">Nada por aqui</p>
          <p className="mt-1 text-sm text-muted-foreground">Nenhuma notificação nesta categoria.</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {filtered.map((notification) => {
            const Icon = TYPE_ICON[notification.type];
            return (
              <Link
                key={notification.id}
                href={notification.href}
                onClick={() => markAsRead(notification.id)}
                className={cn(
                  "flex items-start gap-3 p-4 transition-colors hover:bg-muted/50",
                  !notification.read && "bg-brand-muted/40"
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
                  <Icon className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{notification.actorName}</span>{" "}
                    <span className="text-muted-foreground">{notification.message}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelativeTime(new Date(notification.createdAt))}
                  </p>
                </div>
                {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
