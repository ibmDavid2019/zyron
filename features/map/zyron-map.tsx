"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useRef, type ReactNode } from "react";
import Map, { type MapMouseEvent, type MapRef } from "react-map-gl/mapbox";
import { useTheme } from "next-themes";
import { MAPBOX_STYLES } from "@/constants/map";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/mock-map-data";
import { MapTokenMissing } from "@/features/map/map-token-missing";
import type { MapBaseStyle } from "@/types/map";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface ZyronMapProps {
  baseStyle: MapBaseStyle;
  onClick?: (event: MapMouseEvent) => void;
  onMapLoad?: (map: MapRef) => void;
  /** Fired when the user manually pans the map — used to drop out of GPS auto-follow. */
  onDragStart?: () => void;
  /** Fired when the map finishes moving (pan, zoom, or programmatic fly/fit) — used to offer "search this area". */
  onMoveEnd?: () => void;
  cursor?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Core ZYRON map surface. Wraps react-map-gl/Mapbox GL JS with our default
 * viewport and theme-aware base style; all overlays (routes, markers,
 * controls) are composed as children by the callers.
 *
 * Exposes the underlying map instance via `onMapLoad` (a callback) rather
 * than a forwarded ref, since this component is loaded through
 * `next/dynamic({ ssr: false })` and dynamic imports don't reliably forward
 * refs.
 */
export function ZyronMap({ baseStyle, onClick, onMapLoad, onDragStart, onMoveEnd, cursor, children, className }: ZyronMapProps) {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<MapRef | null>(null);

  if (!MAPBOX_TOKEN) {
    return <MapTokenMissing className={className} />;
  }

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: DEFAULT_MAP_CENTER[0],
          latitude: DEFAULT_MAP_CENTER[1],
          zoom: DEFAULT_MAP_ZOOM,
        }}
        mapStyle={MAPBOX_STYLES[baseStyle][resolvedTheme === "dark" ? "dark" : "light"]}
        onClick={onClick}
        onLoad={() => {
          if (mapRef.current) onMapLoad?.(mapRef.current);
        }}
        onDragStart={onDragStart}
        onMoveEnd={onMoveEnd}
        cursor={cursor}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </Map>
    </div>
  );
}
