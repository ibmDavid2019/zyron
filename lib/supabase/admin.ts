import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Full-access Supabase client using the `service_role` key — bypasses Row
 * Level Security entirely. Server-only, for routes that have no user
 * session/cookies to authenticate with and need to write to another user's
 * row. Never import this from anything that could run in the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
