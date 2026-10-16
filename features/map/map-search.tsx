"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DEFAULT_MAP_CENTER } from "@/lib/mock-map-data";
import { cn } from "@/lib/utils";
import type { LngLat } from "@/types/map";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const SEARCHBOX_BASE = "https://api.mapbox.com/search/searchbox/v1";

// The plain Geocoding API (used previously) has no concept of landmarks —
// searching "Parque Ibirapuera" returned random unrelated streets that
// happened to contain the word "Ibirapuera", never the actual park. The
// Search Box API adds real POI search, but weighs proximity so heavily that
// a city/place match far from the user (e.g. searching "Rio de Janeiro"
// while in São Paulo) gets buried under dozens of nearby small businesses
// sharing words with the query. Querying admin areas (city/region/...) and
// local results (address/street/POI) separately and merging admin-first
// fixes both: real places rank correctly regardless of distance, and real
// landmarks/addresses still show up.
const ADMIN_TYPES = "country,region,postcode,district,place,locality,neighborhood";
const LOCAL_TYPES = "address,street,poi";

interface GeocodeResult {
  id: string;
  name: string;
  fullAddress: string;
}

interface SearchBoxSuggestion {
  mapbox_id: string;
  name: string;
  full_address?: string;
  place_formatted?: string;
}

interface MapSearchProps {
  onResultSelect: (position: LngLat, label: string) => void;
  /** Mirrors the raw typed text upward — lets a caller reuse this as its single search box and drive its own local text filtering, not just place selection. */
  onQueryChange?: (value: string) => void;
  /** Biases results toward this point (defaults to the map's default center). */
  proximity?: LngLat;
  placeholder?: string;
  className?: string;
}

function newSessionToken(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function suggest(q: string, types: string, proximity: LngLat, sessionToken: string): Promise<GeocodeResult[]> {
  if (!MAPBOX_TOKEN) return [];
  try {
    const url = new URL(`${SEARCHBOX_BASE}/suggest`);
    url.searchParams.set("q", q);
    url.searchParams.set("access_token", MAPBOX_TOKEN);
    url.searchParams.set("session_token", sessionToken);
    url.searchParams.set("language", "pt");
    url.searchParams.set("country", "br");
    url.searchParams.set("proximity", `${proximity[0]},${proximity[1]}`);
    url.searchParams.set("types", types);
    url.searchParams.set("limit", "6");

    const response = await fetch(url.toString());
    if (!response.ok) return [];
    const data = await response.json();
    return ((data.suggestions ?? []) as SearchBoxSuggestion[]).map((s) => ({
      id: s.mapbox_id,
      name: s.name,
      fullAddress: s.full_address ?? s.place_formatted ?? "",
    }));
  } catch {
    return [];
  }
}

async function retrievePosition(mapboxId: string, sessionToken: string): Promise<LngLat | null> {
  if (!MAPBOX_TOKEN) return null;
  try {
    const url = new URL(`${SEARCHBOX_BASE}/retrieve/${mapboxId}`);
    url.searchParams.set("access_token", MAPBOX_TOKEN);
    url.searchParams.set("session_token", sessionToken);

    const response = await fetch(url.toString());
    if (!response.ok) return null;
    const data = await response.json();
    const coordinates = data.features?.[0]?.geometry?.coordinates as LngLat | undefined;
    return coordinates ?? null;
  } catch {
    return null;
  }
}

export function MapSearch({
  onResultSelect,
  onQueryChange,
  proximity = DEFAULT_MAP_CENTER,
  placeholder = "Pesquisar cidade, endereço ou local...",
  className,
}: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef(newSessionToken());

  useEffect(() => {
    const trimmed = query.trim();

    const timeout = setTimeout(async () => {
      if (!trimmed || !MAPBOX_TOKEN) {
        setResults([]);
        return;
      }

      setLoading(true);
      const [admin, local] = await Promise.all([
        suggest(trimmed, ADMIN_TYPES, proximity, sessionTokenRef.current),
        suggest(trimmed, LOCAL_TYPES, proximity, sessionTokenRef.current),
      ]);
      setLoading(false);

      const seen = new Set<string>();
      const merged: GeocodeResult[] = [];
      for (const result of [...admin.slice(0, 3), ...local]) {
        if (seen.has(result.id)) continue;
        seen.add(result.id);
        merged.push(result);
        if (merged.length >= 6) break;
      }
      setResults(merged);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, proximity]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelect(result: GeocodeResult) {
    setSelecting(result.id);
    const position = await retrievePosition(result.id, sessionTokenRef.current);
    setSelecting(null);
    setOpen(false);
    setQuery(result.name);
    onQueryChange?.(result.name);
    // A session token spans one full search (typing + pick) — start a fresh one for the next.
    sessionTokenRef.current = newSessionToken();

    if (!position) return;
    onResultSelect(position, result.name);
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onQueryChange?.(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="rounded-xl bg-card pl-9 pr-9 shadow-lg"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
        {!loading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onQueryChange?.("");
              setResults([]);
            }}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-2xl">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelect(result)}
              disabled={selecting !== null}
              className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-60"
            >
              {selecting === result.id ? (
                <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-brand" />
              ) : (
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium">{result.name}</span>
                {result.fullAddress && (
                  <span className="block truncate text-xs text-muted-foreground">{result.fullAddress}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
