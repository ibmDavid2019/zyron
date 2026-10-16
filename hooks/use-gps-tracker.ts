"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GpsTrackPoint, LngLat } from "@/types/map";
import { pathDistanceKm } from "@/utils/geo";
import { isNativeApp } from "@/lib/capacitor";
import { BackgroundGeolocation } from "@/lib/native-geolocation";

interface UseGpsTrackerResult {
  path: LngLat[];
  distanceKm: number;
  /** Real elevation gain from the device's GPS altitude readings — null when the device/browser never reported altitude, rather than a fabricated number. */
  elevationGainM: number | null;
  elapsedSeconds: number;
  tracking: boolean;
  paused: boolean;
  accuracy: number | null;
  currentPosition: LngLat | null;
  error: string | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  undoLastPoint: () => void;
  clearPoints: () => void;
  reset: () => void;
}

/** Real continuous GPS tracking via watchPosition, shared by live recording and "gravar caminhando" route creation. */
export function useGpsTracker(): UseGpsTrackerResult {
  const [points, setPoints] = useState<GpsTrackPoint[]>([]);
  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState<LngLat | null>(null);
  const [error, setError] = useState<string | null>(null);
  // A live "now" just to make the timer tick smoothly once a second while
  // watching the screen — the actual elapsed value below never trusts this
  // alone, since it stalls whenever background JS throttling kicks in.
  const [now, setNow] = useState(() => Date.now());
  const [pausedDurationMs, setPausedDurationMs] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const nativeWatcherIdRef = useRef<string | null>(null);
  const pausedRef = useRef(paused);
  const trackingRef = useRef(tracking);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const pauseStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    trackingRef.current = tracking;
  }, [tracking]);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Stops the screen from locking mid-recording — a locked/sleeping screen
  // is the single biggest cause of sparse, near-straight-line tracks, since
  // mobile browsers heavily throttle background JS (including watchPosition
  // callbacks) once the display turns off. Silently no-ops on browsers that
  // don't support the API; tracking still works, just without this guard.
  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      // Denied, unsupported hardware, or the tab isn't visible right now — nothing to do.
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  // The OS/browser can release the wake lock on its own when the tab is
  // hidden (e.g. a brief app switch) — grab it again once we're back and
  // still recording, instead of leaving the screen unprotected for the rest
  // of the activity.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && trackingRef.current && !wakeLockRef.current) {
        requestWakeLock();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [requestWakeLock]);

  const start = useCallback(() => {
    setError(null);
    setTracking(true);
    setPaused(false);

    // Inside the compiled native app, a real Android foreground-service
    // watcher keeps delivering fixes with the screen off — something no
    // browser tab can do. It replaces watchPosition + wake lock entirely,
    // it doesn't need either.
    if (isNativeApp()) {
      BackgroundGeolocation.addWatcher(
        {
          backgroundTitle: "Gravando atividade",
          backgroundMessage: "O ZYRON está rastreando sua localização.",
          requestPermissions: true,
          stale: false,
          distanceFilter: 0,
        },
        (location, err) => {
          if (err) {
            setError("Não foi possível acessar sua localização em segundo plano.");
            return;
          }
          if (!location) return;
          const next: LngLat = [location.longitude, location.latitude];
          setCurrentPosition(next);
          setAccuracy(location.accuracy);
          if (!pausedRef.current) {
            setPoints((prev) => [...prev, { position: next, timestamp: location.time ?? Date.now(), altitude: location.altitude }]);
          }
        }
      )
        .then((id) => {
          nativeWatcherIdRef.current = id;
        })
        .catch(() => {
          setError("Não foi possível acessar sua localização. Verifique as permissões do app.");
        });
      return;
    }

    if (!("geolocation" in navigator)) {
      setError("Geolocalização não é suportada neste navegador.");
      return;
    }
    requestWakeLock();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const next: LngLat = [position.coords.longitude, position.coords.latitude];
        setCurrentPosition(next);
        setAccuracy(position.coords.accuracy);
        if (!pausedRef.current) {
          setPoints((prev) => [...prev, { position: next, timestamp: position.timestamp, altitude: position.coords.altitude }]);
        }
      },
      () => {
        setError("Não foi possível acessar sua localização. Verifique as permissões do navegador.");
      },
      // maximumAge: 0 forces a fresh GPS fix every time instead of ever
      // reusing a cached one, which was letting real fixes go by unrecorded.
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, [requestWakeLock]);

  const pause = useCallback(() => {
    pauseStartedAtRef.current = Date.now();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (pauseStartedAtRef.current !== null) {
      const pauseStartedAt = pauseStartedAtRef.current;
      pauseStartedAtRef.current = null;
      setPausedDurationMs((prev) => prev + (Date.now() - pauseStartedAt));
    }
    setPaused(false);
  }, []);

  const stop = useCallback(() => {
    if (nativeWatcherIdRef.current) {
      BackgroundGeolocation.removeWatcher({ id: nativeWatcherIdRef.current }).catch(() => {});
      nativeWatcherIdRef.current = null;
    } else {
      clearWatch();
      releaseWakeLock();
    }
    setTracking(false);
    setPaused(false);
  }, [clearWatch, releaseWakeLock]);

  const reset = useCallback(() => {
    setPoints([]);
    setCurrentPosition(null);
    setAccuracy(null);
    setError(null);
    setPausedDurationMs(0);
    pauseStartedAtRef.current = null;
    setNow(Date.now());
  }, []);

  const undoLastPoint = useCallback(() => {
    setPoints((prev) => prev.slice(0, -1));
  }, []);

  /** Clears the tracked path without stopping an in-progress watch or resetting the timer. */
  const clearPoints = useCallback(() => {
    setPoints([]);
  }, []);

  useEffect(() => {
    if (!tracking || paused) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [tracking, paused]);

  useEffect(
    () => () => {
      if (nativeWatcherIdRef.current) {
        BackgroundGeolocation.removeWatcher({ id: nativeWatcherIdRef.current }).catch(() => {});
        nativeWatcherIdRef.current = null;
      }
      clearWatch();
      releaseWakeLock();
    },
    [clearWatch, releaseWakeLock]
  );

  const path = points.map((point) => point.position);

  // Derived from real GPS fix timestamps (first point to latest), not a
  // setInterval tick — a plain JS timer stalls under background throttling
  // (screen off, app backgrounded) exactly when the native background
  // watcher is still delivering real, correctly-timestamped fixes, which
  // was silently under-counting elapsed time (and, since speed/pace derive
  // from it, produced impossible speeds like 175km/h on a bicycle). `now`
  // only fills in the gap between the last fix and the current second while
  // actively watching the screen — it never lowers the timestamp-derived
  // floor.
  const elapsedSeconds = useMemo(() => {
    if (points.length === 0) return 0;
    const startedAt = points[0].timestamp;
    const latestKnown = tracking && !paused ? Math.max(now, points[points.length - 1].timestamp) : points[points.length - 1].timestamp;
    return Math.max(0, Math.round((latestKnown - startedAt - pausedDurationMs) / 1000));
  }, [points, now, tracking, paused, pausedDurationMs]);

  // Sums only the positive altitude deltas between consecutive fixes — the
  // standard definition of elevation "gain" (descents don't subtract from
  // it). Null (not zero) when this device never reported an altitude, so
  // callers can tell "no climbing" apart from "not measured".
  const elevationGainM = useMemo(() => {
    const withAltitude = points.filter((p) => p.altitude !== null);
    if (withAltitude.length < 2) return null;
    let gain = 0;
    for (let i = 1; i < points.length; i++) {
      const prevAltitude = points[i - 1].altitude;
      const currentAltitude = points[i].altitude;
      if (prevAltitude !== null && currentAltitude !== null && currentAltitude > prevAltitude) {
        gain += currentAltitude - prevAltitude;
      }
    }
    return Math.round(gain);
  }, [points]);

  return {
    path,
    distanceKm: pathDistanceKm(path),
    elevationGainM,
    elapsedSeconds,
    tracking,
    paused,
    accuracy,
    currentPosition,
    error,
    start,
    pause,
    resume,
    stop,
    undoLastPoint,
    clearPoints,
    reset,
  };
}
