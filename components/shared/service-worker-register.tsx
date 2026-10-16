"use client";

import { useEffect } from "react";
import { isNativeApp } from "@/lib/capacitor";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // A service worker intercepting navigation can block Capacitor's native
    // bridge from injecting into the page, silently breaking every native
    // plugin (GPS, OAuth, camera) — skip it entirely inside the app shell,
    // and actively unregister/clear any that got installed by an earlier
    // build (WebView storage survives app updates, only wiped on uninstall
    // or a manual data clear, so a stale one can otherwise linger forever).
    if (isNativeApp()) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((registration) => registration.unregister()))
        .catch(() => {});
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key))).catch(() => {});
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline fallback is a progressive enhancement — safe to ignore failures.
    });
  }, []);

  return null;
}
