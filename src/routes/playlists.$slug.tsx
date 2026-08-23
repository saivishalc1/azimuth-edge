import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoThumb } from "@/components/video/VideoCard";
import { fetchPlaylistWithVideos } from "@/lib/data";
import { formatDuration, getWatched } from "@/lib/video-utils";

export const Route = createFileRoute("/playlists/$slug")({
  head: () => ({
    meta: [
      { title: "Video Series | Azimuth Real Estate Video Library" },
      {
        name: "description",
        content: "Watch an ordered real estate video series from John Khellah, MBA — start at part one and keep going.",
      },
      { property: "og:title", content: "Azimuth Real Estate video series" },
      { property: "og:description", content: "An ordered series of real estate lessons you can work through in order." },
    ],
  }),
  component: PlaylistPage,
});

function PlaylistPage() {
  const { slug } = Route.useParams();
  const [watched, setWatched] = useState<string[]>([]);
  useEffect(() => setWatched(getWatched()), []);

  const query = useQuery({ queryKey: ["playlist", slug], queryFn: () => fetchPlaylistWithVideos(slug) });

  if (query.isLoading) {
    return (
      <div className="container-page py-16 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="heading-lg">Series not found</h1>
        <Button asChild variant="gold" className="mt-6">
          <Link to="/videos">Back to the library</Link>
        </Button>
      </div>
    );
  }

  const { playlist, videos } = query.data;
  const nextUp = videos.find((v) => !watched.includes(v.slug)) ?? videos[0];

  return (
    <>
      <section className="gradient-navy text-primary-foreground">
        <div className="container-page py-16">
          <Link to="/videos" className="inline-flex items-center gap-2 text-sm text-primary-foreground/70">
            <ArrowLeft className="size-4" /> Video Library
          </Link>
          <p className="eyebrow mt-6">Series · {videos.length} parts</p>
          <h1 className="heading-xl mt-3 max-w-3xl text-primary-foreground">{playlist.title}</h1>
          {playlist.description ? (
            <p className="mt-5 max-w-2xl text-lg text-primary-foreground/75">{playlist.description}</p>
          ) : null}
          {nextUp ? (
            <Button asChild variant="gold" size="lg" className="mt-8">
              <Link to="/videos/$slug" params={{ slug: nextUp.slug }}>
                <Play className="size-4" />
                {watched.length > 0 ? "Continue watching" : "Start part 1"}
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="container-page space-y-4">
          {videos.length === 0 ? (
            <p className="surface-card p-10 text-center text-sm text-muted-foreground">
              No episodes have been added to this series yet.
            </p>
          ) : null}
          {videos.map((video, i) => {
            const isWatched = watched.includes(video.slug);
            return (
              <Link
                key={video.id}
                to="/videos/$slug"
                params={{ slug: video.slug }}
                className="surface-card group flex flex-col gap-5 p-4 transition-shadow hover:shadow-lift sm:flex-row sm:items-center"
              >
                <span className="w-full shrink-0 sm:w-56">
                  <VideoThumb video={video} />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brass">
                    Part {i + 1}
                    {isWatched ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <CheckCircle2 className="size-3.5" /> watched
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-2 block font-display text-lg font-semibold">{video.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {video.category} · {formatDuration(video.duration_seconds)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
