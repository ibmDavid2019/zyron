"use client";

import { useEffect } from "react";
import { adsAvailable, hideBanner, showBanner } from "@/lib/admob";

/** Mounted inside AppShell — shows a persistent banner ad above the bottom nav on native builds only. */
export function AdMobBanner() {
  useEffect(() => {
    if (!adsAvailable()) return;
    showBanner();
    return () => {
      hideBanner();
    };
  }, []);

  return null;
}
