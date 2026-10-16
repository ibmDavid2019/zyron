"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Activity } from "@/types/activity";
import type { OverlaySpec } from "@/types/share";
import { CANVAS_WIDTH, CANVAS_HEIGHT, drawOverlay, hitTestOverlay, type OverlayDragTarget } from "@/features/share/overlay-canvas-core";

export { CANVAS_WIDTH, CANVAS_HEIGHT, drawOverlay };

function drawPhoto(ctx: CanvasRenderingContext2D, width: number, height: number, photo: HTMLImageElement, spec: OverlaySpec) {
  const scaleFactor = width / CANVAS_WIDTH;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();

  const coverScale = Math.max(width / photo.width, height / photo.height) * spec.photo.scale;
  const drawW = photo.width * coverScale;
  const drawH = photo.height * coverScale;
  const baseX = (width - drawW) / 2;
  const baseY = (height - drawH) / 2;
  ctx.drawImage(photo, baseX + spec.photo.offsetX * scaleFactor, baseY + spec.photo.offsetY * scaleFactor, drawW, drawH);
  ctx.restore();
}

/** Draws the photo + overlay (stat block, route, wordmark) onto a canvas context, at whatever size that context is. Used both for the live interactive preview and for the final full-resolution export. */
function drawComposite(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activity: Activity,
  photo: HTMLImageElement,
  spec: OverlaySpec
) {
  ctx.clearRect(0, 0, width, height);
  drawPhoto(ctx, width, height, photo, spec);
  drawOverlay(ctx, width, height, activity, spec);
}

/**
 * Renders just the overlay (no photo, transparent background) at full
 * resolution and returns it as a base64 PNG — the input the native video
 * plugin composites onto a real video clip (see lib/native-video-plugin.ts).
 */
export async function exportOverlayPngBase64(activity: Activity, spec: OverlaySpec): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context");
  drawOverlay(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, activity, spec);
  const dataUrl = canvas.toDataURL("image/png");
  return dataUrl.split(",")[1] ?? "";
}

export interface PhotoCanvasHandle {
  /** Renders the current state at full 1080x1920 resolution and returns it as a PNG blob. */
  exportBlob(): Promise<Blob | null>;
}

interface PhotoCanvasProps {
  activity: Activity;
  photo: HTMLImageElement;
  spec: OverlaySpec;
  onSpecChange: (updater: (prev: OverlaySpec) => OverlaySpec) => void;
}

export const PhotoCanvas = forwardRef<PhotoCanvasHandle, PhotoCanvasProps>(function PhotoCanvas(
  { activity, photo, spec, onSpecChange },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ target: OverlayDragTarget; startX: number; startY: number; origin: { x: number; y: number } } | null>(
    null
  );
  const [, forceRender] = useState(0);

  useImperativeHandle(ref, () => ({
    async exportBlob() {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = CANVAS_WIDTH;
      exportCanvas.height = CANVAS_HEIGHT;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return null;
      drawComposite(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, activity, photo, spec);
      return new Promise((resolve) => exportCanvas.toBlob((blob) => resolve(blob), "image/png"));
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawComposite(ctx, canvas.width, canvas.height, activity, photo, spec);
    // forceRender dep only exists to satisfy exhaustive-deps for the imperative pointer-drag updates below.
  }, [activity, photo, spec]);

  function toCanvasPoint(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const point = toCanvasPoint(event.clientX, event.clientY);
    const target = hitTestOverlay(point, activity, spec, CANVAS_WIDTH, CANVAS_HEIGHT, true) ?? { kind: "photo" };

    const origin =
      target.kind === "route"
        ? { x: spec.route.x, y: spec.route.y }
        : target.kind === "stats"
          ? { x: spec.statsPosition.x, y: spec.statsPosition.y }
          : target.kind === "logo"
            ? { x: spec.logoPosition.x, y: spec.logoPosition.y }
            : { x: spec.photo.offsetX, y: spec.photo.offsetY };

    dragRef.current = { target, startX: event.clientX, startY: event.clientY, origin };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dxCss = event.clientX - drag.startX;
    const dyCss = event.clientY - drag.startY;
    const dx = (dxCss / rect.width) * CANVAS_WIDTH;
    const dy = (dyCss / rect.height) * CANVAS_HEIGHT;

    if (drag.target.kind === "route") {
      onSpecChange((prev) => ({
        ...prev,
        route: {
          ...prev.route,
          x: Math.min(0.9, Math.max(0.1, drag.origin.x + dx / CANVAS_WIDTH)),
          y: Math.min(0.9, Math.max(0.1, drag.origin.y + dy / CANVAS_HEIGHT)),
        },
      }));
    } else if (drag.target.kind === "stats") {
      onSpecChange((prev) => ({
        ...prev,
        statsPosition: {
          x: Math.min(0.85, Math.max(0.02, drag.origin.x + dx / CANVAS_WIDTH)),
          y: Math.min(0.92, Math.max(0.04, drag.origin.y + dy / CANVAS_HEIGHT)),
        },
      }));
    } else if (drag.target.kind === "logo") {
      onSpecChange((prev) => ({
        ...prev,
        logoPosition: {
          x: Math.min(0.98, Math.max(0.15, drag.origin.x + dx / CANVAS_WIDTH)),
          y: Math.min(0.97, Math.max(0.04, drag.origin.y + dy / CANVAS_HEIGHT)),
        },
      }));
    } else {
      onSpecChange((prev) => ({
        ...prev,
        photo: { ...prev.photo, offsetX: drag.origin.x + dx, offsetY: drag.origin.y + dy },
      }));
    }
  }

  function handlePointerUp() {
    dragRef.current = null;
    forceRender((n) => n + 1);
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="aspect-9/16 h-full w-full touch-none rounded-2xl bg-black object-contain"
    />
  );
});
