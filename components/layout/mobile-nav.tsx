"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV_ITEMS } from "@/constants/nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex h-16 items-stretch justify-between px-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href, item.exact);
          const isCta = item.label === "Iniciar";

          if (isCta) {
            return (
              <li key={item.href} className="flex flex-1 items-center justify-center">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className="-mt-6 flex size-14 items-center justify-center rounded-full bg-gradient-brand text-brand-foreground shadow-lg shadow-brand/30 transition-transform active:scale-95"
                >
                  <Icon className="size-7" strokeWidth={2.25} />
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-brand" : "text-muted-foreground"
                )}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 2} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
