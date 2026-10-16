"use client";

import { useEffect, useRef, useState } from "react";

const PROBE_URL = "/api/ping";
const PROBE_TIMEOUT_MS = 5000;
const POLL_ONLINE_MS = 20000;
const POLL_OFFLINE_MS = 5000;

/**
 * navigator.onLine is well known to be unreliable inside Android WebViews —
 * it can report `false` even on a perfectly good Wi-Fi/5G connection (this
 * bit a real user). Instead of trusting it, actively verify connectivity by
 * fetching our own tiny ping endpoint (same-origin, no CORS concerns) and
 * only flip to "offline" once a real request fails. The browser's
 * online/offline events (and visibility changes, e.g. the app coming back
 * to the foreground) are used only as hints to re-probe sooner, never as
 * the source of truth.
 */
export function useNetworkStatus() {
  const [online, setOnline] = useState(true);
  const probingRef = useRef(false);
  const onlineRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function probe() {
      if (probingRef.current) return;
      probingRef.current = true;
      try {
        const controller = new AbortController();
        const abortTimer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
        await fetch(`${PROBE_URL}?t=${Date.now()}`, { cache: "no-store", signal: controller.signal });
        clearTimeout(abortTimer);
        if (!cancelled) {
          onlineRef.current = true;
          setOnline(true);
        }
      } catch {
        if (!cancelled) {
          onlineRef.current = false;
          setOnline(false);
        }
      } finally {
        probingRef.current = false;
        if (!cancelled) scheduleNext();
      }
    }

    function scheduleNext() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(probe, onlineRef.current ? POLL_ONLINE_MS : POLL_OFFLINE_MS);
    }

    function probeSoon() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(probe, 0);
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") probeSoon();
    }

    probe();
    window.addEventListener("online", probeSoon);
    window.addEventListener("offline", probeSoon);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("online", probeSoon);
      window.removeEventListener("offline", probeSoon);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return { online };
}
