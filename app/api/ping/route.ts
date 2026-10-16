import { NextResponse } from "next/server";

/** Tiny, unauthenticated health check — used by hooks/use-network-status.ts to actively verify connectivity instead of trusting the WebView's unreliable navigator.onLine. */
export async function GET() {
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
