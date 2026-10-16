import { SocialLogin } from "@capgo/capacitor-social-login";
import { isNativeApp } from "@/lib/capacitor";
import { createClient } from "@/lib/supabase/client";

/** "Web application" OAuth client — its ID is what Google puts in the ID token's audience, and what Supabase checks the token against. Must also have an "Android" OAuth client registered (package + SHA-1) for Credential Manager to authorize the request at all, even though that client's ID is never referenced here. */
const WEB_CLIENT_ID = "181177314267-5cn2uredvjg9tpnoto5c6111i3ech4rv.apps.googleusercontent.com";

let socialLoginInitialized = false;

async function ensureSocialLoginInitialized() {
  if (socialLoginInitialized) return;
  await SocialLogin.initialize({ google: { webClientId: WEB_CLIENT_ID } });
  socialLoginInitialized = true;
}

function randomNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Starts the Google sign-in flow.
 *
 * On the web, this is a standard Supabase OAuth browser redirect: it
 * navigates to Google's consent screen, then back to `/auth/callback`,
 * which exchanges the code for a session and redirects to `next`.
 *
 * Inside the native app, this uses Google's own native sign-in (Android
 * Credential Manager, via `@capgo/capacitor-social-login`) instead — the
 * account picker renders directly in the app, no browser tab involved. Two
 * earlier implementations routed Google's OAuth consent screen through a
 * Chrome Custom Tab redirecting back into the app — once via a custom URL
 * scheme, once via a verified Android App Link. Both were confirmed
 * correctly configured at the OS level (deep link routing, domain
 * verification, Custom Tabs external-handoff settings all checked out), but
 * the flow still silently hung on Google's own account-chooser page after
 * every real attempt, with no error — Google appears to treat that
 * app-embedded-browser context differently from a plain browser tab. Native
 * sign-in sidesteps the browser entirely, so that failure mode doesn't
 * apply here.
 *
 * Returns an error message if the flow couldn't even start (or complete, for
 * the native path — success there resolves by navigating to `next` itself,
 * since there's no browser redirect to do it for us).
 */
export async function signInWithGoogle(next: string): Promise<string | null> {
  if (isNativeApp()) {
    return signInWithGoogleNative(next);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    return error?.message ?? null;
  } catch {
    return "Supabase ainda não foi configurado nesta instância.";
  }
}

async function signInWithGoogleNative(next: string): Promise<string | null> {
  try {
    await ensureSocialLoginInitialized();

    // Google gets the hash, Supabase gets the raw value and checks it hashes
    // to what's embedded in the ID token — mitigates replay attacks.
    const rawNonce = randomNonce();
    const hashedNonce = await sha256Hex(rawNonce);

    const { result } = await SocialLogin.login({
      provider: "google",
      options: { nonce: hashedNonce },
    });

    if (result.responseType !== "online" || !result.idToken) {
      return "Não foi possível obter as informações da sua conta Google.";
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: result.idToken,
      nonce: rawNonce,
    });
    if (error) return error.message;

    window.location.href = next;
    return null;
  } catch {
    return "Não foi possível concluir o login com Google.";
  }
}
