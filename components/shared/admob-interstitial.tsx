"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { adsAvailable, showInterstitial } from "@/lib/admob";
import { usePremiumStatus } from "@/hooks/use-premium-status";

// Avoids back-to-back interstitials when a user taps through several
// screens quickly — AdMob policy (and basic good manners) expects these to
// be infrequent, not on every single navigation.
const COOLDOWN_MS = 90_000;
let lastShownAt = 0;

/** Mounted inside AppShell — shows a full-screen interstitial on screen changes for free (non-premium) users on native builds only. */
export function AdMobInterstitial() {
  const pathname = usePathname();
  const { isPremium, loading } = usePremiumStatus();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    if (!adsAvailable() || loading || isPremium) return;
    if (Date.now() - lastShownAt < COOLDOWN_MS) return;

    lastShownAt = Date.now();
    showInterstitial();
  }, [pathname, loading, isPremium]);

  return null;
}
