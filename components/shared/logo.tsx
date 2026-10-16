import { useId } from "react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/brand";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  size?: number;
  /** Renders the "ZYRON" wordmark next to the mark. Defaults to true. */
  wordmark?: boolean;
}

/**
 * ZYRON brand mark: an abstract chevron pace-line forming a "Z", rendered on
 * a rounded gradient tile so it stays legible on both light and dark surfaces.
 */
export function Logo({ className, iconClassName, size = 32, wordmark = true }: LogoProps) {
  // Gradient ids must be unique per instance: duplicate SVG ids across
  // multiple Logo instances on one page (e.g. sidebar + header) break
  // `url(#id)` resolution even when one instance is display:none.
  const uid = useId();
  const tileId = `zyron-tile-${uid}`;
  const strokeId = `zyron-stroke-${uid}`;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        role="img"
        aria-label={`${APP_NAME} logo`}
        className={cn("shrink-0", iconClassName)}
      >
        <rect width="32" height="32" rx="9" fill={`url(#${tileId})`} />
        <path
          d="M10 11h12l-8.2 10H22"
          stroke={`url(#${strokeId})`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id={tileId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2E6BFF" />
            <stop offset="1" stopColor="#122559" />
          </linearGradient>
          <linearGradient id={strokeId} x1="10" y1="11" x2="22" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#BFD3FF" />
          </linearGradient>
        </defs>
      </svg>
      {wordmark && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      )}
    </span>
  );
}
