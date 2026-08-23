import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Video = Database["public"]["Tables"]["videos"]["Row"];
export type Playlist = Database["public"]["Tables"]["playlists"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];

export type SortKey = "newest" | "oldest" | "popular";

export const PAGE_SIZE = 12;

export async function fetchPublishedVideos(opts?: {
  category?: string | null;
  search?: string | null;
  sort?: SortKey;
  limit?: number;
}) {
  let query = supabase.from("videos").select("*").eq("status", "published");

  if (opts?.category && opts.category !== "All") {
    query = query.eq("category", opts.category);
  }
  const search = opts?.search?.trim();
  if (search) {
    const like = `%${search}%`;
    query = query.or(`title.ilike.${like},description.ilike.${like},tags.cs.{${search}}`);
  }
  if (opts?.sort === "oldest") query = query.order("published_at", { ascending: true });
  else if (opts?.sort === "popular") query = query.order("view_count", { ascending: false });
  else query = query.order("published_at", { ascending: false });

  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchFeaturedVideos(limit = 4) {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchVideoBySlug(slug: string) {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPlaylists() {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPlaylistWithVideos(slug: string) {
  const { data: playlist, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!playlist) return null;

  const { data: rows, error: joinError } = await supabase
    .from("playlist_videos")
    .select("position, videos(*)")
    .eq("playlist_id", playlist.id)
    .order("position", { ascending: true });
  if (joinError) throw joinError;

  const videos = (rows ?? [])
    .map((row) => row.videos as Video | null)
    .filter((v): v is Video => Boolean(v) && v!.status === "published");

  return { playlist, videos };
}

export async function fetchPlaylistCounts() {
  const { data, error } = await supabase.from("playlist_videos").select("playlist_id");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.playlist_id] = (counts[row.playlist_id] ?? 0) + 1;
  return counts;
}

export async function fetchListings() {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function submitLead(lead: LeadInsert) {
  const { error } = await supabase.from("leads").insert(lead);
  if (error) throw error;
}

export async function recordVideoPlay(videoId: string) {
  await supabase.rpc("increment_video_views", { _video_id: videoId });
  await supabase.from("analytics_events").insert({ event_type: "video_play", video_id: videoId });
}

export async function recordPageView(path: string) {
  await supabase.from("analytics_events").insert({ event_type: "page_view", path });
}
