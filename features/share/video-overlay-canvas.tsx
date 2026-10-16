"use client";

import { useEffect, useRef } from "react";
import type { Activity } from "@/types/activity";
import type { OverlaySpec } from "@/types/share";
import { CANVAS_WIDTH, CANVAS_HEIGHT, drawOverlay, hitTestOverlay } from "@/features/share/overlay-canvas-core";

interface VideoOverlayCanvasProps {
  activity: Activity;
  spec: OverlaySpec;
  onSpecChange: (updater: (prev: OverlaySpec) => OverlaySpec) => void;
}

/**
 * Transparent canvas layered on top of the video preview so the stat block
 * and GPS route can be dragged into place the same way the photo editor
 * already lets you drag them over a picture — the video itself never gets
 * drawn into canvas here (it's the real <video> element underneath); this
 * only draws and hit-tests the overlay graphics.
 */
export function VideoOverlayCanvas({ activity, spec, onSpecChange }: VideoOverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{
    target: "route" | "stats" | "logo";
    startX: number;
    startY: number;
    origin: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawOverlay(ctx, canvas.width, canvas.height, activity, spec);
  }, [activity, spec]);

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
    const target = hitTestOverlay(point, activity, spec, CANVAS_WIDTH, CANVAS_HEIGHT, false);
    if (!target || target.kind === "photo") return;

    const origin =
      target.kind === "route"
        ? { x: spec.route.x, y: spec.route.y }
        : target.kind === "logo"
          ? { x: spec.logoPosition.x, y: spec.logoPosition.y }
          : { x: spec.statsPosition.x, y: spec.statsPosition.y };

    dragRef.current = { target: target.kind, startX: event.clientX, startY: event.clientY, origin };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dx = ((event.clientX - drag.startX) / rect.width) * CANVAS_WIDTH;
    const dy = ((event.clientY - drag.startY) / rect.height) * CANVAS_HEIGHT;

    if (drag.target === "route") {
      onSpecChange((prev) => ({
        ...prev,
        route: {
          ...prev.route,
          x: Math.min(0.9, Math.max(0.1, drag.origin.x + dx / CANVAS_WIDTH)),
          y: Math.min(0.9, Math.max(0.1, drag.origin.y + dy / CANVAS_HEIGHT)),
        },
      }));
    } else if (drag.target === "logo") {
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
        statsPosition: {
          x: Math.min(0.85, Math.max(0.02, drag.origin.x + dx / CANVAS_WIDTH)),
          y: Math.min(0.92, Math.max(0.04, drag.origin.y + dy / CANVAS_HEIGHT)),
        },
      }));
    }
  }

  function handlePointerUp() {
    dragRef.current = null;
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
      className="absolute inset-0 size-full touch-none"
    />
  );
}
