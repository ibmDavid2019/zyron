"use client";

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface VideoTrimProps {
  durationMs: number;
  trimStartMs: number;
  trimEndMs: number;
  onChange: (start: number, end: number) => void;
}

/** Two plain range inputs rather than a custom dual-handle scrubber — fully native, accessible, and reliable across the WebView without extra pointer-drag math. */
export function VideoTrim({ durationMs, trimStartMs, trimEndMs, onChange }: VideoTrimProps) {
  const minGapMs = 1000;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-muted-foreground">Cortar trecho do vídeo</p>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Início</span>
          <span>{formatMs(trimStartMs)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={durationMs}
          step={100}
          value={trimStartMs}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), trimEndMs - minGapMs);
            onChange(Math.max(0, next), trimEndMs);
          }}
          className="w-full accent-brand"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Fim</span>
          <span>{formatMs(trimEndMs)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={durationMs}
          step={100}
          value={trimEndMs}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), trimStartMs + minGapMs);
            onChange(trimStartMs, Math.min(durationMs, next));
          }}
          className="w-full accent-brand"
        />
      </div>

      <p className="text-right text-xs font-medium text-brand">
        Duração final: {formatMs(Math.max(0, trimEndMs - trimStartMs))}
      </p>
    </div>
  );
}
