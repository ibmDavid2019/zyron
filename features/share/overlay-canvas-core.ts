import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import type { Activity } from "@/types/activity";
import type { OverlaySpec } from "@/types/share";
import { formatDistance, formatPace } from "@/utils/format";
import { projectPathToBox } from "@/utils/route-canvas";

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

function formatDurationLong(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

function visibleStats(activity: Activity, spec: OverlaySpec) {
  const config = ACTIVITY_TYPE_CONFIG[activity.type];
  const pace = activity.durationSeconds / activity.distanceKm;
  const speed = activity.distanceKm / (activity.durationSeconds / 3600);
  const paceOrSpeed = config.unit === "pace" ? formatPace(pace) : `${speed.toFixed(1)} km/h`;

  const allStats = [
    { key: "distance" as const, label: "Distância", value: formatDistance(activity.distanceKm) },
    { key: "duration" as const, label: "Tempo", value: formatDurationLong(activity.durationSeconds) },
    { key: "pace" as const, label: config.unit === "pace" ? "Ritmo" : "Velocidade", value: paceOrSpeed },
    { key: "elevation" as const, label: "Elevação", value: `↑ ${Math.round(activity.elevationM)} m` },
    { key: "calories" as const, label: "Calorias", value: `${activity.calories} kcal` },
  ];
  return allStats.filter((s) => spec.stats[s.key]);
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The stat block's approximate bounding box (top-left anchored at spec.statsPosition) — used both to draw it and to hit-test drags against it. Sized generously rather than pixel-exact, since it's a drag handle, not a clip region. */
export function getStatsBox(activity: Activity, spec: OverlaySpec, width: number, height: number): Box | null {
  const stats = visibleStats(activity, spec);
  if (stats.length === 0) return null;

  const sf = width / CANVAS_WIDTH;
  const ax = spec.statsPosition.x * width;
  const ay = spec.statsPosition.y * height;

  if (spec.layout === "minimal") {
    return { x: ax, y: ay, w: 620 * sf, h: (70 + stats.length * 80 + 20) * sf };
  }
  if (spec.layout === "sport") {
    const rows = stats.length > 3 ? 2 : 1;
    return { x: ax, y: ay, w: Math.min(width - ax - 32 * sf, 620 * sf), h: (110 + rows * 90) * sf };
  }
  // dynamic — hero number + label, plus a chip row for the rest right below it
  const hasRest = stats.length > 1;
  return { x: ax, y: ay, w: 620 * sf, h: (232 + (hasRest ? 90 : 0)) * sf };
}

export function getRouteBox(spec: OverlaySpec, width: number, height: number): Box | null {
  if (!spec.route.visible) return null;
  const boxSize = 460 * spec.route.scale * (width / CANVAS_WIDTH);
  return { x: spec.route.x * width - boxSize / 2, y: spec.route.y * height - boxSize / 2, w: boxSize, h: boxSize };
}

/** The "ZYRON" wordmark is drawn right-aligned at its anchor — the hit box sits to the left of and below that anchor point, generously sized for an easy touch target. */
export function getLogoBox(spec: OverlaySpec, width: number, height: number): Box {
  const sf = width / CANVAS_WIDTH;
  const ax = spec.logoPosition.x * width;
  const ay = spec.logoPosition.y * height;
  return { x: ax - 200 * sf, y: ay - 50 * sf, w: 200 * sf, h: 70 * sf };
}

function pointInBox(px: number, py: number, box: Box) {
  return px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h;
}

export type OverlayDragTarget = { kind: "route" } | { kind: "stats" } | { kind: "logo" } | { kind: "photo" };

/** Route and logo win over the (usually much larger) stats block when boxes overlap, since they're the smaller/more precise targets to grab. `allowPhoto` is only true where there's an actual photo underneath to pan (not the video flow's transparent overlay). */
export function hitTestOverlay(
  point: { x: number; y: number },
  activity: Activity,
  spec: OverlaySpec,
  width: number,
  height: number,
  allowPhoto: boolean
): OverlayDragTarget | null {
  const routeBox = getRouteBox(spec, width, height);
  if (routeBox && pointInBox(point.x, point.y, routeBox)) return { kind: "route" };

  const logoBox = getLogoBox(spec, width, height);
  if (pointInBox(point.x, point.y, logoBox)) return { kind: "logo" };

  const statsBox = getStatsBox(activity, spec, width, height);
  if (statsBox && pointInBox(point.x, point.y, statsBox)) return { kind: "stats" };

  return allowPhoto ? { kind: "photo" } : null;
}

/**
 * Draws the stat block + real GPS route + ZYRON wordmark onto a canvas
 * context — no photo. Shared by the photo compositor (drawn on top of the
 * picked photo), the interactive video overlay preview, and the video
 * overlay export (rendered alone, as a transparent PNG the native video
 * plugin burns onto the actual clip — see exportOverlayPngBase64 in
 * photo-canvas.tsx and android/app/src/main/java/app/zyron/fitness/ZyronVideoPlugin.kt).
 */
export function drawOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, activity: Activity, spec: OverlaySpec) {
  const scaleFactor = width / CANVAS_WIDTH;
  const config = ACTIVITY_TYPE_CONFIG[activity.type];
  const stats = visibleStats(activity, spec);

  // --- Route overlay ---
  if (spec.route.visible && activity.path && activity.path.length > 1) {
    const boxSize = 460 * spec.route.scale * scaleFactor;
    const cx = spec.route.x * width;
    const cy = spec.route.y * height;
    const points = projectPathToBox(activity.path, boxSize, boxSize, boxSize * 0.12);
    if (points.length > 1) {
      const originX = cx - boxSize / 2;
      const originY = cy - boxSize / 2;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 12 * scaleFactor;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 9 * scaleFactor;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      points.forEach(([x, y], i) => {
        const px = originX + x;
        const py = originY + y;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- Stat block (layout-specific style, positioned at spec.statsPosition) ---
  if (stats.length > 0) {
    const ax = spec.statsPosition.x * width;
    const ay = spec.statsPosition.y * height;
    ctx.save();

    if (spec.layout === "minimal") {
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 16 * scaleFactor;
      ctx.font = `700 ${44 * scaleFactor}px system-ui, sans-serif`;
      ctx.fillText(config.label.toUpperCase(), ax, ay);

      stats.forEach((stat, i) => {
        ctx.font = `700 ${52 * scaleFactor}px system-ui, sans-serif`;
        ctx.fillText(stat.value, ax, ay + (70 + i * 80) * scaleFactor);
      });
      ctx.restore();
    } else if (spec.layout === "sport") {
      const box = getStatsBox(activity, spec, width, height)!;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.w, box.h, 24 * scaleFactor);
      ctx.fillStyle = "rgba(18,37,89,0.82)";
      ctx.fill();

      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${34 * scaleFactor}px system-ui, sans-serif`;
      ctx.fillText(config.label.toUpperCase(), box.x + 28 * scaleFactor, box.y + 54 * scaleFactor);

      const colW = box.w / Math.min(stats.length, 3);
      stats.slice(0, 3).forEach((stat, i) => {
        const x = box.x + 28 * scaleFactor + i * colW;
        ctx.font = `800 ${48 * scaleFactor}px system-ui, sans-serif`;
        ctx.fillText(stat.value, x, box.y + 130 * scaleFactor);
        ctx.font = `500 ${24 * scaleFactor}px system-ui, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillText(stat.label, x, box.y + 162 * scaleFactor);
        ctx.fillStyle = "#ffffff";
      });
      if (stats.length > 3) {
        const rest = stats.slice(3);
        const colW2 = box.w / rest.length;
        rest.forEach((stat, i) => {
          const x = box.x + 28 * scaleFactor + i * colW2;
          ctx.font = `800 ${38 * scaleFactor}px system-ui, sans-serif`;
          ctx.fillText(stat.value, x, box.y + 218 * scaleFactor);
          ctx.font = `500 ${22 * scaleFactor}px system-ui, sans-serif`;
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          ctx.fillText(stat.label, x, box.y + 250 * scaleFactor);
          ctx.fillStyle = "#ffffff";
        });
      }
      ctx.restore();
    } else {
      // dynamic — big hero number (first visible stat), rest as a chip row right below it
      const hero = stats[0];
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 18 * scaleFactor;
      ctx.font = `800 ${46 * scaleFactor}px system-ui, sans-serif`;
      ctx.fillText(config.label.toUpperCase(), ax, ay);
      ctx.font = `800 ${120 * scaleFactor}px system-ui, sans-serif`;
      ctx.fillText(hero.value, ax, ay + 50 * scaleFactor);
      ctx.font = `600 ${32 * scaleFactor}px system-ui, sans-serif`;
      ctx.fillText(hero.label, ax, ay + 192 * scaleFactor);
      ctx.shadowBlur = 0;

      const rest = stats.slice(1);
      if (rest.length > 0) {
        const rowY = ay + 260 * scaleFactor;
        const chipGap = 16 * scaleFactor;
        let x = ax;
        ctx.textBaseline = "middle";
        ctx.font = `700 ${30 * scaleFactor}px system-ui, sans-serif`;
        for (const stat of rest) {
          const text = stat.value;
          const textW = ctx.measureText(text).width;
          const chipW = textW + 40 * scaleFactor;
          const chipH = 56 * scaleFactor;
          ctx.fillStyle = "rgba(18,37,89,0.75)";
          ctx.beginPath();
          ctx.roundRect(x, rowY, chipW, chipH, chipH / 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.fillText(text, x + 20 * scaleFactor, rowY + chipH / 2 + 2 * scaleFactor);
          x += chipW + chipGap;
        }
      }
      ctx.restore();
    }
  }

  // --- ZYRON wordmark ---
  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#4C8DFF";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 12 * scaleFactor;
  ctx.font = `800 ${46 * scaleFactor}px system-ui, sans-serif`;
  ctx.fillText("ZYRON", spec.logoPosition.x * width, spec.logoPosition.y * height);
  ctx.restore();
}
