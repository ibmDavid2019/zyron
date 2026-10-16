import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconClassName?: string;
  className?: string;
  href?: string;
}

export function StatTile({ icon: Icon, label, value, iconClassName, className, href }: StatTileProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg bg-brand-muted text-brand",
          iconClassName
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <p className="mt-3 text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </>
  );

  const classes = cn(
    "rounded-2xl border border-border bg-card p-4",
    href && "transition-colors hover:border-brand/40 hover:bg-muted/40",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
