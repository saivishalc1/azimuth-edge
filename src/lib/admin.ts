import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { slugify } from "./video-utils";

export type VideoInsert = Database["public"]["Tables"]["videos"]["Insert"];
export type VideoUpdate = Database["public"]["Tables"]["videos"]["Update"];

const SIGNED_URL_TTL = 315_360_000; // ~10 years

export async function isAdmin(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function fetchAllVideos() {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchLeads() {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createVideo(input: VideoInsert) {
  const payload = { ...input, slug: input.slug || slugify(input.title) };
  const { data, error } = await supabase.from("videos").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateVideo(id: string, patch: VideoUpdate) {
  const { error } = await supabase.from("videos").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteVideo(id: string) {
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderVideos(ordered: { id: string; sort_order: number }[]) {
  for (const row of ordered) {
    const { error } = await supabase.from("videos").update({ sort_order: row.sort_order }).eq("id", row.id);
    if (error) throw error;
  }
}

export async function createCategory(name: string) {
  const { error } = await supabase.from("categories").insert({ name, slug: slugify(name) });
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function createPlaylist(title: string, description: string) {
  const { error } = await supabase
    .from("playlists")
    .insert({ title, slug: slugify(title), description: description || null });
  if (error) throw error;
}

export async function deletePlaylist(id: string) {
  const { error } = await supabase.from("playlists").delete().eq("id", id);
  if (error) throw error;
}

export async function assignToPlaylist(playlistId: string, videoId: string, position: number) {
  const { error } = await supabase
    .from("playlist_videos")
    .upsert({ playlist_id: playlistId, video_id: videoId, position }, { onConflict: "playlist_id,video_id" });
  if (error) throw error;
}

/** oEmbed lookup so pasting a link prefills title + thumbnail. */
export async function lookupOEmbed(url: string): Promise<{
  title: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  source_type: "youtube" | "vimeo";
} | null> {
  const isYouTube = /youtu\.?be/.test(url);
  const isVimeo = /vimeo\.com/.test(url);
  if (!isYouTube && !isVimeo) return null;

  const endpoint = isYouTube
    ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
    : `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("Could not read that link");
  const json = (await res.json()) as { title?: string; thumbnail_url?: string; duration?: number };
  return {
    title: json.title ?? "",
    thumbnail_url: json.thumbnail_url ?? null,
    duration_seconds: json.duration ?? 0,
    source_type: isYouTube ? "youtube" : "vimeo",
  };
}

/** Upload with real progress via XHR, then return a long-lived signed URL. */
export async function uploadToBucket(
  bucket: "videos" | "thumbnails",
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("You need to be signed in to upload.");

  const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.name.split(".").pop()}`;
  const base = import.meta.env["VITE_SUPABASE_URL"];

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(xhr.responseText)));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data) throw error ?? new Error("Could not create a playback URL");
  return data.signedUrl;
}
