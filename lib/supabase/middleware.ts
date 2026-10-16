import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Paths a logged-in user can always reach, even with an expired trial and no
// active subscription — otherwise they could never see the billing page (or
// finish signing up/logging in) to actually pay.
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/onboarding",
  "/billing",
  "/download",
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // /s/[share_token] — public shared-activity pages, reachable by anyone
  // with the link (including logged-out visitors and social-preview crawlers).
  return pathname.startsWith("/auth/") || pathname.startsWith("/api/") || pathname.startsWith("/s/");
}

/**
 * Refreshes the Supabase auth session cookie on every request, and — once
 * the `subscriptions` table exists (see supabase/migrations/0001_subscriptions.sql)
 * — gates access for logged-in users whose 7-day trial ended without
 * watching a rewarded ad to unlock another 24h (see features/billing and
 * supabase/migrations/0007_remove_cakto_add_ad_unlock.sql). Called from
 * `proxy.ts` (Next.js 16 renamed Middleware to Proxy — same mechanism).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  // Required to keep the session alive for Server Components — do not
  // remove or run logic between client creation and this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A plain (non-httpOnly) cookie mirroring the current user id, so client
  // code can synchronously scope its localStorage data (utils/local-store.ts)
  // per account without an async round-trip — otherwise every account on
  // the same browser/device reads and writes the exact same localStorage
  // keys and ends up sharing activities, plans, etc.
  if (user) {
    // Without an explicit maxAge this is a session cookie, which some
    // WebViews (including the native Android app) clear when the app
    // process is killed rather than just backgrounded — wiping the scope
    // key mid-use and making already-saved local data look "lost" the next
    // time the app opens, even though it's still sitting in localStorage
    // under the old key.
    supabaseResponse.cookies.set("zyron-uid", user.id, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    supabaseResponse.cookies.delete("zyron-uid");
  }

  if (user && !isPublicPath(request.nextUrl.pathname)) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at, is_admin")
      .eq("user_id", user.id)
      .maybeSingle();

    // No row means the migration hasn't been run yet (or the signup trigger
    // hasn't fired) — fail open rather than lock everyone out, so this gate
    // self-activates the moment the real table exists, with no separate
    // "is this feature configured" flag to maintain anywhere.
    if (subscription) {
      const hasAccess =
        subscription.is_admin === true ||
        subscription.status === "active" ||
        (subscription.trial_ends_at !== null && new Date(subscription.trial_ends_at) > new Date());
      if (!hasAccess) {
        const url = request.nextUrl.clone();
        url.pathname = "/billing";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
