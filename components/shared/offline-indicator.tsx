"use client";

import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";

/**
 * App-wide "you're offline" banner — full-width strip pinned to the very
 * top, not a corner pill, since the map screen already has real floating
 * controls in both top corners (GpsStatus top-left, MapLayers/heatmap
 * button top-right) that a corner indicator would collide with right when
 * it matters most (mid-recording).
 */
export function OfflineIndicator() {
  const { online } = useNetworkStatus();
  if (online) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-1.5 bg-warning py-1.5 text-xs font-medium text-white"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <WifiOff className="size-3.5" />
      Você está offline
    </div>
  );
}
