import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPublishedVideos, fetchVideoBySlug, recordVideoPlay } from "@/lib/data";
import { formatDuration, markWatched, relativeDate } from "@/lib/video-utils";

export const Route = createFileRoute("/videos/$slug")({
  head: () => ({
    meta: [
      { title: "Watch | Azimuth Real Estate Video Library" },
      {
        name: "description",
        content: "Watch real estate lessons, market updates, and property tours from John Khellah, MBA.",
      },
      { property: "og:title", content: "Azimuth Real Estate Video Library" },
      {
        property: "og:description",
        content: "Real estate video lessons and market updates from Northern New Jersey.",
      },
    ],
  }),
  component: VideoDetail,
});

function VideoDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const video = useQuery({ queryKey: ["video", slug], queryFn: () => fetchVideoBySlug(slug) });
  const all = useQuery({
    queryKey: ["videos", "all-newest"],
    queryFn: () => fetchPublishedVideos({ sort: "newest" }),
  });

  if (video.isLoading) {
    return (
      <div className="container-page py-16">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="mt-8 h-8 w-2/3" />
        <Skeleton className="mt-4 h-4 w-full" />
      </div>
    );
  }

  if (video.isError) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="heading-lg">This video couldn't be loaded</h1>
        <Button asChild variant="gold" className="mt-6">
          <Link to="/videos">Back to the library</Link>
        </Button>
      </div>
    );
  }

  const current = video.data;
  if (!current) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="heading-lg">Video not found</h1>
        <p className="mt-3 text-muted-foreground">It may have been unpublished or the link changed.</p>
        <Button asChild variant="gold" className="mt-6">
          <Link to="/videos">Back to the library</Link>
        </Button>
      </div>
    );
  }

  const list = all.data ?? [];
  const index = list.findIndex((v) => v.id === current.id);
  const prev = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;
  const related = list.filter((v) => v.category === current.category && v.id !== current.id).slice(0, 3);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const description = current.description ?? "";
  const isLong = description.length > 260;

  return (
    <div className="container-page py-10 lg:py-14">
      <Link to="/videos" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" /> Video Library
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1.55fr_0.45fr]">
        <div>
          <VideoPlayer
            video={current}
            onPlay={() => {
              markWatched(current.slug);
              void recordVideoPlay(current.id).catch(() => undefined);
            }}
          />

          <div className="mt-7 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
              {current.category}
            </span>
            <span className="text-muted-foreground">
              {formatDuration(current.duration_seconds)} · {relativeDate(current.published_at)} ·{" "}
              {current.view_count.toLocaleString()} views
            </span>
            {current.is_placeholder ? (
              <span className="rounded-full border border-dashed border-brass/60 px-2 py-0.5 font-semibold uppercase tracking-wide text-accent-foreground">
                Placeholder video
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <h1 className="heading-lg max-w-3xl">{current.title}</h1>
            <Button variant="goldOutline" size="sm" onClick={share}>
              {copied ? <Check className="size-4" /> : <Share2 className="size-4" />} Share
            </Button>
          </div>

          {description ? (
            <div className="mt-6 max-w-3xl">
              <p className={isLong && !expanded ? "line-clamp-3 leading-relaxed text-muted-foreground" : "leading-relaxed text-muted-foreground"}>
                {description}
              </p>
              {isLong ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-2 text-sm font-semibold text-foreground underline decoration-brass decoration-2 underline-offset-4"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              ) : null}
            </div>
          ) : null}

          {current.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {current.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                  #{tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
            <Button
              variant="outline"
              disabled={!prev}
              onClick={() => prev && navigate({ to: "/videos/$slug", params: { slug: prev.slug } })}
            >
              <ArrowLeft className="size-4" /> Previous
            </Button>
            <Button
              variant="outline"
              disabled={!next}
              onClick={() => next && navigate({ to: "/videos/$slug", params: { slug: next.slug } })}
            >
              Next <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <aside>
          <h2 className="font-display text-lg font-semibold">Up next in {current.category}</h2>
          <div className="mt-5 space-y-5">
            {related.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other videos in this category yet.</p>
            ) : (
              related.map((video) => <VideoCard key={video.id} video={video} />)
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
