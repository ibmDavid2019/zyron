import { SocialLogin } from "@capgo/capacitor-social-login";
import { isNativeApp } from "@/lib/capacitor";
import { createClient } from "@/lib/supabase/client";

/**
 * Signs the user out and sends them to /login. On native, also tells
 * Google's Credential Manager to forget the account — otherwise the next
 * "Entrar com Google" attempt silently re-signs the same account back in
 * without showing the picker.
 */
export async function signOut() {
  if (isNativeApp()) {
    try {
      await SocialLogin.logout({ provider: "google" });
    } catch {
      // No active native Google session — fine, still sign out of Supabase below.
    }
  }

  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase not configured in this instance — nothing to sign out of.
  }

  // Otherwise the next account signed in on this device could briefly
  // inherit this user's cached id (see utils/local-store.ts) if the
  // `zyron-uid` cookie hasn't refreshed yet on their very first request.
  try {
    localStorage.removeItem("zyron:last-uid");
  } catch {
    // Ignore — worst case the fallback just briefly points at the old user.
  }

  window.location.href = "/login";
}
