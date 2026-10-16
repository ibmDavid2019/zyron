"use client";

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { toast } from "sonner";
import { ZyronMedia } from "@/lib/native-media-plugin";

/**
 * Opens the real native photo picker (gallery or camera capture, via the
 * system prompt) using the official Capacitor Camera plugin — it also has a
 * working browser fallback (a plain file input) so this works identically
 * when the app is opened as a website, not just inside the Android APK.
 */
export async function pickActivityPhoto(): Promise<File | null> {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      quality: 90,
      promptLabelHeader: "Foto da atividade",
      promptLabelPhoto: "Escolher da galeria",
      promptLabelPicture: "Tirar foto",
    });
    if (!photo.webPath) return null;

    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    return new File([blob], `activity-photo.${photo.format ?? "jpg"}`, { type: blob.type || "image/jpeg" });
  } catch (error) {
    // User cancelling the picker also throws — only surface real failures.
    const message = error instanceof Error ? error.message : String(error);
    if (!/cancel/i.test(message)) {
      toast.error(`Não foi possível abrir a câmera/galeria: ${message}`);
    }
    return null;
  }
}

/**
 * Video pick/capture — native-only (no web fallback), since the whole
 * video-overlay pipeline downstream (ZyronVideoPlugin.kt, Media3
 * Transformer) is native Android code with nothing equivalent in a browser.
 */
export async function pickActivityVideo(source: "gallery" | "camera"): Promise<string | null> {
  try {
    const result = source === "gallery" ? await ZyronMedia.pickVideo() : await ZyronMedia.captureVideo();
    return result.videoUri;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/cancel/i.test(message)) {
      toast.error(`Não foi possível abrir a câmera/galeria de vídeos: ${message}`);
    }
    return null;
  }
}
