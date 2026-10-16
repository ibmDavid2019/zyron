"use client";

import { useEffect } from "react";
import { adsAvailable, hideBanner, showBanner } from "@/lib/admob";
import { usePremiumStatus } from "@/hooks/use-premium-status";

/** Mounted inside AppShell — shows a persistent banner ad above the bottom nav for free (non-premium) users on native builds only. */
export function AdMobBanner() {
  const { isPremium, loading } = usePremiumStatus();

  useEffect(() => {
    if (!adsAvailable() || loading || isPremium) return;
    showBanner();
    return () => {
      hideBanner();
    };
  }, [loading, isPremium]);

  return null;
}
