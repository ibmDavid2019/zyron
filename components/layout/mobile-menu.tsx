"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { SIDEBAR_FOOTER_ITEMS, SIDEBAR_NAV_ITEMS } from "@/constants/nav";
import { signOut } from "@/features/auth/sign-out";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir menu" className="shrink-0 lg:hidden">
          <Menu className="size-[18px]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle asChild>
            <SheetClose asChild>
              <Link href="/dashboard">
                <Logo size={26} />
              </Link>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("size-[18px]", active ? "text-brand" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="mt-2 border-t border-border px-4 pt-2">
          <nav className="flex flex-col gap-1">
            {SIDEBAR_FOOTER_ITEMS.map((item) => (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="size-[18px] text-muted-foreground" />
                  {item.label}
                </Link>
              </SheetClose>
            ))}
            <SheetClose asChild>
              <Link
                href="/help"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                <HelpCircle className="size-[18px] text-muted-foreground" />
                Ajuda
              </Link>
            </SheetClose>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-[18px] text-muted-foreground" />
              Sair
            </button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
