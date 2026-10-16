"use client";

import { Fragment, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Flag,
  Flame,
  LocateFixed,
  Loader2,
  Map as MapIcon,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteCard } from "@/features/routes/route-card";
import { ExploreFilterChips } from "@/features/map/explore-filter-chips";
import { MapSearch } from "@/features/map/map-search";
import { MapLayers } from "@/features/map/map-layers";
import { MapBottomSheet } from "@/features/map/map-bottom-sheet";
import { RouteDetails } from "@/features/map/route-details";
import { ActivityDetails } from "@/features/map/activity-details";
import { EventDetails } from "@/features/map/event-details";
import { GeneratedRouteDetails } from "@/features/map/generated-route-details";
import { RouteLine } from "@/features/map/route-line";
import { RouteMarker } from "@/features/map/route-marker";
import { ActivityMarker } from "@/features/map/activity-marker";
import { EventMarker } from "@/features/map/event-marker";
import { RouteHeatmapLayer } from "@/features/map/route-heatmap-layer";
import { UserLocationMarker } from "@/features/map/user-location-marker";
import { CURRENT_USER } from "@/lib/mock-data";
import { DEFAULT_MAP_CENTER, MOCK_ACTIVITY_GEO, MOCK_EVENT_GEO, MOCK_ROUTE_GEO } from "@/lib/mock-map-data";
import {
  addRecentSearch,
  getProfileOverrides,
  getRecentSearches,
  getSavedRouteIds,
  toggleSavedRouteId,
  type RecentSearch,
} from "@/utils/local-store";
import { reverseGeocodeCity, reverseGeocodeNeighborhood } from "@/utils/geocode";
import { boundsOf, haversineDistanceKm } from "@/utils/geo";
import { fetchDirectionsToDestination, type DirectionsResult } from "@/utils/navigation";
import { stashFollowRoute } from "@/utils/follow-route";
import type { ActivityType } from "@/types/activity";
import { generateNearbyRoutes, type GeneratedRoute } from "@/utils/route-generator";
import { staticRouteMapUrl } from "@/utils/static-map";
import { boostRoadLabelVisibility } from "@/utils/map-style";
import type { FeedPost } from "@/types/social";
import type { LngLat, MapBaseStyle, MapLayerVisibility, MapSelection } from "@/types/map";
import type { OutdoorActivityType, RouteDifficulty, TrailRoute } from "@/types/route";
import type { SportEvent } from "@/types/event";
import { Marker, type MapRef } from "react-map-gl/mapbox";

const RoutesMap = dynamic(() => import("@/features/map/zyron-map").then((m) => m.ZyronMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />,
});

const ROUTE_DIFFICULTIES: RouteDifficulty[] = ["Fácil", "Moderada", "Difícil"];

type DistanceFilter = "todas" | "ate5" | "5a10" | "10mais";

const DISTANCE_FILTERS: { value: DistanceFilter; label: string }[] = [
  { value: "todas", label: "Qualquer distância" },
  { value: "ate5", label: "Até 5 km" },
  { value: "5a10", label: "5–10 km" },
  { value: "10mais", label: "10 km+" },
];

function matchesDistance(km: number, filter: DistanceFilter) {
  if (filter === "todas") return true;
  if (filter === "ate5") return km <= 5;
  if (filter === "5a10") return km > 5 && km <= 10;
  return km > 10;
}

/** Generated loops only come in two flavors (walking/cycling) — maps the sport chips onto them. */
function matchesGeneratedSport(profile: "walking" | "cycling", sportFilter: OutdoorActivityType | "todas") {
  if (sportFilter === "todas") return true;
  if (sportFilter === "ciclismo") return profile === "cycling";
  return profile === "walking";
}

/** Compares only the part before the first comma, case-insensitively — matches "São Paulo, BR" against "São Paulo, SP" or just "São Paulo". */
function cityKey(city: string) {
  return city.split(",")[0]?.trim().toLowerCase() ?? "";
}

