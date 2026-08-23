import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Video } from "@/lib/data";
import { fallbackThumbnail, formatDuration, relativeDate } from "@/lib/video-utils";
import { cn } from "@/lib/utils";

export function VideoThumb({ video, className }: { video: Video; className?: string }) {
  const thumb = fallbackThumbnail(video);
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-xl bg-navy", className)}>
      {thumb ? (
        <img
          src={thumb}
          alt={`Thumbnail for “${video.title}”`}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      ) : (
        <div className="gradient-placeholder size-full" aria-hidden />
      )}
      <div className="absolute inset-0 bg-navy/10 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="flex size-12 items-center justify-center rounded-full bg-brass text-accent-foreground shadow-lift">
          <Play className="size-5 translate-x-px" />
        </span>
      </span>
      <span className="absolute bottom-2 right-2 rounded-md bg-navy/85 px-1.5 py-0.5 text-[0.7rem] font-medium text-primary-foreground">
        {formatDuration(video.duration_seconds)}
      </span>
    </div>
  );
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      to="/videos/$slug"
      params={{ slug: video.slug }}
      className="group surface-card block overflow-hidden p-3 transition-shadow hover:shadow-lift"
    >
      <VideoThumb video={video} />
      <div className="space-y-2 px-1 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-semibold text-secondary-foreground">
            {video.category}
          </span>
          {video.is_placeholder ? (
            <span className="rounded-full border border-dashed border-brass/60 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-accent-foreground">
              Placeholder
            </span>
          ) : null}
        </div>
        <h3 className="line-clamp-2-title font-display text-base font-semibold leading-snug">{video.title}</h3>
        <p className="text-xs text-muted-foreground">
          {relativeDate(video.published_at)} · {video.view_count.toLocaleString()} views
        </p>
      </div>
    </Link>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="surface-card p-3">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-2 px-1 py-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
