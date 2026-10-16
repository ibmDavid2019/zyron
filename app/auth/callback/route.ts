import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EXCHANGE_TIMEOUT_MS = 8000;

/** Exchanges the OAuth `code` from Google (via Supabase) for a session cookie. */
export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Behind a reverse proxy (Cloudflare Tunnel, ngrok, etc.) the request URL
  // Next.js sees is the internal origin (e.g. localhost:3000), not the
  // public one the browser is actually on — trust the forwarded headers
  // when present so the redirect lands back on the real public host.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestOrigin;

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await Promise.race([
        supabase.auth.exchangeCodeForSession(code),
        new Promise<{ error: Error }>((resolve) =>
          setTimeout(() => resolve({ error: new Error("timeout") }), EXCHANGE_TIMEOUT_MS)
        ),
      ]);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // falls through to the error redirect below
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
