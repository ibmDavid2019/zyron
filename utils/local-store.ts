import type { Activity } from "@/types/activity";
import type { WeeklyPlanDay } from "@/types/ai";
import type { LngLat } from "@/types/map";
import type { TrainingPlan } from "@/types/training-plan";
import type { User } from "@/types/user";

// Lightweight client-only persistence for edits that would normally hit a
// real backend. TODO(supabase): replace both with real tables once wired up.

const PROFILE_KEY = "zyron:profile-overrides";
const ACTIVITIES_KEY = "zyron:saved-activities";
const ACTIVE_PLAN_KEY = "zyron:active-plan-id";
const WEEKLY_PLAN_KEY = "zyron:weekly-plan-override";
const PLAN_DETAILS_KEY = "zyron:plan-overrides";
const SAVED_ROUTES_KEY = "zyron:saved-route-ids";
const RECENT_SEARCHES_KEY = "zyron:recent-searches";
const RECENT_SEARCHES_LIMIT = 5;
const DELETED_ACTIVITY_IDS_KEY = "zyron:deleted-activity-ids";

/** Sentinel stored in ACTIVE_PLAN_KEY to mean "explicitly deactivated", distinct from "never touched". */
const NO_ACTIVE_PLAN = "__none__";

/** Fired on the window whenever the weekly plan OR the active training plan changes, so other mounted components (e.g. the AI context panel) can refresh live. */
export const WEEKLY_PLAN_CHANGED_EVENT = "zyron:weekly-plan-changed";

const LAST_UID_KEY = "zyron:last-uid";

/**
 * Reads the `zyron-uid` cookie set by lib/supabase/middleware.ts on every
 * request. All localStorage keys below are suffixed with this id so that
 * different accounts signed in on the same browser/device never read or
 * write each other's activities, plans, etc. — plain localStorage keys are
 * shared across the whole origin regardless of who's logged in.
 *
 * Falls back to the last-seen id (cached in localStorage itself) when the
 * cookie is momentarily missing — cookies can be dropped by a WebView on
 * app close in a way plain localStorage isn't, and without this fallback a
 * save made under the real id would look "lost" once the cookie disappears
 * and reads fall back to a generic "anon" scope instead.
 */
function currentUserScope(): string {
  if (typeof document === "undefined") return "anon";
  const match = document.cookie.match(/(?:^|; )zyron-uid=([^;]+)/);
  if (match) {
    const uid = decodeURIComponent(match[1]);
    try {
      localStorage.setItem(LAST_UID_KEY, uid);
    } catch {
      // Ignore — worst case we just lose the fallback for next time.
    }
    return uid;
  }
  try {
    return localStorage.getItem(LAST_UID_KEY) ?? "anon";
  } catch {
    return "anon";
  }
}

function scopedKey(base: string): string {
  return `${base}:${currentUserScope()}`;
}

export function getProfileOverrides(): Partial<User> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(scopedKey(PROFILE_KEY));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProfileOverrides(overrides: Partial<User>) {
  const merged = { ...getProfileOverrides(), ...overrides };
  localStorage.setItem(scopedKey(PROFILE_KEY), JSON.stringify(merged));
}

export function getSavedActivities(): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(scopedKey(ACTIVITIES_KEY));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Prepends a newly recorded activity so it shows up first, most-recent-first.
 * Returns whether the write actually succeeded — localStorage.setItem throws
 * (most commonly QuotaExceededError, once accumulated activities/GPS paths
 * outgrow the ~5-10MB per-origin limit) without React ever surfacing it, so
 * callers must check this instead of assuming the save always goes through.
 */
export function addSavedActivity(activity: Activity): boolean {
  const next = [activity, ...getSavedActivities()];
  try {
    localStorage.setItem(scopedKey(ACTIVITIES_KEY), JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function getDeletedActivityIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(scopedKey(DELETED_ACTIVITY_IDS_KEY));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Deletes an activity: removed outright if it was a real recording (stored
 * locally), and remembered as hidden either way — demo/mock activities have
 * no storage entry to remove, so hiding their id is the only way to make
 * "delete" stick for them too.
 */
export function deleteActivity(id: string) {
  const remaining = getSavedActivities().filter((a) => a.id !== id);
  localStorage.setItem(scopedKey(ACTIVITIES_KEY), JSON.stringify(remaining));

  const deletedIds = getDeletedActivityIds();
  if (!deletedIds.includes(id)) {
    localStorage.setItem(scopedKey(DELETED_ACTIVITY_IDS_KEY), JSON.stringify([...deletedIds, id]));
  }
}

/** Returns the active plan id, `null` if explicitly deactivated, or `undefined` if never touched (caller should fall back to its own default). */
export function getActivePlanId(): string | null | undefined {
  if (typeof window === "undefined") return undefined;
  const stored = localStorage.getItem(scopedKey(ACTIVE_PLAN_KEY));
  if (stored === null) return undefined;
  return stored === NO_ACTIVE_PLAN ? null : stored;
}

export function setActivePlanId(id: string) {
  localStorage.setItem(scopedKey(ACTIVE_PLAN_KEY), id);
  window.dispatchEvent(new Event(WEEKLY_PLAN_CHANGED_EVENT));
}

export function deactivateActivePlan() {
  localStorage.setItem(scopedKey(ACTIVE_PLAN_KEY), NO_ACTIVE_PLAN);
  window.dispatchEvent(new Event(WEEKLY_PLAN_CHANGED_EVENT));
}

export function getPlanOverrides(): Record<string, Partial<TrainingPlan>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(scopedKey(PLAN_DETAILS_KEY));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePlanOverride(id: string, partial: Partial<TrainingPlan>) {
  const all = getPlanOverrides();
  all[id] = { ...all[id], ...partial };
  localStorage.setItem(scopedKey(PLAN_DETAILS_KEY), JSON.stringify(all));
}

export function getWeeklyPlanOverride(): WeeklyPlanDay[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(scopedKey(WEEKLY_PLAN_KEY));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveWeeklyPlanOverride(days: WeeklyPlanDay[]) {
  localStorage.setItem(scopedKey(WEEKLY_PLAN_KEY), JSON.stringify(days));
  window.dispatchEvent(new Event(WEEKLY_PLAN_CHANGED_EVENT));
}

export function getSavedRouteIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(scopedKey(SAVED_ROUTES_KEY));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Toggles a route id in the saved list and returns whether it ended up saved. */
export function toggleSavedRouteId(id: string): boolean {
  const current = getSavedRouteIds();
  const saved = current.includes(id);
  const next = saved ? current.filter((routeId) => routeId !== id) : [id, ...current];
  localStorage.setItem(scopedKey(SAVED_ROUTES_KEY), JSON.stringify(next));
  return !saved;
}

export interface RecentSearch {
  label: string;
  position: LngLat;
}

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(scopedKey(RECENT_SEARCHES_KEY));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Records a place search, most-recent-first, deduplicated by label, capped at RECENT_SEARCHES_LIMIT. */
export function addRecentSearch(search: RecentSearch) {
  const trimmed = search.label.trim();
  if (!trimmed) return;
  const next = [
    { label: trimmed, position: search.position },
    ...getRecentSearches().filter((s) => s.label.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, RECENT_SEARCHES_LIMIT);
  localStorage.setItem(scopedKey(RECENT_SEARCHES_KEY), JSON.stringify(next));
}
