"use client";

import { useEffect } from "react";
import { initAdMob } from "@/lib/admob";

/** Mounted once in the root layout — boots the AdMob SDK on app startup (no-op on the web build). */
export function AdMobInit() {
  useEffect(() => {
    initAdMob();
  }, []);

  return null;
}
