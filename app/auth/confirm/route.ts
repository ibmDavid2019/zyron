import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies email-link auth (password recovery, signup confirmation) via a
 * `token_hash`, unlike `/auth/callback`'s `code` exchange. This is stateless
 * on our side — no PKCE code verifier needs to have been stored by whichever
 * browser/app started the request — so the link works no matter where it's
 * opened, including a different device than the one that requested it.
 *
 * Requires the Supabase email templates to link here with `token_hash` and
 * `type` (e.g. `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`)
 * instead of the default `{{ .ConfirmationURL }}`.
 */
export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestOrigin;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
