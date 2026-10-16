"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AtSign,
  Camera,
  Download,
  Globe2,
  ImageIcon,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { isNativeApp, toWebviewSrc } from "@/lib/capacitor";
import { ZyronMedia } from "@/lib/native-media-plugin";
import { ZyronVideo } from "@/lib/native-video-plugin";
import type { Activity } from "@/types/activity";
import {
  DEFAULT_LOGO_POSITION,
  DEFAULT_PHOTO_TRANSFORM,
  DEFAULT_ROUTE_STATE,
  DEFAULT_STAT_VISIBILITY,
  DEFAULT_STATS_POSITION,
  type OverlaySpec,
} from "@/types/share";
import { LayoutPicker } from "@/features/share/layout-picker";
import { OverlayControls } from "@/features/share/overlay-controls";
import { PhotoCanvas, type PhotoCanvasHandle, exportOverlayPngBase64 } from "@/features/share/photo-canvas";
import { VideoOverlayCanvas } from "@/features/share/video-overlay-canvas";
import { pickActivityPhoto, pickActivityVideo } from "@/features/share/media-picker-sheet";
import { VideoTrim } from "@/features/share/video-trim";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import { formatDistance, formatDuration } from "@/utils/format";

interface ShareTarget {
  id: string;
  label: string;
  pkg?: string;
  icon: React.ElementType;
  className: string;
}

const SHARE_TARGETS: ShareTarget[] = [
  { id: "instagram", label: "Instagram", pkg: "com.instagram.android", icon: Camera, className: "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white" },
  { id: "whatsapp", label: "WhatsApp", pkg: "com.whatsapp", icon: MessageCircle, className: "bg-[#25D366] text-white" },
  { id: "facebook", label: "Facebook", pkg: "com.facebook.katana", icon: Users, className: "bg-[#1877F2] text-white" },
  { id: "x", label: "X", pkg: "com.twitter.android", icon: AtSign, className: "bg-black text-white" },
  { id: "tiktok", label: "TikTok", pkg: "com.zhiliaoapp.musically", icon: Music2, className: "bg-neutral-900 text-white" },
  { id: "more", label: "Mais aplicativos", icon: MoreHorizontal, className: "bg-muted text-foreground" },
];

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

type Step = "choose" | "edit-photo" | "edit-video" | "share";

interface ReadyMedia {
  kind: "photo" | "video";
  contentUri: string;
  mimeType: string;
}

