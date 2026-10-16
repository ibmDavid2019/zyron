import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session cookie on every request. The app
 * itself is free and never gated by subscription status — `subscriptions.status`
 * only decides whether ads show (see hooks/use-premium-status.ts), it never
 * blocks a route. Called from `proxy.ts` (Next.js 16 renamed Middleware to
 * Proxy — same mechanism).
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

  return supabaseResponse;
}
