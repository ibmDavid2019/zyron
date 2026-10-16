"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MARKETING_NAV_LINKS } from "@/constants/marketing";

// The header is `position: sticky`, so it always reports itself as already
// visible at the top of the viewport — scrollIntoView()/anchor-hash
// navigation targeting it (or targeting "#top") silently no-ops. Scrolling
// the window itself sidesteps that.
function scrollToSection(href: string) {
  if (href === "#top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  function handleMobileNavClick(href: string) {
    setOpen(false);
    // Wait for the Sheet's scroll lock to release before scrolling.
    setTimeout(() => scrollToSection(href), 300);
  }

  return (
    <header
      id="top"
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="ZYRON — página inicial"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#top");
          }}
        >
          <Logo size={30} />
        </Link>

        <nav className="ml-10 hidden items-center gap-7 lg:flex">
          {MARKETING_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Criar conta</Link>
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle asChild>
                  <button type="button" onClick={() => handleMobileNavClick("#top")}>
                    <Logo size={26} />
                  </button>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {MARKETING_NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => handleMobileNavClick(link.href)}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-2 px-4">
                <SheetClose asChild>
                  <Button variant="outline" asChild>
                    <Link href="/login">Entrar</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild>
                    <Link href="/register">Criar conta</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