export function ShareEditor({ activity }: { activity: Activity }) {
  const canvasHandleRef = useRef<PhotoCanvasHandle>(null);
  const [step, setStep] = useState<Step>("choose");
  const [videoSupported, setVideoSupported] = useState(false);

  // Photo flow state
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [spec, setSpec] = useState<OverlaySpec>({
    layout: "minimal",
    stats: DEFAULT_STAT_VISIBILITY,
    statsPosition: DEFAULT_STATS_POSITION,
    route: DEFAULT_ROUTE_STATE,
    logoPosition: DEFAULT_LOGO_POSITION,
    photo: DEFAULT_PHOTO_TRANSFORM,
  });
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const exportedPreviewUrl = useMemo(() => (exportedBlob ? URL.createObjectURL(exportedBlob) : null), [exportedBlob]);
  useEffect(() => {
    return () => {
      if (exportedPreviewUrl) URL.revokeObjectURL(exportedPreviewUrl);
    };
  }, [exportedPreviewUrl]);

  // Video flow state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoDurationMs, setVideoDurationMs] = useState(0);
  const [trimStartMs, setTrimStartMs] = useState(0);
  const [trimEndMs, setTrimEndMs] = useState(0);
  const [compositing, setCompositing] = useState(false);
  const [compositeProgress, setCompositeProgress] = useState(0);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const [busy, setBusy] = useState(false);
  const [readyMedia, setReadyMedia] = useState<ReadyMedia | null>(null);
  const [shareInfo, setShareInfo] = useState<{ shareToken: string; publicUrl: string } | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [dispatching, setDispatching] = useState<string | null>(null);

  useEffect(() => {
    if (!isNativeApp()) return;
    ZyronVideo.isSupported()
      .then((r) => setVideoSupported(r.supported))
      .catch((error) => {
        console.error("ZyronVideo.isSupported failed", error);
        setVideoSupported(false);
      });
  }, []);

  useEffect(() => {
    if (!compositing) return;
    let handle: { remove: () => void } | null = null;
    ZyronVideo.addListener("compositeProgress", (event) => setCompositeProgress(event.percent)).then((h) => {
      handle = h;
    });
    return () => {
      handle?.remove();
    };
  }, [compositing]);

  async function startPhotoFlow() {
    setStep("edit-photo");
    const file = await pickActivityPhoto();
    if (!file) {
      setStep("choose");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setPhotoImage(img);
    img.onerror = () => {
      toast.error("Não foi possível carregar a foto.");
      setStep("choose");
    };
    img.src = url;
  }

  async function startVideoFlow(source: "gallery" | "camera") {
    setStep("edit-video");
    const uri = await pickActivityVideo(source);
    if (!uri) {
      setStep("choose");
      return;
    }
    setVideoUri(uri);
  }

  function handleVideoMetadataLoaded() {
    const video = videoRef.current;
    if (!video) return;
    const durationMs = Math.round(video.duration * 1000);
    setVideoDurationMs(durationMs);
    setTrimStartMs(0);
    setTrimEndMs(durationMs);
  }

  async function handlePhotoExport() {
    if (!canvasHandleRef.current) return;
    setBusy(true);
    try {
      const blob = await canvasHandleRef.current.exportBlob();
      if (!blob) {
        toast.error("Não foi possível gerar a imagem.");
        return;
      }
      setExportedBlob(blob);
      const base64 = await blobToBase64(blob);

      let contentUri: string;
      if (isNativeApp()) {
        const written = await ZyronMedia.writeMedia({ base64, fileName: `zyron-${activity.id}.png`, mimeType: "image/png" });
        contentUri = written.contentUri;
      } else {
        contentUri = URL.createObjectURL(blob);
      }

      await uploadAndFinish(blob, { kind: "photo", contentUri, mimeType: "image/png" });
    } catch (error) {
      toast.error("Não foi possível gerar a imagem. Tente de novo.");
      console.error("photo export failed", error);
    } finally {
      setBusy(false);
    }
  }

  async function handleVideoExport() {
    if (!videoUri) return;
    setBusy(true);
    setCompositing(true);
    setCompositeProgress(0);
    try {
      const overlayBase64 = await exportOverlayPngBase64(activity, spec);
      const result = await ZyronVideo.compositeVideo({
        videoUri,
        overlayBase64,
        outputFileName: `zyron-${activity.id}.mp4`,
        trimStartMs,
        trimEndMs,
      });
      if (result.thumbnailBase64) setVideoThumbnail(result.thumbnailBase64);
      await uploadAndFinish(null, { kind: "video", contentUri: result.contentUri, mimeType: "video/mp4" });
    } catch (error) {
      toast.error("Não foi possível processar o vídeo. Tente de novo.");
      console.error("video composite failed", error);
    } finally {
      setBusy(false);
      setCompositing(false);
    }
  }

  async function uploadAndFinish(photoBlob: Blob | null, media: ReadyMedia) {
    setReadyMedia(media);

    // Photo path gets a real public share link (uploaded to Storage + OG page).
    // Video isn't uploaded for public preview in this pass — sharing/saving
    // still works fully, it just doesn't get a /s/[token] page yet.
    if (media.kind === "photo" && photoBlob) {
      try {
        const config = ACTIVITY_TYPE_CONFIG[activity.type];
        const snapshot = {
          type: activity.type,
          typeLabel: config.label,
          title: activity.title,
          distanceKm: activity.distanceKm,
          distanceLabel: formatDistance(activity.distanceKm),
          durationSeconds: activity.durationSeconds,
          durationLabel: formatDuration(activity.durationSeconds),
          elevationM: activity.elevationM,
          calories: activity.calories,
          date: activity.date,
          city: activity.city ?? null,
          path: activity.path ?? [],
        };

        const formData = new FormData();
        formData.append("file", photoBlob, "share.png");
        formData.append("clientActivityId", activity.id);
        formData.append("layout", spec.layout);
        formData.append("snapshot", JSON.stringify(snapshot));
        formData.append("overlaySpec", JSON.stringify(spec));

        const response = await fetch("/api/share/upload", { method: "POST", body: formData });
        const data = await response.json();
        if (response.ok) {
          setShareInfo({ shareToken: data.shareToken, publicUrl: data.publicUrl });
        }
      } catch (error) {
        console.error("share upload failed (non-fatal — sharing/saving still works)", error);
      }
    }

    setStep("share");
  }

  async function togglePublic(checked: boolean) {
    if (!shareInfo) return;
    setSavingVisibility(true);
    try {
      const response = await fetch("/api/share/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareToken: shareInfo.shareToken, isPublic: checked }),
      });
      if (!response.ok) throw new Error("failed");
      setIsPublic(checked);
      toast.success(checked ? "Atividade agora é pública." : "Atividade voltou a ser privada.");
    } catch {
      toast.error("Não foi possível atualizar a privacidade.");
    } finally {
      setSavingVisibility(false);
    }
  }

  async function dispatchShare(target: ShareTarget) {
    if (!readyMedia) return;
    setDispatching(target.id);
    try {
      if (isNativeApp()) {
        await ZyronMedia.shareMedia({
          contentUri: readyMedia.contentUri,
          mimeType: readyMedia.mimeType,
          text: shareInfo?.publicUrl,
          targetPackage: target.pkg,
        });
      } else if (navigator.share && exportedBlob) {
        const file = new File([exportedBlob], "zyron-activity.png", { type: "image/png" });
        await navigator.share({ files: [file], text: shareInfo?.publicUrl, title: "ZYRON" });
      } else {
        await navigator.clipboard.writeText(shareInfo?.publicUrl ?? "");
        toast.success("Link copiado — cole no app que quiser usar.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/cancel/i.test(message)) {
        toast.error("Não foi possível abrir o compartilhamento.");
      }
    } finally {
      setDispatching(null);
    }
  }

  async function handleSaveToDevice() {
    if (!readyMedia) return;
    setDispatching("save");
    try {
      if (isNativeApp()) {
        await ZyronMedia.saveToGallery({ contentUri: readyMedia.contentUri, kind: readyMedia.kind });
        toast.success("Salvo na galeria!");
      } else if (exportedBlob) {
        const url = URL.createObjectURL(exportedBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `zyron-${activity.id}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem baixada!");
      }
    } catch {
      toast.error("Não foi possível salvar.");
    } finally {
      setDispatching(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href={`/activity/${activity.id}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-lg font-bold tracking-tight">
          {step === "share" ? "Pronto para compartilhar" : "Compartilhar atividade"}
        </h1>
      </div>

      {step === "choose" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
          <p className="text-sm text-muted-foreground">Escolha uma foto ou vídeo da atividade</p>
          <div className="grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={startPhotoFlow}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted"
            >
              <ImageIcon className="size-7 text-brand" />
              <span className="text-sm font-medium">Foto</span>
            </button>
            <button
              type="button"
              onClick={() => (videoSupported ? startVideoFlow("gallery") : toast.info("Vídeo não é suportado neste aparelho."))}
              disabled={!videoSupported}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Video className="size-7 text-brand" />
              <span className="text-sm font-medium">Vídeo</span>
            </button>
          </div>
          {videoSupported && (
            <Button variant="ghost" size="sm" onClick={() => startVideoFlow("camera")}>
              Ou gravar um vídeo agora
            </Button>
          )}
        </div>
      )}

      {step === "edit-photo" && !photoImage && (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {step === "edit-photo" && photoImage && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="mx-auto w-full max-w-70 overflow-hidden rounded-2xl">
            <PhotoCanvas ref={canvasHandleRef} activity={activity} photo={photoImage} spec={spec} onSpecChange={setSpec} />
          </div>
          <LayoutPicker value={spec.layout} onChange={(layout) => setSpec((prev) => ({ ...prev, layout }))} />
          <OverlayControls activityType={activity.type} spec={spec} onSpecChange={setSpec} />
          <Button size="lg" className="mt-auto w-full" onClick={handlePhotoExport} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Continuar
          </Button>
        </div>
      )}

      {step === "edit-video" && !videoUri && (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {step === "edit-video" && videoUri && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="relative mx-auto w-full max-w-70 overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              src={toWebviewSrc(videoUri)}
              loop
              muted
              playsInline
              className="aspect-9/16 w-full"
              onLoadedMetadata={handleVideoMetadataLoaded}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
            />
            <VideoOverlayCanvas activity={activity} spec={spec} onSpecChange={setSpec} />
            <button
              type="button"
              onClick={() => (videoPlaying ? videoRef.current?.pause() : videoRef.current?.play())}
              aria-label={videoPlaying ? "Pausar" : "Reproduzir"}
              className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
            >
              {videoPlaying ? <Pause className="size-4.5" /> : <Play className="size-4.5" />}
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">Arraste as estatísticas, a rota ou a logo ZYRON para reposicioná-las sobre o vídeo.</p>

          <LayoutPicker value={spec.layout} onChange={(layout) => setSpec((prev) => ({ ...prev, layout }))} />
          <OverlayControls activityType={activity.type} spec={spec} onSpecChange={setSpec} showPhotoControls={false} />

          {videoDurationMs > 0 && (
            <VideoTrim
              durationMs={videoDurationMs}
              trimStartMs={trimStartMs}
              trimEndMs={trimEndMs}
              onChange={(start, end) => {
                setTrimStartMs(start);
                setTrimEndMs(end);
              }}
            />
          )}

          {compositing ? (
            <div className="mt-auto space-y-2 rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">Processando vídeo... {compositeProgress}%</p>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-brand transition-all" style={{ width: `${compositeProgress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Pode fechar essa tela — avisamos quando terminar.</p>
            </div>
          ) : (
            <Button size="lg" className="mt-auto w-full" onClick={handleVideoExport} disabled={busy || videoDurationMs === 0}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Continuar
            </Button>
          )}
        </div>
      )}

      {step === "share" && readyMedia && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="mx-auto w-full max-w-60 overflow-hidden rounded-2xl border border-border">
            {readyMedia.kind === "photo" && exportedPreviewUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- local blob URL, not an optimizable remote image
              <img src={exportedPreviewUrl} alt="Prévia do compartilhamento" className="w-full" />
            )}
            {readyMedia.kind === "video" && videoThumbnail && (
              // eslint-disable-next-line @next/next/no-img-element -- base64 frame from the native plugin, not a remote image
              <img src={`data:image/jpeg;base64,${videoThumbnail}`} alt="Prévia do vídeo" className="w-full" />
            )}
          </div>

          {shareInfo && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Globe2 className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Atividade pública</p>
                  <p className="text-xs text-muted-foreground">Permite acesso pelo link</p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={togglePublic} disabled={savingVisibility} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {SHARE_TARGETS.map((target) => (
              <button
                key={target.id}
                type="button"
                onClick={() => dispatchShare(target)}
                disabled={dispatching !== null}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className={`flex size-14 items-center justify-center rounded-full ${target.className}`}>
                  {dispatching === target.id ? <Loader2 className="size-5 animate-spin" /> : <target.icon className="size-6" />}
                </span>
                <span className="text-xs text-muted-foreground">{target.label}</span>
              </button>
            ))}
          </div>

          <Button variant="outline" size="lg" className="w-full" onClick={handleSaveToDevice} disabled={dispatching !== null}>
            {dispatching === "save" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Salvar no dispositivo
          </Button>
        </div>
      )}
    </div>
  );
}
