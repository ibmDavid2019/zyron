import type { MapBaseStyle } from "@/types/map";

export const MAPBOX_STYLES: Record<MapBaseStyle, { light: string; dark: string }> = {
  streets: {
    light: "mapbox://styles/mapbox/streets-v12",
    dark: "mapbox://styles/mapbox/dark-v11",
  },
  satellite: {
    light: "mapbox://styles/mapbox/satellite-streets-v12",
    dark: "mapbox://styles/mapbox/satellite-streets-v12",
  },
  outdoors: {
    light: "mapbox://styles/mapbox/outdoors-v12",
    dark: "mapbox://styles/mapbox/outdoors-v12",
  },
};

export const MAP_STYLE_LABELS: Record<MapBaseStyle, string> = {
  streets: "Mapa",
  satellite: "Satélite",
  outdoors: "Terreno",
};
