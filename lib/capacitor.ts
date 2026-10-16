import { Capacitor } from "@capacitor/core";

/** True only inside the compiled native app shell — false in any regular browser tab, even on the same deployed URL. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * A raw `content://`/`file://` URI from a native plugin (e.g. ZyronMedia's
 * pickVideo/captureVideo) can't be loaded directly as a WebView resource —
 * Capacitor.convertFileSrc() rewrites it into the special scheme the native
 * bridge intercepts and resolves back to the real file. Only needed for
 * putting a native URI into an <img>/<video> src; share/save calls that hand
 * the URI straight to a native plugin should keep using the raw value.
 */
export function toWebviewSrc(uri: string): string {
  return Capacitor.convertFileSrc(uri);
}