function sameCity(a: string, b: string) {
  const keyA = cityKey(a);
  return keyA !== "" && keyA === cityKey(b);
}

/** The part after the last comma — a state/country code like "SC" or "BR". */
function regionKey(city: string) {
  const parts = city.split(",");
  return parts[parts.length - 1]?.trim().toLowerCase() ?? "";
}

type RouteScope = "cidade" | "regiao" | "todas";

interface RoutesResult {
  list: TrailRoute[];
  scope: RouteScope;
  searchIgnored: boolean;
}

/**
 * Never returns empty (as long as `routes` has anything matching the sport,
 * difficulty and distance filters): tries the current city, then the same
 * region, then everywhere — and if the search text itself is what's
 * excluding every result, drops it rather than showing a dead end.
 */
function resolveRoutes(
  routes: TrailRoute[],
  city: string | null,
  sportFilter: OutdoorActivityType | "todas",
  difficultyFilter: RouteDifficulty | "todas",
  distanceFilter: DistanceFilter,
  query: string
): RoutesResult {
  const byFilters = (list: TrailRoute[]) =>
    list.filter(
      (r) =>
        (sportFilter === "todas" || r.type === sportFilter) &&
        (difficultyFilter === "todas" || r.difficulty === difficultyFilter) &&
        matchesDistance(r.distanceKm, distanceFilter)
    );
  const bySearch = (list: TrailRoute[]) => list.filter((r) => matches(query, r.name, r.city));

  if (city) {
    const cityRoutes = bySearch(byFilters(routes.filter((r) => sameCity(r.city, city))));
    if (cityRoutes.length > 0) return { list: cityRoutes, scope: "cidade", searchIgnored: false };

    const region = regionKey(city);
    const regionRoutes = region ? bySearch(byFilters(routes.filter((r) => regionKey(r.city) === region))) : [];
    if (regionRoutes.length > 0) return { list: regionRoutes, scope: "regiao", searchIgnored: false };
  }

  const allWithSearch = bySearch(byFilters(routes));
  if (allWithSearch.length > 0) return { list: allWithSearch, scope: "todas", searchIgnored: false };

  return { list: byFilters(routes), scope: "todas", searchIgnored: query.trim() !== "" };
}

interface ExplorePageProps {
  posts: FeedPost[];
  routes: TrailRoute[];
  events: SportEvent[];
}

function matches(query: string, ...values: string[]) {
  if (!query) return true;
  const q = query.toLowerCase();
  return values.some((v) => v.toLowerCase().includes(q));
}

