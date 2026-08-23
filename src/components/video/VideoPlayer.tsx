import { Play } from "lucide-react";
import { useState } from "react";
import type { Video } from "@/lib/data";
import { embedUrl, fallbackThumbnail } from "@/lib/video-utils";

/**
 * The player iframe / <video> element is only mounted after the visitor
 * presses play, so the library and detail pages stay fast.
 */
export function VideoPlayer({ video, onPlay }: { video: Video; onPlay?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const thumb = fallbackThumbnail(video);
  const embed = embedUrl(video);

  const start = () => {
    setPlaying(true);
    onPlay?.();
  };

  if (!playing) {
    return (
      <button
        type="button"
        onClick={start}
        aria-label={`Play “${video.title}”`}
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-navy shadow-lift"
      >
        {thumb ? (
          <img src={thumb} alt="" className="size-full object-cover opacity-90" />
        ) : (
          <span className="gradient-placeholder block size-full" aria-hidden />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-brass text-accent-foreground shadow-lift transition-transform group-hover:scale-105">
            <Play className="size-8 translate-x-0.5" />
          </span>
        </span>
      </button>
    );
  }

  if (video.source_type === "upload") {
    return (
      <video
        controls
        autoPlay
        playsInline
        poster={thumb ?? undefined}
        className="aspect-video w-full rounded-2xl bg-navy shadow-lift"
      >
        <source src={video.source_url} />
        {/* Captions slot — attach a .vtt track here once captions are available */}
        <track kind="captions" label="English captions" srcLang="en" />
        Your browser does not support embedded video.
      </video>
    );
  }

  if (!embed) {
    return (
      <div className="surface-card flex aspect-video w-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        This video link could not be recognized. Check the source URL in the admin.
      </div>
    );
  }

  return (
    <iframe
      src={embed}
      title={video.title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      className="aspect-video w-full rounded-2xl border-0 bg-navy shadow-lift"
    />
  );
}
