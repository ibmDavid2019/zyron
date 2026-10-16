import { registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";

export interface CompositeVideoOptions {
  /** content:// or file:// URI of the source video, as returned by the native media picker. */
  videoUri: string;
  /** Base64-encoded PNG (with transparency) of the pre-rendered stats/route overlay — same layout logic as the photo path, drawn once client-side. */
  overlayBase64: string;
  outputFileName: string;
  trimStartMs?: number;
  /** Omit (or <= 0) to keep the clip through its natural end. */
  trimEndMs?: number;
}

export interface CompositeVideoResult {
  /** A content:// URI via FileProvider — ready for ZyronMedia.shareMedia/saveToGallery. */
  contentUri: string;
  /** Base64 JPEG of the first frame, for an instant preview while the user decides where to share. */
  thumbnailBase64?: string;
}

export interface CompositeProgressEvent {
  /** 0-100. */
  percent: number;
}

/**
 * Video-overlay compositing — burns the same stat/route overlay used for
 * photo sharing onto a real video clip via AndroidX Media3 Transformer,
 * keeping the video playing (never converted to a static image). See
 * android/app/src/main/java/app/zyron/fitness/ZyronVideoPlugin.kt.
 *
 * `isSupported()` should be checked before offering video sharing — Media3's
 * overlay/effect pipeline needs a real GPU path, only guaranteed from
 * Android 7 (API 24) onward, while this app's minSdk is 23. Devices below
 * that should fall back to photo-only sharing with a clear message, not a
 * silent failure.
 */
export interface ZyronVideoPlugin {
  isSupported(): Promise<{ supported: boolean }>;
  compositeVideo(options: CompositeVideoOptions): Promise<CompositeVideoResult>;
  addListener(
    eventName: "compositeProgress",
    listenerFunc: (event: CompositeProgressEvent) => void
  ): Promise<PluginListenerHandle>;
}

export const ZyronVideo = registerPlugin<ZyronVideoPlugin>("ZyronVideo");
