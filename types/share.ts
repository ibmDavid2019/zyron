export type ShareLayout = "minimal" | "sport" | "dynamic";

export interface StatVisibility {
  distance: boolean;
  duration: boolean;
  pace: boolean;
  elevation: boolean;
  calories: boolean;
}

export interface RouteOverlayState {
  visible: boolean;
  /** Center position, normalized 0-1 within the 1080x1920 canvas. */
  x: number;
  y: number;
  /** Multiplier over the layout's default route box size. */
  scale: number;
}

export interface StatsOverlayState {
  /** Top-left anchor of the stat block, normalized 0-1 within the 1080x1920 canvas — same drag model as the route box. */
  x: number;
  y: number;
}

export interface LogoOverlayState {
  /** Right edge / baseline anchor of the "ZYRON" wordmark (it's drawn right-aligned), normalized 0-1 within the 1080x1920 canvas. */
  x: number;
  y: number;
}

export interface PhotoTransform {
  /** Pan offset in canvas pixels. */
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface OverlaySpec {
  layout: ShareLayout;
  stats: StatVisibility;
  statsPosition: StatsOverlayState;
  route: RouteOverlayState;
  logoPosition: LogoOverlayState;
  photo: PhotoTransform;
}

export const DEFAULT_STAT_VISIBILITY: StatVisibility = {
  distance: true,
  duration: true,
  pace: true,
  elevation: true,
  calories: true,
};

export const DEFAULT_ROUTE_STATE: RouteOverlayState = { visible: true, x: 0.5, y: 0.22, scale: 1 };

export const DEFAULT_STATS_POSITION: StatsOverlayState = { x: 0.06, y: 0.6 };

export const DEFAULT_LOGO_POSITION: LogoOverlayState = { x: 0.941, y: 0.046 };

export const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = { offsetX: 0, offsetY: 0, scale: 1 };
