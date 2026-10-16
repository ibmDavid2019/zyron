"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Whether the current user should see zero ads — either an admin account or
 * a paying/ad-removal-granted subscription (`status === "active"`, set by
 * the Cakto webhook for a paid month or by `grant_ad_unlock()` for a
 * temporary 24h removal). Every other status still gets full app access —
 * this only ever decides whether ads show, never whether a page loads.
 */
export function usePremiumStatus(): { isPremium: boolean; loading: boolean } {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("subscriptions")
          .select("status, is_admin")
          .eq("user_id", user.id)
          .maybeSingle<{ status: string; is_admin: boolean }>();

        if (!cancelled && data) {
          setIsPremium(data.is_admin === true || data.status === "active");
        }
      } catch {
        // Supabase not configured in this instance — default to showing ads.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isPremium, loading };
}
