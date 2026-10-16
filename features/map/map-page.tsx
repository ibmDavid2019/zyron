"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Play, Plus, Route as RouteIcon, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapTopBar } from "@/features/map/map-top-bar";
import { MapSidebar } from "@/features/map/map-sidebar";
import { MapControls } from "@/features/map/map-controls";
import { MapLayers } from "@/features/map/map-layers";
import { LocationButton } from "@/features/map/location-button";
import { GpsStatus } from "@/features/map/gps-status";
import { ExploreFilterChips } from "@/features/map/explore-filter-chips";
import { RouteLine } from "@/features/map/route-line";
import { RouteMarker } from "@/features/map/route-marker";
import { ActivityMarker } from "@/features/map/activity-marker";
import { EventMarker } from "@/features/map/event-marker";
import { UserLocationMarker } from "@/features/map/user-location-marker";
import { DirectionMarker } from "@/features/map/direction-marker";
import { MapBottomSheet } from "@/features/map/map-bottom-sheet";
import { RouteDetails } from "@/features/map/route-details";
import { ActivityDetails } from "@/features/map/activity-details";
import { EventDetails } from "@/features/map/event-details";
import { MyRoutesPanel } from "@/features/map/my-routes-panel";
import { RouteCreatorPanel } from "@/features/map/route-creator-panel";
import { RecordActivitySheet } from "@/features/map/record-activity-sheet";
import { LiveTrackingPanel } from "@/features/map/live-tracking-panel";
import { CALORIES_PER_KM_ESTIMATE, ELEVATION_M_PER_KM_ESTIMATE, RecordingSummary } from "@/features/map/recording-summary";
import { RecenterButton } from "@/features/map/recenter-button";
import { MOCK_ACTIVITY_GEO, MOCK_EVENT_GEO, MOCK_ROUTE_GEO } from "@/lib/mock-map-data";
import { MOCK_EVENTS, MOCK_FEED_POSTS, MOCK_ROUTES } from "@/lib/mock-data";
import { ACTIVITY_TYPES } from "@/constants/activities";
import type { LngLat, MapBaseStyle, MapLayerVisibility, MapMode, MapSelection } from "@/types/map";
import type { Activity, ActivityType } from "@/types/activity";
import type { OutdoorActivityType } from "@/types/route";
import type { MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import { bearingBetween, boundsOf, pathDistanceKm } from "@/utils/geo";
import { generateId } from "@/utils/id";
import { useGpsTracker } from "@/hooks/use-gps-tracker";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { reverseGeocodeCity } from "@/utils/geocode";
import { addSavedActivity } from "@/utils/local-store";
import { takeFollowRoute, type FollowRoute } from "@/utils/follow-route";
import { fetchNavigationSteps, type NavigationStep } from "@/utils/navigation";
import { generateLoopOfDistance } from "@/utils/route-generator";
import { useVoiceNavigation } from "@/hooks/use-voice-navigation";

const ZyronMap = dynamic(() => import("@/features/map/zyron-map").then((m) => m.ZyronMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

interface CustomRoute {
  id: string;
  name: string;
  distanceKm: number;
  path: LngLat[];
}

interface RecordingSummaryData {
  type: ActivityType;
  distanceKm: number;
  durationSeconds: number;
  elevationGainM: number | null;
  path: LngLat[];
  city: string | null;
  cityLoading: boolean;
}

/** A route being followed while recording — `path` starts empty and gets filled in with a real loop from the rider's own starting position, so it always leads back there instead of ending wherever the original route happened to be. */
interface ActiveFollowRoute extends FollowRoute {
  path: LngLat[];
}

type Panel = { type: "selection" } | { type: "my-routes" } | { type: "recording-summary" } | null;

export function MapPage() {
  const [mapInstance, setMapInstance] = useState<MapRef | null>(null);
  const [baseStyle, setBaseStyle] = useState<MapBaseStyle>("streets");
  const [visibility, setVisibility] = useState<MapLayerVisibility>({ routes: true, activities: true, events: false });
  const [mode, setMode] = useState<MapMode>("view");
  const [exploreFilter, setExploreFilter] = useState<OutdoorActivityType | "todas">("todas");
  const [selection, setSelection] = useState<MapSelection>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [userPosition, setUserPosition] = useState<LngLat | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [savedRouteIds, setSavedRouteIds] = useState<Set<string>>(new Set());
  const [customRoutes, setCustomRoutes] = useState<CustomRoute[]>([]);
  const [creatorPoints, setCreatorPoints] = useState<LngLat[]>([]);
  const [creatorGpsMode, setCreatorGpsMode] = useState(false);
  const [recordingType, setRecordingType] = useState<ActivityType | null>(null);
  const [recordingSummary, setRecordingSummary] = useState<RecordingSummaryData | null>(null);
  const [following, setFollowing] = useState(true);
  const [followRoute, setFollowRoute] = useState<ActiveFollowRoute | null>(null);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [routeFetchFailed, setRouteFetchFailed] = useState(false);
  const gpsTracker = useGpsTracker();
  const { online } = useNetworkStatus();
  const offlineVoiceNoticeShownRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gpsTracker.error) return;
    toast.error(gpsTracker.error);
  }, [gpsTracker.error]);

  // Lets other screens (e.g. Explorar) deep-link straight into a mode, such as
  // "/map?mode=create-route" or "/map?mode=record&type=ciclismo" — the latter
  // also picks up a route stashed by a "Usar esta rota" button, if any.
  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "create-route") {
      const timeout = setTimeout(() => setMode("create-route"), 0);
      return () => clearTimeout(timeout);
    }
    if (requestedMode === "record") {
      const requestedType = searchParams.get("type");
      const type = requestedType && ACTIVITY_TYPES.includes(requestedType as ActivityType) ? (requestedType as ActivityType) : "corrida";
      const timeout = setTimeout(() => {
        startRecording(type);
        const route = takeFollowRoute();
        // A route stashed with its own real path (e.g. directions to a
        // searched destination) is followed as-is; otherwise path starts
        // empty and gets filled in once we have a real GPS fix to loop out
        // from and back to, below.
        setFollowRoute(route ? { ...route, path: route.path ?? [] } : null);
        setRouteFetchFailed(false);
      }, 0);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Builds the actual loop once we know where the rider really is: starts
  // and ends at that position, so "usar esta rota" always brings them back
  // to wherever they started instead of a fixed point from the catalog.
  // Gated on `online` (and re-runs when it flips back on) so a connectivity
  // drop mid-recording doesn't leave this stuck loading forever — it just
  // reports the failure and retries automatically once back online.
  useEffect(() => {
    if (!followRoute || followRoute.path.length > 0 || !gpsTracker.currentPosition) return;
    if (!online) {
      const timeout = setTimeout(() => setRouteFetchFailed(true), 0);
      return () => clearTimeout(timeout);
    }
    let cancelled = false;
    const resetTimeout = setTimeout(() => setRouteFetchFailed(false), 0);
    const profile = followRoute.type === "ciclismo" ? "cycling" : "walking";
    const home = gpsTracker.currentPosition;
    generateLoopOfDistance(home, followRoute.distanceKm, profile).then((path) => {
      if (cancelled) return;
      if (!path) {
        setRouteFetchFailed(true);
        return;
      }
      setFollowRoute((prev) => (prev && prev.path.length === 0 ? { ...prev, path } : prev));
      setFollowing(false);
    });
    return () => {
      cancelled = true;
      clearTimeout(resetTimeout);
    };
  }, [followRoute, gpsTracker.currentPosition, online]);

  // Frames the whole route to follow the moment its real path is ready,
  // before the per-fix "auto-follow" effect below takes over and zooms in.
  useEffect(() => {
    if (!followRoute || followRoute.path.length === 0 || !mapInstance) return;
    mapInstance.fitBounds(boundsOf(followRoute.path), { padding: 80, duration: 800 });
  }, [followRoute, mapInstance]);

  // Re-arms the offline voice-nav notice so a later disconnect (after having
  // reconnected once) announces again instead of staying silent forever.
  useEffect(() => {
    if (online) offlineVoiceNoticeShownRef.current = false;
  }, [online]);

  // Real turn-by-turn steps (street names, turn direction) from the Mapbox
  // Directions API for whatever route we just started following.
  useEffect(() => {
    if (!followRoute) {
      const timeout = setTimeout(() => setNavigationSteps([]), 0);
      return () => clearTimeout(timeout);
    }
    if (followRoute.path.length === 0) return;
    if (!online) {
      const timeout = setTimeout(() => {
        setNavigationSteps([]);
        if (!offlineVoiceNoticeShownRef.current) {
          offlineVoiceNoticeShownRef.current = true;
          toast.info("Navegação por voz indisponível sem conexão.");
        }
      }, 0);
      return () => clearTimeout(timeout);
    }
    let cancelled = false;
    const profile = followRoute.type === "ciclismo" ? "cycling" : "walking";
    fetchNavigationSteps(followRoute.path, profile).then((result) => {
      if (!cancelled && result) setNavigationSteps(result.steps);
    });
    return () => {
      cancelled = true;
    };
  }, [followRoute, online]);

  const { currentStep } = useVoiceNavigation({
    steps: navigationSteps,
    currentPosition: gpsTracker.currentPosition,
    enabled: voiceEnabled && mode === "record" && navigationSteps.length > 0,
  });

  // Points at the next real turn (or the destination) while following a
  // route — a fixed target, so the arrow holds steady instead of jittering
  // the way a bearing computed from two close-together raw GPS fixes would.
  // Falls back to fix-to-fix movement only when there's no route to aim at.
  const heading = useMemo(() => {
    if (currentStep && gpsTracker.currentPosition) {
      return bearingBetween(gpsTracker.currentPosition, currentStep.location);
    }
    const path = gpsTracker.path;
    if (path.length < 2) return null;
    return bearingBetween(path[path.length - 2], path[path.length - 1]);
  }, [currentStep, gpsTracker.currentPosition, gpsTracker.path]);

  // Auto-follows the map to the live GPS fix while recording or GPS-walking a
  // route — a pure imperative call to the map instance, not React state.
  useEffect(() => {
    if (!gpsTracker.currentPosition || !mapInstance) return;
    const isTrackingSession = mode === "record" || creatorGpsMode;
    if (isTrackingSession && following) {
      mapInstance.easeTo({ center: gpsTracker.currentPosition, duration: 500 });
    }
  }, [gpsTracker.currentPosition, mode, creatorGpsMode, following, mapInstance]);

  // The GPS tracker's live fix takes priority over the one-shot "locate me" position.
  const displayUserPosition = gpsTracker.currentPosition ?? userPosition;
  const displayGpsAccuracy = gpsTracker.currentPosition ? gpsTracker.accuracy : gpsAccuracy;

  const visibleRoutes = useMemo(
    () => MOCK_ROUTES.filter((r) => exploreFilter === "todas" || r.type === exploreFilter),
    [exploreFilter]
  );

  function selectMarker(next: MapSelection) {
    setSelection(next);
    setPanel(next ? { type: "selection" } : null);
  }

  function changeMode(next: MapMode) {
    if (mode === "create-route" && next !== "create-route" && creatorGpsMode) {
      gpsTracker.stop();
      gpsTracker.reset();
      setCreatorGpsMode(false);
      setCreatorPoints([]);
    }
    setMode(next);
  }

  function handleMapClick(event: MapMouseEvent) {
    if (mode === "create-route" && !creatorGpsMode) {
      setCreatorPoints((points) => [...points, [event.lngLat.lng, event.lngLat.lat]]);
      return;
    }
    selectMarker(null);
  }

  function handleResultSelect(position: LngLat, label: string) {
    mapInstance?.flyTo({ center: position, zoom: 14, duration: 800 });
    toast.success(`Mostrando ${label}`);
  }

  function handleLocate(position: LngLat, accuracy: number) {
    setUserPosition(position);
    setGpsAccuracy(accuracy);
    mapInstance?.flyTo({ center: position, zoom: 15, duration: 800 });
  }

  function toggleSavedRoute(id: string) {
    setSavedRouteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Rota removida dos salvos.");
      } else {
        next.add(id);
        toast.success("Rota salva!");
      }
      return next;
    });
  }

  function flyToRoute(id: string) {
    const path = MOCK_ROUTE_GEO[id]?.path ?? customRoutes.find((r) => r.id === id)?.path;
    if (!path?.length) return;
    mapInstance?.flyTo({ center: path[Math.floor(path.length / 2)], zoom: 14, duration: 800 });
    setPanel(null);
  }

  const creatorActivePoints = creatorGpsMode ? gpsTracker.path : creatorPoints;

  function handleSaveCreatedRoute(name: string) {
    const route: CustomRoute = {
      id: generateId("custom-route"),
      name,
      distanceKm: Math.round(pathDistanceKm(creatorActivePoints) * 10) / 10,
      path: creatorActivePoints,
    };
    setCustomRoutes((prev) => [route, ...prev]);
    if (creatorGpsMode) {
      gpsTracker.stop();
      gpsTracker.reset();
      setCreatorGpsMode(false);
    }
    setCreatorPoints([]);
    setMode("view");
    toast.success("Rota salva com sucesso!");
  }

  function handleCreatorClear() {
    if (creatorGpsMode) {
      gpsTracker.clearPoints();
      return;
    }
    setCreatorPoints([]);
  }

  function handleCreatorUndo() {
    if (creatorGpsMode) {
      gpsTracker.undoLastPoint();
      return;
    }
    setCreatorPoints((p) => p.slice(0, -1));
  }

  function exitCreator() {
    if (creatorGpsMode) gpsTracker.stop();
    setCreatorGpsMode(false);
    setCreatorPoints([]);
    gpsTracker.reset();
    setMode("view");
  }

  function toggleCreatorGpsMode() {
    if (creatorGpsMode) {
      gpsTracker.stop();
      setCreatorGpsMode(false);
      return;
    }
    setCreatorPoints([]);
    gpsTracker.reset();
    setFollowing(true);
    setCreatorGpsMode(true);
    gpsTracker.start();
  }

  function startRecording(type: ActivityType) {
    setFollowRoute(null);
    setRouteFetchFailed(false);
    gpsTracker.reset();
    setRecordingType(type);
    setMode("record");
    setFollowing(true);
    setPanel(null);
    gpsTracker.start();
  }

  function finishRecording() {
    gpsTracker.stop();
    setFollowRoute(null);
    setRouteFetchFailed(false);
    if (recordingType && gpsTracker.path.length >= 2 && gpsTracker.distanceKm > 0.01) {
      const path = gpsTracker.path;
      setRecordingSummary({
        type: recordingType,
        distanceKm: gpsTracker.distanceKm,
        durationSeconds: gpsTracker.elapsedSeconds,
        elevationGainM: gpsTracker.elevationGainM,
        path,
        city: null,
        cityLoading: true,
      });
      setPanel({ type: "recording-summary" });
      const bounds = boundsOf(path);
      mapInstance?.fitBounds(bounds, { padding: 80, duration: 800 });

      reverseGeocodeCity(path[path.length - 1]).then((city) => {
        setRecordingSummary((prev) => (prev ? { ...prev, city, cityLoading: false } : prev));
      });
    } else {
      toast.info("Gravação muito curta para salvar.");
      gpsTracker.reset();
    }
    setRecordingType(null);
    setMode("view");
  }

  function discardRecording() {
    setRecordingSummary(null);
    setPanel(null);
    gpsTracker.reset();
  }

  // TODO(supabase): persist the recorded activity to the activities table instead of localStorage.
  function buildActivityFromSummary(title: string): Activity | null {
    if (!recordingSummary) return null;
    const paceSecondsPerKm =
      recordingSummary.distanceKm > 0 ? recordingSummary.durationSeconds / recordingSummary.distanceKm : 0;
    const hasRealElevation = recordingSummary.elevationGainM !== null;
    return {
      id: generateId("activity"),
      type: recordingSummary.type,
      title,
      description: "",
      date: new Date().toISOString(),
      distanceKm: Math.round(recordingSummary.distanceKm * 100) / 100,
      durationSeconds: recordingSummary.durationSeconds,
      calories: Math.round(recordingSummary.distanceKm * CALORIES_PER_KM_ESTIMATE[recordingSummary.type]),
      caloriesEstimated: true,
      elevationM: hasRealElevation
        ? (recordingSummary.elevationGainM as number)
        : Math.round(recordingSummary.distanceKm * ELEVATION_M_PER_KM_ESTIMATE),
      elevationSource: hasRealElevation ? "gps" : "estimate",
      path: recordingSummary.path,
      city: recordingSummary.city ?? undefined,
      privacy: "privado",
      routeVariant: 1,
      splitsSecondsPerKm: Array.from({ length: Math.max(Math.round(recordingSummary.distanceKm), 1) }, () => Math.round(paceSecondsPerKm)),
      likes: 0,
      comments: 0,
    };
  }

  function saveRecording(title: string) {
    try {
      const activity = buildActivityFromSummary(title);
      if (!activity) return;

      const saved = addSavedActivity(activity);
      if (!saved) {
        toast.error("Não foi possível salvar a atividade — armazenamento do dispositivo cheio. Libere espaço (ex: exportando ou apagando atividades antigas) e tente de novo.");
        return;
      }

      toast.success(`"${title}" salva com sucesso!`);
      setRecordingSummary(null);
      setPanel(null);
      gpsTracker.reset();
    } catch (error) {
      toast.error("Não foi possível salvar a atividade. Tente de novo.");
      console.error("saveRecording failed", error);
    }
  }

  function shareRecording(title: string) {
    try {
      const activity = buildActivityFromSummary(title);
      if (!activity) return;

      const saved = addSavedActivity(activity);
      if (!saved) {
        toast.error("Não foi possível salvar a atividade — armazenamento do dispositivo cheio. Libere espaço e tente de novo.");
        return;
      }

      setRecordingSummary(null);
      setPanel(null);
      gpsTracker.reset();
      router.push(`/activity/${activity.id}/share`);
    } catch (error) {
      toast.error("Não foi possível salvar a atividade. Tente de novo.");
      console.error("shareRecording failed", error);
    }
  }

  const selectedRoute =
    selection?.type === "route" ? MOCK_ROUTES.find((r) => r.id === selection.id) ?? null : null;
  const selectedActivity =
    selection?.type === "activity" ? MOCK_FEED_POSTS.find((p) => p.id === selection.id) ?? null : null;
  const selectedEvent =
    selection?.type === "event" ? MOCK_EVENTS.find((e) => e.id === selection.id) ?? null : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <MapTopBar onResultSelect={handleResultSelect} />

      <div className="relative flex flex-1 overflow-hidden">
        <MapSidebar
          mode={mode}
          onModeChange={(next) => {
            changeMode(next);
            setPanel(next === "create-route" ? null : panel);
          }}
          myRoutesOpen={panel?.type === "my-routes"}
          onToggleMyRoutes={() => setPanel((p) => (p?.type === "my-routes" ? null : { type: "my-routes" }))}
          onStartRecording={startRecording}
        />

        <div className="relative flex-1">
          <ZyronMap
            baseStyle={baseStyle}
            onClick={handleMapClick}
            onMapLoad={setMapInstance}
            onDragStart={() => {
              if (mode === "record" || creatorGpsMode) setFollowing(false);
            }}
            cursor={mode === "create-route" && !creatorGpsMode ? "crosshair" : undefined}
          >
            {visibility.routes &&
              mode !== "record" &&
              visibleRoutes.map((route) => {
                const geo = MOCK_ROUTE_GEO[route.id];
                if (!geo) return null;
                const midpoint = geo.path[Math.floor(geo.path.length / 2)];
                return (
                  <Fragment key={route.id}>
                    <RouteLine id={route.id} path={geo.path} />
                    <RouteMarker
                      position={midpoint}
                      type={route.type}
                      label={route.name}
                      selected={selection?.type === "route" && selection.id === route.id}
                      onSelect={() => selectMarker({ type: "route", id: route.id })}
                    />
                  </Fragment>
                );
              })}

            {visibility.activities &&
              MOCK_FEED_POSTS.map((post) => {
                const geo = MOCK_ACTIVITY_GEO[post.id];
                if (!geo) return null;
                return (
                  <ActivityMarker
                    key={post.id}
                    position={geo.position}
                    type={post.activityType}
                    distanceKm={post.distanceKm}
                    selected={selection?.type === "activity" && selection.id === post.id}
                    onSelect={() => selectMarker({ type: "activity", id: post.id })}
                  />
                );
              })}

            {visibility.events &&
              MOCK_EVENTS.map((event) => {
                const geo = MOCK_EVENT_GEO[event.id];
                if (!geo) return null;
                return (
                  <EventMarker
                    key={event.id}
                    position={geo.position}
                    label={event.name}
                    selected={selection?.type === "event" && selection.id === event.id}
                    onSelect={() => selectMarker({ type: "event", id: event.id })}
                  />
                );
              })}

            {mode !== "record" &&
              customRoutes.map((route) => <RouteLine key={route.id} id={route.id} path={route.path} color="#22c55e" />)}

            {mode === "create-route" && creatorActivePoints.length > 1 && (
              <RouteLine id="creator-draft" path={creatorActivePoints} color="#22c55e" dashed={!creatorGpsMode} />
            )}

            {mode === "record" && followRoute && followRoute.path.length > 0 && (
              <RouteLine id="follow-route" path={followRoute.path} color="#f59e0b" width={4} dashed />
            )}

            {mode === "record" && gpsTracker.path.length > 1 && (
              <RouteLine id="live-recording-track" path={gpsTracker.path} width={5} />
            )}

            {recordingSummary && <RouteLine id="finished-recording-track" path={recordingSummary.path} width={5} />}

            {displayUserPosition &&
              (mode === "record" ? (
                <DirectionMarker position={displayUserPosition} bearing={heading} />
              ) : (
                <UserLocationMarker position={displayUserPosition} />
              ))}
          </ZyronMap>

          {/* Floating controls — desktop top-right, mobile top-right below the safe area */}
          <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
            <MapLayers baseStyle={baseStyle} onBaseStyleChange={setBaseStyle} visibility={visibility} onVisibilityChange={setVisibility} />
            <LocationButton onLocate={handleLocate} />
            <MapControls mapInstance={mapInstance} />
          </div>

          {displayGpsAccuracy !== null && <GpsStatus accuracy={displayGpsAccuracy} className="absolute left-4 top-4 z-10" />}

          {(mode === "record" || creatorGpsMode) && !following && (
            <RecenterButton
              onClick={() => {
                setFollowing(true);
                if (gpsTracker.currentPosition) {
                  mapInstance?.flyTo({ center: gpsTracker.currentPosition, zoom: 16, duration: 600 });
                }
              }}
              className="absolute left-1/2 top-16 z-10 -translate-x-1/2"
            />
          )}

          {mode === "record" && followRoute && (
            <div className="absolute inset-x-4 top-4 z-10 flex justify-center">
              <div className="flex max-w-sm items-center gap-2.5 rounded-2xl bg-card px-3.5 py-2.5 shadow-lg">
                <span className="size-2 shrink-0 rounded-full bg-[#f59e0b]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {followRoute.path.length === 0
                      ? routeFetchFailed
                        ? "Sem conexão — não foi possível traçar a rota, mas o GPS continua gravando normalmente."
                        : "Traçando volta a partir de onde você está..."
                      : currentStep
                        ? currentStep.instructionPt
                        : "Calculando rota por voz..."}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">Seguindo: {followRoute.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceEnabled((v) => !v)}
                  aria-label={voiceEnabled ? "Desativar voz" : "Ativar voz"}
                  className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {voiceEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "explore" && (
            <ExploreFilterChips
              active={exploreFilter}
              onChange={setExploreFilter}
              className="absolute inset-x-4 top-4 z-10 lg:left-1/2 lg:right-auto lg:-translate-x-1/2"
            />
          )}

          {mode === "create-route" && (
            <RouteCreatorPanel
              points={creatorActivePoints}
              onUndo={handleCreatorUndo}
              onClear={handleCreatorClear}
              onSave={handleSaveCreatedRoute}
              onExit={exitCreator}
              gpsMode={creatorGpsMode}
              onToggleGpsMode={toggleCreatorGpsMode}
            />
          )}

          {mode === "record" && recordingType && (
            <LiveTrackingPanel
              type={recordingType}
              elapsedSeconds={gpsTracker.elapsedSeconds}
              distanceKm={gpsTracker.distanceKm}
              paused={gpsTracker.paused}
              onPauseResume={() => (gpsTracker.paused ? gpsTracker.resume() : gpsTracker.pause())}
              onFinish={finishRecording}
            />
          )}

          {panel?.type === "selection" && (
            <MapBottomSheet open onClose={() => selectMarker(null)}>
              {selectedRoute && (
                <RouteDetails
                  route={selectedRoute}
                  rating={MOCK_ROUTE_GEO[selectedRoute.id]?.rating ?? 4.5}
                  saved={savedRouteIds.has(selectedRoute.id)}
                  onToggleSave={() => toggleSavedRoute(selectedRoute.id)}
                  onViewOnMap={() => flyToRoute(selectedRoute.id)}
                />
              )}
              {selectedActivity && <ActivityDetails post={selectedActivity} />}
              {selectedEvent && <EventDetails event={selectedEvent} />}
            </MapBottomSheet>
          )}

          {panel?.type === "my-routes" && (
            <MapBottomSheet open onClose={() => setPanel(null)}>
              <MyRoutesPanel
                routes={MOCK_ROUTES}
                customRoutes={customRoutes}
                savedIds={savedRouteIds}
                onToggleSave={toggleSavedRoute}
                onSelectRoute={flyToRoute}
              />
            </MapBottomSheet>
          )}

          {panel?.type === "recording-summary" && recordingSummary && (
            <MapBottomSheet open onClose={discardRecording} expandable>
              <RecordingSummary
                type={recordingSummary.type}
                distanceKm={recordingSummary.distanceKm}
                durationSeconds={recordingSummary.durationSeconds}
                elevationGainM={recordingSummary.elevationGainM}
                city={recordingSummary.city}
                cityLoading={recordingSummary.cityLoading}
                onSave={saveRecording}
                onShare={shareRecording}
                onDiscard={discardRecording}
              />
            </MapBottomSheet>
          )}

          {/* Mobile-only floating action buttons */}
          <div className="absolute bottom-6 right-4 z-10 flex flex-col items-end gap-3 lg:hidden">
            <Button
              variant="secondary"
              size="icon"
              className="size-12 rounded-full border border-border shadow-2xl"
              onClick={() => changeMode(mode === "create-route" ? "view" : "create-route")}
              aria-label="Criar rota"
            >
              <RouteIcon className="size-5" />
            </Button>
            <RecordActivitySheet
              onSelect={startRecording}
              trigger={
                <Button size="icon" className="glow-brand size-14 rounded-full shadow-2xl" aria-label="Gravar atividade">
                  <Plus className="size-6" />
                </Button>
              }
            />
          </div>

          {/* Desktop-only bottom action bar */}
          <div className="absolute inset-x-4 bottom-4 z-10 hidden items-center justify-center gap-3 lg:flex">
            <RecordActivitySheet
              onSelect={startRecording}
              trigger={
                <Button size="lg" className="glow-brand shadow-2xl">
                  <Play className="size-4" />
                  Gravar atividade
                </Button>
              }
            />
            <Button
              size="lg"
              variant={mode === "create-route" ? "secondary" : "outline"}
              className="bg-card shadow-2xl"
              onClick={() => changeMode(mode === "create-route" ? "view" : "create-route")}
            >
              <RouteIcon className="size-4" />
              Criar rota
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
