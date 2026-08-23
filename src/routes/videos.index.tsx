import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ListVideo, Search, VideoOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { VideoCard, VideoCardSkeleton, VideoThumb } from "@/components/video/VideoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchCategories,
  fetchPlaylistCounts,
  fetchPlaylists,
  fetchPublishedVideos,
  PAGE_SIZE,
  type SortKey,
} from "@/lib/data";
import { formatDuration, relativeDate } from "@/lib/video-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/videos/")({
  head: () => ({
    meta: [
      { title: "Video Library | Real Estate Lessons & Market Updates" },
      {
        name: "description",
        content:
          "Watch John Khellah's real estate video library: Northern NJ market updates, multifamily investing, lessons for new agents, property tours, and Q&A. Free, no login.",
      },
      { property: "og:title", content: "Azimuth Video Library" },
      {
        property: "og:description",
        content: "Market updates, investing lessons, property tours, and Q&A from John Khellah, MBA.",
      },
    ],
  }),
  component: VideoLibrary,
});

const sorts: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "popular", label: "Most Popular" },
];

function VideoLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const playlists = useQuery({ queryKey: ["playlists"], queryFn: fetchPlaylists });
  const counts = useQuery({ queryKey: ["playlist-counts"], queryFn: fetchPlaylistCounts });

  const videos = useQuery({
    queryKey: ["videos", category, search, sort],
    queryFn: () => fetchPublishedVideos({ category, search, sort }),
  });

  const total = useQuery({
    queryKey: ["videos", "all-count"],
    queryFn: () => fetchPublishedVideos({ sort: "newest" }),
  });

  const featured = useMemo(
    () => total.data?.filter((v) => v.is_featured)[0] ?? null,
    [total.data],
  );

  const shown = videos.data?.slice(0, visible) ?? [];
  const hasMore = (videos.data?.length ?? 0) > visible;

  const resetPaging = () => setVisible(PAGE_SIZE);

  return (
    <>
      <section className="gradient-navy text-primary-foreground">
        <div className="container-page py-16">
          <p className="eyebrow">Video Library</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="heading-xl text-primary-foreground">Every video, in one place.</h1>
              <p className="mt-5 text-lg text-primary-foreground/75">
                Market updates, deal breakdowns, and lessons for new agents — free to watch, no account needed.
              </p>
            </div>
            <p className="font-display text-sm text-primary-foreground/70">
              {total.isLoading ? "Loading…" : `${total.data?.length ?? 0} videos published`}
            </p>
          </div>

          {featured ? (
            <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
              <Link
                to="/videos/$slug"
                params={{ slug: featured.slug }}
                className="group block"
                aria-label={`Watch ${featured.title}`}
              >
                <VideoThumb video={featured} className="rounded-2xl shadow-lift" />
              </Link>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-brass px-3 py-1 font-semibold text-accent-foreground">Featured</span>
                  <span className="rounded-full border border-primary-foreground/25 px-3 py-1">{featured.category}</span>
                  <span className="text-primary-foreground/60">
                    {formatDuration(featured.duration_seconds)} · {relativeDate(featured.published_at)}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold text-primary-foreground">{featured.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-primary-foreground/70">
                  {featured.description}
                </p>
                <Button asChild variant="gold" className="mt-6">
                  <Link to="/videos/$slug" params={{ slug: featured.slug }}>
                    Watch now
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
          {total.isLoading ? <Skeleton className="mt-12 aspect-video w-full rounded-2xl lg:w-2/3" /> : null}
        </div>
      </section>

      <div className="sticky top-18 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-page flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPaging();
                }}
                placeholder="Search titles, descriptions, and tags"
                aria-label="Search videos"
                className="h-11 pl-9"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              {sorts.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setSort(option.key);
                    resetPaging();
                  }}
                  aria-pressed={sort === option.key}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    sort === option.key ? "bg-navy text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Categories">
            {["All", ...(categories.data?.map((c) => c.name) ?? [])].map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={category === name}
                onClick={() => {
                  setCategory(name);
                  resetPaging();
                }}
                className={cn(
                  "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  category === name
                    ? "border-brass bg-brass text-accent-foreground"
                    : "border-border text-muted-foreground hover:border-brass/60 hover:text-foreground",
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {playlists.data && playlists.data.length > 0 ? (
        <section className="section pb-0">
          <div className="container-page">
            <div className="flex items-center gap-3">
              <ListVideo className="size-5 text-brass" />
              <h2 className="font-display text-xl font-semibold">Series & playlists</h2>
            </div>
            <div className="-mx-6 mt-6 flex gap-5 overflow-x-auto px-6 pb-4">
              {playlists.data.map((playlist) => (
                <Link
                  key={playlist.id}
                  to="/playlists/$slug"
                  params={{ slug: playlist.slug }}
                  className="surface-card group w-72 shrink-0 p-6 transition-shadow hover:shadow-lift"
                >
                  <span className="eyebrow">{counts.data?.[playlist.id] ?? 0} parts</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{playlist.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{playlist.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                    Open series <ArrowRight className="size-4 text-brass transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container-page">
          {videos.isError ? (
            <p className="surface-card p-8 text-sm text-destructive">
              The library couldn't be loaded. Please refresh and try again.
            </p>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.isLoading
              ? Array.from({ length: 6 }).map((_, i) => <VideoCardSkeleton key={i} />)
              : shown.map((video, i) => (
                  <Reveal key={video.id} delay={Math.min(i, 5) * 0.04}>
                    <VideoCard video={video} />
                  </Reveal>
                ))}
          </div>

          {!videos.isLoading && shown.length === 0 && !videos.isError ? (
            <div className="surface-card flex flex-col items-center gap-4 p-16 text-center">
              <VideoOff className="size-8 text-brass" />
              <h2 className="font-display text-xl font-semibold">No videos match that search</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try a different keyword or clear the filters to see the full library.
              </p>
              <Button
                variant="goldOutline"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  resetPaging();
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : null}

          {hasMore ? (
            <div className="mt-12 flex justify-center">
              <Button variant="navy" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more videos
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
