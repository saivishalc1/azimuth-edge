import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { assignToPlaylist, createVideo, lookupOEmbed, uploadToBucket } from "@/lib/admin";
import type { Category, Playlist } from "@/lib/data";
import { slugify } from "@/lib/video-utils";
import { cn } from "@/lib/utils";

type Mode = "link" | "upload";

export function AddVideoForm({
  categories,
  playlists,
  onCreateCategory,
}: {
  categories: Category[];
  playlists: Playlist[];
  onCreateCategory: (name: string) => void;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("link");
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0]?.name ?? "Lessons",
    tags: "",
    source_url: "",
    thumbnail_url: "",
    duration_seconds: 0,
    published_at: new Date().toISOString().slice(0, 10),
    is_featured: false,
    status: "published" as "draft" | "published",
    source_type: "youtube" as "youtube" | "vimeo" | "upload",
    playlist_id: "",
  });

  const lookup = useMutation({
    mutationFn: () => lookupOEmbed(form.source_url),
    onSuccess: (data) => {
      if (!data) {
        toast.error("Paste a YouTube or Vimeo link.");
        return;
      }
      setForm((p) => ({
        ...p,
        title: p.title || data.title,
        thumbnail_url: data.thumbnail_url ?? p.thumbnail_url,
        duration_seconds: data.duration_seconds || p.duration_seconds,
        source_type: data.source_type,
      }));
      toast.success("Details fetched from the link");
    },
    onError: () => toast.error("Couldn't read that link"),
  });

  const save = useMutation({
    mutationFn: async () => {
      const created = await createVideo({
        title: form.title,
        slug: slugify(form.title) || `video-${Date.now()}`,
        description: form.description || null,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        source_type: mode === "upload" ? "upload" : form.source_type,
        source_url: form.source_url,
        thumbnail_url: form.thumbnail_url || null,
        duration_seconds: Number(form.duration_seconds) || 0,
        published_at: new Date(form.published_at).toISOString(),
        is_featured: form.is_featured,
        status: form.status,
        is_placeholder: false,
      });
      if (form.playlist_id) await assignToPlaylist(form.playlist_id, created.id, 999);
      return created;
    },
    onSuccess: () => {
      toast.success("Video saved");
      void qc.invalidateQueries();
      setForm((p) => ({ ...p, title: "", description: "", tags: "", source_url: "", thumbnail_url: "" }));
      setProgress(0);
    },
    onError: (e: Error) => toast.error(e.message || "Could not save the video"),
  });

  const handleFile = async (file: File) => {
    setPending(true);
    try {
      const url = await uploadToBucket("videos", file, setProgress);
      setForm((p) => ({ ...p, source_url: url, title: p.title || file.name.replace(/\.[^.]+$/, "") }));
      toast.success("Video uploaded");
    } catch (e) {
      toast.error((e as Error).message || "Upload failed");
    } finally {
      setPending(false);
    }
  };

  const handleThumb = async (file: File) => {
    try {
      const url = await uploadToBucket("thumbnails", file, setThumbProgress);
      setForm((p) => ({ ...p, thumbnail_url: url }));
      toast.success("Thumbnail uploaded");
    } catch (e) {
      toast.error((e as Error).message || "Thumbnail upload failed");
    }
  };

  return (
    <div className="surface-card p-6">
      <div className="flex gap-2">
        {(["link", "upload"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold",
              mode === m ? "border-brass bg-brass text-accent-foreground" : "border-border text-muted-foreground",
            )}
          >
            {m === "link" ? <Link2 className="size-4" /> : <Upload className="size-4" />}
            {m === "link" ? "Paste a link" : "Upload a file"}
          </button>
        ))}
      </div>

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {mode === "link" ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="source">YouTube or Vimeo URL</Label>
            <div className="flex gap-2">
              <Input
                id="source"
                required
                value={form.source_url}
                onChange={(e) => setForm((p) => ({ ...p, source_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=…"
              />
              <Button type="button" variant="navy" onClick={() => lookup.mutate()} disabled={lookup.isPending}>
                {lookup.isPending ? <Loader2 className="size-4 animate-spin" /> : "Fetch"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 md:col-span-2">
            <Label>Video file (MP4 or MOV)</Label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void handleFile(file);
              }}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 text-center"
            >
              <Upload className="size-6 text-brass" />
              <p className="text-sm text-muted-foreground">Drag and drop a file here, or</p>
              <Button type="button" variant="goldOutline" size="sm" onClick={() => fileRef.current?.click()}>
                Choose file
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="video/mp4,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              {pending || progress > 0 ? <Progress value={progress} className="mt-2 w-full" /> : null}
              {form.source_url && mode === "upload" ? (
                <p className="text-xs text-muted-foreground">Uploaded and linked.</p>
              ) : null}
            </div>
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="h-9"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (!newCategory.trim()) return;
                onCreateCategory(newCategory.trim());
                setNewCategory("");
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            value={form.duration_seconds}
            onChange={(e) => setForm((p) => ({ ...p, duration_seconds: Number(e.target.value) }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="published">Publish date</Label>
          <Input
            id="published"
            type="date"
            value={form.published_at}
            onChange={(e) => setForm((p) => ({ ...p, published_at: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="playlist">Playlist</Label>
          <select
            id="playlist"
            value={form.playlist_id}
            onChange={(e) => setForm((p) => ({ ...p, playlist_id: e.target.value }))}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">None</option>
            {playlists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "draft" | "published" }))}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="thumb">Thumbnail</Label>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              id="thumb"
              value={form.thumbnail_url}
              onChange={(e) => setForm((p) => ({ ...p, thumbnail_url: e.target.value }))}
              placeholder="Thumbnail URL"
              className="flex-1"
            />
            <label className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm">
              Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleThumb(file);
                }}
              />
            </label>
          </div>
          {thumbProgress > 0 && thumbProgress < 100 ? <Progress value={thumbProgress} /> : null}
        </div>

        <div className="flex items-center gap-3 md:col-span-2">
          <Switch
            id="featured"
            checked={form.is_featured}
            onCheckedChange={(v) => setForm((p) => ({ ...p, is_featured: v }))}
          />
          <Label htmlFor="featured">Feature this video on the home page and library header</Label>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" variant="gold" size="lg" disabled={save.isPending || !form.source_url}>
            {save.isPending ? "Saving…" : "Save video"}
          </Button>
        </div>
      </form>
    </div>
  );
}