export function ExplorePage({ posts, routes, events }: ExplorePageProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [savedRouteIds, setSavedRouteIds] = useState<Set<string>>(new Set());
  const [onlySaved, setOnlySaved] = useState(false);
  const [userCity, setUserCity] = useState(CURRENT_USER.city ?? "");
  const [showAllCities, setShowAllCities] = useState(false);
  const [gpsCity, setGpsCity] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsRequested, setGpsRequested] = useState(false);
  const [sportFilter, setSportFilter] = useState<OutdoorActivityType | "todas">("todas");
  const [difficultyFilter, setDifficultyFilter] = useState<RouteDifficulty | "todas">("todas");
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>("todas");
  const [routesMapInstance, setRoutesMapInstance] = useState<MapRef | null>(null);
  const [selection, setSelection] = useState<MapSelection>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [gpsPosition, setGpsPosition] = useState<LngLat | null>(null);
  // Only ever set by a real device GPS fix (locateMe) — unlike gpsPosition,
  // never overwritten by picking a search result, so it stays a reliable
  // "where I actually am" origin for drawing directions to a destination.
  const [myRealPosition, setMyRealPosition] = useState<LngLat | null>(null);
  const [destination, setDestination] = useState<{ position: LngLat; label: string } | null>(null);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [generatedRoutes, setGeneratedRoutes] = useState<GeneratedRoute[]>([]);
  const [generatingRoutes, setGeneratingRoutes] = useState(false);
  const [savedGeneratedIds, setSavedGeneratedIds] = useState<Set<string>>(new Set());
  const [baseStyle, setBaseStyle] = useState<MapBaseStyle>("streets");
  const [layerVisibility, setLayerVisibility] = useState<MapLayerVisibility>({ routes: true, activities: true, events: false });
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [lastQueriedCenter, setLastQueriedCenter] = useState<LngLat | null>(null);
  const [manualPan, setManualPan] = useState(false);
  const [showSearchArea, setShowSearchArea] = useState(false);

  // Renders with the static mock city first so SSR and first paint match,
  // then layers in localStorage-backed state once mounted.
  useEffect(() => {
    const timeout = setTimeout(() => {
      const overrideCity = getProfileOverrides().city;
      if (overrideCity) setUserCity(overrideCity);
      setSavedRouteIds(new Set(getSavedRouteIds()));
      setRecentSearches(getRecentSearches());
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  /** Reverse-geocodes a position, updates GPS-derived state, and clears any pending "search this area" prompt. */
  async function applyPosition(position: LngLat, successMessage?: (city: string) => string) {
    const [city, hood] = await Promise.all([reverseGeocodeCity(position), reverseGeocodeNeighborhood(position)]);
    setGpsPosition(position);
    setNeighborhood(hood);
    setLastQueriedCenter(position);
    setManualPan(false);
    setShowSearchArea(false);
    if (city) {
      setGpsCity(city);
      if (successMessage) toast.success(successMessage(city));
    } else {
      toast.error("Não foi possível identificar a cidade desta localização.");
    }
  }

  function locateMe() {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocalização não é suportada neste navegador.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const here: LngLat = [position.coords.longitude, position.coords.latitude];
        setGpsLoading(false);
        setMyRealPosition(here);
        applyPosition(here, (city) => `Localização atualizada: ${city}`);
      },
      () => {
        setGpsLoading(false);
        toast.error("Não foi possível acessar sua localização. Mostrando rotas da cidade do seu perfil.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  /** Re-centers the search on wherever the map currently is, instead of the device's real GPS fix. */
  function searchThisArea() {
    if (!routesMapInstance) return;
    const center = routesMapInstance.getCenter();
    applyPosition([center.lng, center.lat], () => "Mostrando rotas desta área.");
  }

  function handlePlaceSelect(position: LngLat, label: string) {
    addRecentSearch({ label, position });
    setRecentSearches(getRecentSearches());
    goToDestination(position, label);
  }

  /** Sets a destination pin and draws the real walking/cycling route from the user's actual GPS fix (not the browsing center) to it. */
  async function goToDestination(position: LngLat, label: string) {
    setDestination({ position, label });
    setDirections(null);

    if (!myRealPosition) {
      routesMapInstance?.flyTo({ center: position, zoom: 13, duration: 800 });
      toast.error("Ative sua localização (\"Atualizar localização\") para traçar a rota até esse destino.");
      return;
    }

    setDirectionsLoading(true);
    const profile = sportFilter === "ciclismo" ? "cycling" : "walking";
    const result = await fetchDirectionsToDestination(myRealPosition, position, profile);
    setDirectionsLoading(false);

    if (!result) {
      routesMapInstance?.flyTo({ center: position, zoom: 13, duration: 800 });
      toast.error(`Não foi possível traçar a rota até ${label}.`);
      return;
    }

    setDirections(result);
    routesMapInstance?.fitBounds(boundsOf(result.path), { padding: 80, duration: 800 });
  }

  function clearDestination() {
    setDestination(null);
    setDirections(null);
  }

  /**
   * Hands the real (already-computed) route off to /map's recording mode,
   * same "Usar esta rota" mechanism catalog/generated routes use — but with
   * a real, street-snapped path instead of a fresh loop, since this one
   * actually goes somewhere specific. Every route followed on the map has
   * to leave from and return to wherever the rider actually starts (same as
   * the loops generated for catalog/generated routes), so this doubles back
   * along the same streets to the destination and back rather than
   * stranding the rider there one-way.
   */
  function useDirectionsAsRoute() {
    if (!destination || !directions) return;
    const type: ActivityType = sportFilter === "ciclismo" ? "ciclismo" : sportFilter === "corrida" ? "corrida" : "caminhada";
    const outAndBack = [...directions.path, ...[...directions.path].reverse().slice(1)];
    stashFollowRoute({ name: destination.label, distanceKm: directions.distanceKm * 2, type, path: outAndBack });
    router.push(`/map?mode=record&type=${type}`);
  }

  /** Same "Usar esta rota" handoff as the map bottom sheet's GeneratedRouteDetails, but reachable directly from the suggestion card — no extra tap into the sheet first. */
  function startGeneratedRoute(route: GeneratedRoute) {
    const type: ActivityType = route.profile === "cycling" ? "ciclismo" : "caminhada";
    stashFollowRoute({ name: route.name, distanceKm: route.distanceKm, type });
    router.push(`/map?mode=record&type=${type}`);
  }

  /** Offers "search this area" only after a real drag — not after our own flyTo/fitBounds calls. */
  function handleMapMoveEnd() {
    if (!manualPan || !routesMapInstance || !lastQueriedCenter) return;
    const center = routesMapInstance.getCenter();
    if (haversineDistanceKm([center.lng, center.lat], lastQueriedCenter) > 1.5) setShowSearchArea(true);
  }

  /** Makes street names easier to read on the embedded map — re-applied on every style switch (Mapa/Satélite/Terreno), since that reloads the whole style. */
  function handleRoutesMapLoad(map: MapRef) {
    setRoutesMapInstance(map);
    boostRoadLabelVisibility(map.getMap());
    map.getMap().on("style.load", () => boostRoadLabelVisibility(map.getMap()));
  }

  function viewRouteOnMap(routeId: string) {
    const path = MOCK_ROUTE_GEO[routeId]?.path;
    if (!path?.length || !routesMapInstance) return;
    routesMapInstance.flyTo({ center: path[Math.floor(path.length / 2)], zoom: 15.5, duration: 800 });
    // Keeps the route selected (its marker stays labeled) — only the sheet
    // closes, so the map isn't left cluttered with every other marker's
    // label competing for attention once we've flown in close.
    setSheetOpen(false);
  }

  function viewGeneratedRouteOnMap(routeId: string) {
    const path = generatedRoutes.find((r) => r.id === routeId)?.path;
    if (!path?.length || !routesMapInstance) return;
    routesMapInstance.fitBounds(boundsOf(path), { padding: 60, duration: 800 });
    setSheetOpen(false);
  }

  function toggleSavedRoute(id: string) {
    const nowSaved = toggleSavedRouteId(id);
    setSavedRouteIds((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(id);
      else next.delete(id);
      return next;
    });
    toast.success(nowSaved ? "Rota salva!" : "Rota removida dos salvos.");
  }

  function openSelection(next: MapSelection) {
    setSelection(next);
    setSheetOpen(true);
  }

  async function generateRoutesForNeighborhood() {
    if (!gpsPosition) {
      toast.error("Preciso da sua localização para sugerir rotas do seu bairro.");
      return;
    }
    setGeneratingRoutes(true);
    // "Todas" mixes both profiles in so cycling loops show up without the
    // user having to switch filters first; a specific sport narrows to it.
    const profiles: Array<"walking" | "cycling"> =
      sportFilter === "ciclismo" ? ["cycling"] : sportFilter === "todas" ? ["walking", "cycling"] : ["walking"];
    const results = await Promise.all(profiles.map((profile) => generateNearbyRoutes(gpsPosition, profile)));
    const generated = results.flat();
    setGeneratingRoutes(false);
    if (generated.length === 0) {
      toast.error("Não foi possível gerar rotas para sua região agora.");
      return;
    }
    setGeneratedRoutes(generated);
    toast.success(`${generated.length} rotas geradas para ${neighborhood ?? "sua região"}!`);
  }

  // Ask for real-time location the first time the page loads.
  useEffect(() => {
    if (gpsRequested) return;
    const timeout = setTimeout(() => {
      setGpsRequested(true);
      locateMe();
    }, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsRequested]);

  // Whenever we get a fresh position (first fix, search, "search this area",
  // or a manual refresh), generate real street-snapped loop routes around it.
  useEffect(() => {
    if (!gpsPosition) return;
    const timeout = setTimeout(() => {
      generateRoutesForNeighborhood();
    }, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsPosition]);

  const effectiveCity = gpsCity ?? userCity;

  const routesResult = useMemo(
    () => resolveRoutes(routes, showAllCities ? null : effectiveCity || null, sportFilter, difficultyFilter, distanceFilter, query),
    [routes, showAllCities, effectiveCity, sportFilter, difficultyFilter, distanceFilter, query]
  );
  const filteredRoutes = useMemo(
    () => (onlySaved ? routesResult.list.filter((r) => savedRouteIds.has(r.id)) : routesResult.list),
    [routesResult, onlySaved, savedRouteIds]
  );
  const visibleGeneratedRoutes = useMemo(
    () => generatedRoutes.filter((r) => matchesDistance(r.distanceKm, distanceFilter) && matchesGeneratedSport(r.profile, sportFilter)),
    [generatedRoutes, distanceFilter, sportFilter]
  );

  // Keeps the embedded map framed around whatever routes are currently shown.
  useEffect(() => {
    if (!routesMapInstance) return;
    const points = [
      ...filteredRoutes.flatMap((r) => MOCK_ROUTE_GEO[r.id]?.path ?? []),
      ...visibleGeneratedRoutes.flatMap((r) => r.path),
    ];
    if (points.length === 0) return;
    routesMapInstance.fitBounds(boundsOf(points), { padding: 60, duration: 600 });
  }, [routesMapInstance, filteredRoutes, visibleGeneratedRoutes]);

  const heatmapPoints = useMemo(() => {
    const routePoints = filteredRoutes.flatMap((r) => MOCK_ROUTE_GEO[r.id]?.path ?? []);
    const generatedPoints = visibleGeneratedRoutes.flatMap((r) => r.path);
    const activityPoints = layerVisibility.activities
      ? posts.map((p) => MOCK_ACTIVITY_GEO[p.id]?.position).filter((p): p is LngLat => !!p)
      : [];
    return [...routePoints, ...generatedPoints, ...activityPoints];
  }, [filteredRoutes, visibleGeneratedRoutes, layerVisibility.activities, posts]);

  const selectedRoute = selection?.type === "route" ? routes.find((r) => r.id === selection.id) ?? null : null;
  const selectedActivity = selection?.type === "activity" ? posts.find((p) => p.id === selection.id) ?? null : null;
  const selectedEvent = selection?.type === "event" ? events.find((e) => e.id === selection.id) ?? null : null;
  const selectedGenerated =
    selection?.type === "generated" ? generatedRoutes.find((r) => r.id === selection.id) ?? null : null;

  // While a specific route is selected, its line is the only one drawn —
  // otherwise every visible route's line competes for attention at once.
  const focusedRouteId = selection?.type === "route" ? selection.id : null;
  const focusedGeneratedId = selection?.type === "generated" ? selection.id : null;
  const isFocusingRoute = focusedRouteId !== null || focusedGeneratedId !== null;

  function toggleInSet(setState: Dispatch<SetStateAction<Set<string>>>, id: string, message?: string) {
    setState((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        if (message) toast.success(message);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Explorar</h1>
        <p className="text-muted-foreground">Descubra rotas perto de você.</p>
      </div>

      <div className="max-w-md space-y-2">
        <MapSearch
          onResultSelect={handlePlaceSelect}
          onQueryChange={setQuery}
          proximity={gpsPosition ?? DEFAULT_MAP_CENTER}
          placeholder="Buscar rotas, cidade ou endereço..."
        />
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Buscas recentes:</span>
            {recentSearches.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => handlePlaceSelect(s.position, s.label)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {gpsLoading ? <Loader2 className="size-3.5 animate-spin" /> : <MapPin className="size-3.5" />}
              {gpsLoading
                ? "Localizando você..."
                : routesResult.scope === "cidade"
                  ? `Rotas em ${effectiveCity}${gpsCity ? " (sua localização atual)" : ""}`
                  : routesResult.scope === "regiao"
                    ? `Rotas na região de ${effectiveCity}`
                    : "Rotas de todas as cidades"}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={locateMe}
                disabled={gpsLoading}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline disabled:opacity-60"
              >
                <LocateFixed className="size-3.5" />
                Atualizar localização
              </button>
              {effectiveCity && (
                <button
                  type="button"
                  onClick={() => setShowAllCities((v) => !v)}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {showAllCities ? "Ver só da minha cidade" : "Ver de todas as cidades"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOnlySaved((v) => !v)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
              >
                {onlySaved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
                {onlySaved ? "Ver todas" : `Salvos (${savedRouteIds.size})`}
              </button>
              <Link href="/routes" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
                Ver todas as rotas
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <ExploreFilterChips active={sportFilter} onChange={setSportFilter} />

          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setDifficultyFilter("todas")}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                difficultyFilter === "todas" ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card text-foreground"
              }`}
            >
              Qualquer dificuldade
            </button>
            {ROUTE_DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficultyFilter(level)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  difficultyFilter === level ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card text-foreground"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {DISTANCE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setDistanceFilter(f.value)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  distanceFilter === f.value ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => toast.info("Segmentos chegam em breve — ainda não temos esse recurso pronto.")}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              <Sparkles className="size-3.5" />
              Segmentos · em breve
            </button>
          </div>

          <div className="relative">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-border sm:h-96">
              <RoutesMap
                baseStyle={baseStyle}
                onMapLoad={handleRoutesMapLoad}
                onDragStart={() => setManualPan(true)}
                onMoveEnd={handleMapMoveEnd}
              >
                {layerVisibility.routes &&
                  filteredRoutes.map((route) => {
                    const geo = MOCK_ROUTE_GEO[route.id];
                    if (!geo) return null;
                    const midpoint = geo.path[Math.floor(geo.path.length / 2)];
                    const showLine = !isFocusingRoute || route.id === focusedRouteId;
                    return (
                      <Fragment key={route.id}>
                        {showLine && <RouteLine id={route.id} path={geo.path} />}
                        <RouteMarker
                          position={midpoint}
                          type={route.type}
                          label={route.name}
                          selected={selection?.type === "route" && selection.id === route.id}
                          onSelect={() => openSelection({ type: "route", id: route.id })}
                        />
                      </Fragment>
                    );
                  })}
                {layerVisibility.routes &&
                  visibleGeneratedRoutes
                    .filter((route) => !isFocusingRoute || route.id === focusedGeneratedId)
                    .map((route) => (
                      <RouteLine key={route.id} id={route.id} path={route.path} color="#22c55e" width={5} />
                    ))}
                {layerVisibility.activities &&
                  posts.map((post) => {
                    const geo = MOCK_ACTIVITY_GEO[post.id];
                    if (!geo) return null;
                    return (
                      <ActivityMarker
                        key={post.id}
                        position={geo.position}
                        type={post.activityType}
                        distanceKm={post.distanceKm}
                        selected={selection?.type === "activity" && selection.id === post.id}
                        onSelect={() => openSelection({ type: "activity", id: post.id })}
                      />
                    );
                  })}
                {layerVisibility.events &&
                  events.map((event) => {
                    const geo = MOCK_EVENT_GEO[event.id];
                    if (!geo) return null;
                    return (
                      <EventMarker
                        key={event.id}
                        position={geo.position}
                        label={event.name}
                        selected={selection?.type === "event" && selection.id === event.id}
                        onSelect={() => openSelection({ type: "event", id: event.id })}
                      />
                    );
                  })}
                {heatmapOn && <RouteHeatmapLayer points={heatmapPoints} />}
                {directions && <RouteLine id="directions-to-destination" path={directions.path} color="#a855f7" width={5} />}
                {destination && (
                  <Marker longitude={destination.position[0]} latitude={destination.position[1]} anchor="bottom">
                    <span className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#a855f7] text-white shadow-lg">
                      <Flag className="size-4" />
                    </span>
                  </Marker>
                )}
                {gpsPosition && <UserLocationMarker position={gpsPosition} />}
              </RoutesMap>

              <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHeatmapOn((v) => !v)}
                  aria-label="Mapa de calor"
                  title="Mapa de calor das rotas e atividades atuais (não é tráfego real de outros usuários)"
                  className={`flex size-10 items-center justify-center rounded-xl border shadow-lg transition-colors ${
                    heatmapOn ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <Flame className="size-4.5" />
                </button>
                <MapLayers
                  baseStyle={baseStyle}
                  onBaseStyleChange={setBaseStyle}
                  visibility={layerVisibility}
                  onVisibilityChange={setLayerVisibility}
                />
              </div>

              {showSearchArea && (
                <button
                  type="button"
                  onClick={searchThisArea}
                  className="absolute left-1/2 top-16 z-10 -translate-x-1/2 rounded-full bg-card px-4 py-2 text-xs font-semibold shadow-2xl transition-transform hover:scale-105"
                >
                  Pesquisar nesta área
                </button>
              )}

              {destination && (
                <div className="absolute left-3 right-3 top-3 z-10 max-w-sm rounded-xl border border-border bg-card p-2 shadow-lg sm:right-auto">
                  <div className="flex items-center gap-2">
                    {directionsLoading ? (
                      <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                      <Navigation className="size-4 shrink-0 text-[#a855f7]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{destination.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {directionsLoading
                          ? "Calculando rota..."
                          : directions
                            ? `${directions.distanceKm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km · ${directions.durationMin} min a ${sportFilter === "ciclismo" ? "bike" : "pé"}`
                            : "Rota indisponível"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearDestination}
                      aria-label="Remover destino"
                      className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  {directions && (
                    <Button size="sm" className="mt-2 w-full" onClick={useDirectionsAsRoute}>
                      Usar esta rota (ida e volta)
                    </Button>
                  )}
                </div>
              )}

              <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
                <Link
                  href="/map"
                  className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-lg transition-transform hover:scale-105"
                >
                  <MapIcon className="size-3.5" />
                  Mapa completo
                </Link>
                <Link
                  href="/map?mode=create-route"
                  className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-lg transition-transform hover:scale-105"
                >
                  <RouteIcon className="size-3.5" />
                  Criar rota
                </Link>
              </div>
            </div>

            {selection && sheetOpen && (
              <MapBottomSheet
                open
                onClose={() => {
                  setSheetOpen(false);
                  setSelection(null);
                }}
              >
                {selectedRoute && (
                  <RouteDetails
                    route={selectedRoute}
                    rating={MOCK_ROUTE_GEO[selectedRoute.id]?.rating ?? 4.5}
                    saved={savedRouteIds.has(selectedRoute.id)}
                    onToggleSave={() => toggleSavedRoute(selectedRoute.id)}
                    onViewOnMap={() => viewRouteOnMap(selectedRoute.id)}
                  />
                )}
                {selectedActivity && <ActivityDetails post={selectedActivity} />}
                {selectedEvent && <EventDetails event={selectedEvent} />}
                {selectedGenerated && (
                  <GeneratedRouteDetails
                    route={selectedGenerated}
                    neighborhood={neighborhood}
                    saved={savedGeneratedIds.has(selectedGenerated.id)}
                    onToggleSave={() => toggleInSet(setSavedGeneratedIds, selectedGenerated.id, "Rota salva!")}
                    onViewOnMap={() => viewGeneratedRouteOnMap(selectedGenerated.id)}
                  />
                )}
              </MapBottomSheet>
            )}
          </div>

          {gpsPosition && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">Rotas sugeridas para {neighborhood ?? "perto de você"}</p>
                <button
                  type="button"
                  onClick={generateRoutesForNeighborhood}
                  disabled={generatingRoutes}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline disabled:opacity-60"
                >
                  {generatingRoutes ? <Loader2 className="size-3.5 animate-spin" /> : <LocateFixed className="size-3.5" />}
                  {generatingRoutes ? "Gerando..." : "Gerar novamente"}
                </button>
              </div>

              {visibleGeneratedRoutes.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleGeneratedRoutes.map((route) => {
                    const mapUrl = staticRouteMapUrl(route.path, 400, 200, route.profile === "cycling" ? "3b82f6" : "22c55e");
                    return (
                      <div key={route.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                        <button
                          type="button"
                          onClick={() => openSelection({ type: "generated", id: route.id })}
                          aria-label={`Abrir rota ${route.name}`}
                          className="group relative block h-32 w-full bg-muted"
                        >
                          {mapUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- external Mapbox Static Images thumbnail, not a local/optimizable asset
                            <img
                              src={mapUrl}
                              alt={`Mapa da rota ${route.name}`}
                              className="size-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                              Mapa indisponível
                            </div>
                          )}
                          <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                          <span className="absolute right-2 top-2 rounded-full bg-brand-muted px-2 py-0.5 text-[11px] font-semibold text-brand">
                            Sugerida para você
                          </span>
                        </button>
                        <div className="p-4">
                          <button
                            type="button"
                            onClick={() => openSelection({ type: "generated", id: route.id })}
                            className="text-left"
                          >
                            <p className="font-semibold hover:underline">{route.name}</p>
                          </button>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Ruas reais do seu bairro · {route.profile === "cycling" ? "Ciclismo" : "A pé"}
                          </p>
                          <div className="mt-3 space-y-2">
                            <button
                              type="button"
                              onClick={() => toggleInSet(setSavedGeneratedIds, route.id, "Rota salva!")}
                              className="w-full rounded-xl border border-border py-2 text-sm font-medium transition-colors hover:bg-muted"
                            >
                              {savedGeneratedIds.has(route.id) ? "Rota salva ✓" : "Salvar rota"}
                            </button>
                            <Button size="sm" className="w-full" onClick={() => startGeneratedRoute(route)}>
                              Usar esta rota
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {routesResult.searchIgnored && (
            <p className="text-sm text-muted-foreground">
              Nenhuma rota encontrada para &quot;{query}&quot; — mostrando outras rotas disponíveis.
            </p>
          )}

          {filteredRoutes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="font-semibold">{onlySaved ? "Nenhuma rota salva ainda" : "Nenhuma rota encontrada"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {onlySaved ? "Toque em “Salvar rota” em qualquer rota para guardá-la aqui." : "Ajuste a busca ou os filtros."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  path={MOCK_ROUTE_GEO[route.id]?.path}
                  saved={savedRouteIds.has(route.id)}
                  onToggleSave={toggleSavedRoute}
                  onOpen={(id) => openSelection({ type: "route", id })}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
