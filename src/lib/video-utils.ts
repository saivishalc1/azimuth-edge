import type { Video } from "./data";

export function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export function relativeDate(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const day = 86_400_000;
  const days = Math.round(diff / day);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const w = Math.round(days / 7);
    return `${w} week${w > 1 ? "s" : ""} ago`;
  }
  if (days < 365) {
    const mo = Math.round(days / 30);
    return `${mo} month${mo > 1 ? "s" : ""} ago`;
  }
  const y = Math.round(days / 365);
  return `${y} year${y > 1 ? "s" : ""} ago`;
}

export function youtubeId(url: string) {
  const patterns = [/[?&]v=([\w-]{11})/, /youtu\.be\/([\w-]{11})/, /embed\/([\w-]{11})/, /shorts\/([\w-]{11})/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function vimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export function embedUrl(video: Pick<Video, "source_type" | "source_url">) {
  if (video.source_type === "youtube") {
    const id = youtubeId(video.source_url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
  }
  if (video.source_type === "vimeo") {
    const id = vimeoId(video.source_url);
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
  }
  return null;
}

export function fallbackThumbnail(video: Pick<Video, "source_type" | "source_url" | "thumbnail_url">) {
  if (video.thumbnail_url) return video.thumbnail_url;
  if (video.source_type === "youtube") {
    const id = youtubeId(video.source_url);
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

const WATCH_KEY = "azimuth:watched";

export function markWatched(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(WATCH_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(slug)) list.push(slug);
    window.localStorage.setItem(WATCH_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getWatched(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WATCH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
