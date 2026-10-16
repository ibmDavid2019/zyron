import { registerPlugin } from "@capacitor/core";

export interface WriteMediaOptions {
  /** Base64-encoded file bytes (no `data:` prefix). */
  base64: string;
  fileName: string;
  mimeType: string;
}

export interface WriteMediaResult {
  /** A `content://` URI via the app's FileProvider — safe to hand to shareMedia/saveToGallery, never a raw file path. */
  contentUri: string;
}

export interface ShareMediaOptions {
  contentUri: string;
  mimeType: string;
  text?: string;
  /** Android package id to target directly (e.g. "com.whatsapp"). Omit for the generic Android share sheet. */
  targetPackage?: string;
}

export interface SaveToGalleryOptions {
  contentUri: string;
  kind: "photo" | "video";
}

/**
 * First hand-written native Capacitor plugin in this project (everything
 * else so far — background GPS, Google sign-in — comes from third-party
 * plugins). Backs "Compartilhar"/"Salvar no dispositivo" with real Android
 * mechanisms: Intent.ACTION_SEND (+ setPackage for per-app targeting, with
 * automatic fallback to the system chooser when a targeted app isn't
 * installed) and MediaStore for the gallery save — never a raw file path,
 * always a content:// URI through the FileProvider already declared in
 * AndroidManifest.xml. See android/app/src/main/java/app/zyron/fitness/ZyronMediaPlugin.kt.
 */
export interface ZyronMediaPlugin {
  /** Writes base64 bytes (e.g. a canvas export) to app cache and returns a shareable content:// URI. */
  writeMedia(options: WriteMediaOptions): Promise<WriteMediaResult>;
  /** Opens Android's real share flow — a specific app via targetPackage, or the generic chooser ("Mais aplicativos") when omitted. Falls back to the chooser if the targeted app isn't installed. */
  shareMedia(options: ShareMediaOptions): Promise<{ opened: boolean }>;
  /** Saves into the real device gallery (Pictures/ZYRON or Movies/ZYRON) via MediaStore. */
  saveToGallery(options: SaveToGalleryOptions): Promise<{ savedUri: string }>;
  /** Opens the system video picker (gallery). Rejects with "cancelled" if the user backs out. */
  pickVideo(): Promise<{ videoUri: string }>;
  /** Opens the system camera app to record a video. Rejects with "cancelled" if the user backs out. */
  captureVideo(): Promise<{ videoUri: string }>;
}

export const ZyronMedia = registerPlugin<ZyronMediaPlugin>("ZyronMedia");
