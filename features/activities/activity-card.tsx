"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { MapPin, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RouteMap } from "@/components/shared/route-map";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import type { Activity } from "@/types/activity";
import { formatDate, formatDistance, formatDuration, formatPace } from "@/utils/format";

function averagePace(activity: Activity) {
  return activity.durationSeconds / activity.distanceKm;
}

function averageSpeed(activity: Activity) {
  return activity.distanceKm / (activity.durationSeconds / 3600);
}

const REVEAL_WIDTH = 84;
const DRAG_THRESHOLD = 6;

interface ActivityCardProps {
  activity: Activity;
  /** Enables both delete affordances — an always-visible trash button beside the card, and swiping the card left to reveal a second one — when provided. */
  onDelete?: (id: string) => void;
}

export function ActivityCard({ activity, onDelete }: ActivityCardProps) {
  const config = ACTIVITY_TYPE_CONFIG[activity.type];
  const [offset, setOffset] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dragRef = useRef<{ startX: number; dragging: boolean } | null>(null);
  // Mirrors `offset` (and tracks "revealed" outright) for synchronous reads
  // inside gesture handlers — React state can still reflect the previous
  // render for a moment after pointerup, and pointerup, click, and the next
  // pointerdown can all land within that same window.
  const liveRef = useRef({ offset: 0, revealed: false });

  function setOffsetState(value: number) {
    liveRef.current.offset = value;
    setOffset(value);
  }

  function setRevealedState(value: boolean) {
    liveRef.current.revealed = value;
  }

  // Tracked via document-level listeners (attached only while a drag is
  // live) rather than setPointerCapture — capture stopped delivering
  // subsequent pointermove events part-way through a drag in testing.
  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!onDelete) return;
    const startX = event.clientX;
    dragRef.current = { startX, dragging: false };

    function onMove(moveEvent: PointerEvent) {
      if (!dragRef.current) return;
      const delta = moveEvent.clientX - dragRef.current.startX;
      if (!dragRef.current.dragging && Math.abs(delta) > DRAG_THRESHOLD) dragRef.current.dragging = true;
      if (!dragRef.current.dragging) return;
      const next = Math.min(0, Math.max(-REVEAL_WIDTH, (liveRef.current.revealed ? -REVEAL_WIDTH : 0) + delta));
      setOffsetState(next);
    }

    function onUp() {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      if (dragRef.current?.dragging) {
        const opensNow = liveRef.current.offset < -REVEAL_WIDTH / 2;
        setOffsetState(opensNow ? -REVEAL_WIDTH : 0);
        setRevealedState(opensNow);
      }
      dragRef.current = null;
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  }

  function handleCardClick(event: React.MouseEvent) {
    if (!onDelete) return;
    if (dragRef.current?.dragging || liveRef.current.revealed) {
      event.preventDefault();
      if (liveRef.current.revealed) {
        setOffsetState(0);
        setRevealedState(false);
      }
    }
  }

  function requestDelete(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setConfirmOpen(true);
  }

  function confirmDelete() {
    setConfirmOpen(false);
    onDelete?.(activity.id);
  }

  return (
    <div className="flex items-stretch gap-2">
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl">
        {onDelete && (
          <div className="absolute inset-y-0 right-0 flex w-21 items-stretch">
            <button
              type="button"
              onClick={requestDelete}
              aria-label="Excluir atividade"
              className="flex flex-1 items-center justify-center bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        )}

        <div
          onPointerDown={handlePointerDown}
          style={{ transform: `translateX(${offset}px)`, touchAction: onDelete ? "pan-y" : undefined }}
          className={onDelete ? "transition-transform duration-200 ease-out" : undefined}
        >
          <Link
            href={`/activity/${activity.id}`}
            onClick={handleCardClick}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40 hover:bg-muted/40 sm:p-4"
          >
            <RouteMap variant={activity.routeVariant} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-brand">
                <config.icon className="size-3.5" />
                {config.label}
              </div>
              <p className="mt-0.5 truncate font-semibold group-hover:text-brand">{activity.title}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {formatDate(new Date(activity.date))}
                {activity.city && (
                  <>
                    <span aria-hidden>·</span>
                    <MapPin className="size-3" />
                    <span className="truncate">{activity.city}</span>
                  </>
                )}
              </p>
            </div>

            <div className="hidden shrink-0 grid-cols-3 gap-4 text-right sm:grid">
              <div>
                <p className="text-sm font-semibold tabular-nums">{formatDistance(activity.distanceKm)}</p>
                <p className="text-[11px] text-muted-foreground">Distância</p>
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums">
                  {formatDuration(activity.durationSeconds)}
                </p>
                <p className="text-[11px] text-muted-foreground">Tempo</p>
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums">
                  {config.unit === "pace"
                    ? formatPace(averagePace(activity))
                    : `${averageSpeed(activity).toFixed(1)} km/h`}
                </p>
                <p className="text-[11px] text-muted-foreground">{config.unit === "pace" ? "Ritmo" : "Vel. média"}</p>
              </div>
            </div>

            <div className="shrink-0 text-right sm:hidden">
              <p className="text-sm font-semibold tabular-nums">{formatDistance(activity.distanceKm)}</p>
              <p className="text-[11px] text-muted-foreground">{formatDuration(activity.durationSeconds)}</p>
            </div>
          </Link>
        </div>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={requestDelete}
          aria-label="Excluir atividade"
          className="flex size-11 shrink-0 items-center justify-center self-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4.5" />
        </button>
      )}

      {onDelete && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir esta atividade?</AlertDialogTitle>
              <AlertDialogDescription>
                &quot;{activity.title}&quot; será removida da sua conta. Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setOffsetState(0);
                  setRevealedState(false);
                }}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={confirmDelete}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
