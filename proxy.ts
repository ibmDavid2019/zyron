import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed Middleware to Proxy; this file replaces the old
// `middleware.ts` convention with the same request/response semantics.
export async function proxy(request: NextRequest) {
  // Until Supabase credentials are configured, skip session handling
  // entirely so the rest of the (mocked) app keeps working unchanged.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|pwa-icon|manifest|sw.js).*)"],
};
