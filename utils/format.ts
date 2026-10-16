/** Formats kilometers as "5,2 km". */
export function formatDistance(km: number): string {
  return `${km.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} km`;
}

/** Formats a duration in seconds as "32:15" or "1:02:15". */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Formats a pace in seconds/km as "6:12/km". */
export function formatPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}/km`;
}

/** Formats a relative or absolute date in pt-BR, e.g. "24 de julho". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

/** Formats how long ago a date was, e.g. "há 2 horas", "há 3 dias". */
export function formatRelativeTime(date: Date, now = new Date()): string {
  const diffSeconds = Math.max(Math.round((now.getTime() - date.getTime()) / 1000), 0);

  if (diffSeconds < 60) return "agora mesmo";

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `há ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `há ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;

  return formatDate(date);
}
