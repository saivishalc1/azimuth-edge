import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { ExternalLink, GripVertical, Inbox, LogOut, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddVideoForm } from "@/components/admin/AddVideoForm";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  createCategory,
  createPlaylist,
  deleteCategory,
  deletePlaylist,
  deleteVideo,
  fetchAllVideos,
  fetchLeads,
  isAdmin,
  reorderVideos,
  updateVideo,
} from "@/lib/admin";
import { fetchCategories, fetchPlaylists, type Video } from "@/lib/data";
import { fallbackThumbnail, relativeDate } from "@/lib/video-utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin | Azimuth Real Estate" },
      { name: "description", content: "Private admin area for managing the Azimuth video library." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setAdmin(null);
      return;
    }
    void isAdmin(session.user.id).then(setAdmin);
  }, [session]);

  if (!ready) {
    return (
      <div className="container-page py-20">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (!session) return <AdminLogin />;

  if (admin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="surface-card max-w-md p-8">
          <h1 className="font-display text-xl font-semibold">This account isn't an admin</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Signed in as {session.user.email}. Ask for the admin role to be granted to this account, then reload.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => supabase.auth.signOut()}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (admin === null) {
    return (
      <div className="container-page py-20">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  return <AdminDashboard email={session.user.email ?? ""} />;
}

function AdminDashboard({ email }: { email: string }) {
  const qc = useQueryClient();
  const videos = useQuery({ queryKey: ["admin-videos"], queryFn: fetchAllVideos });
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const playlists = useQuery({ queryKey: ["playlists"], queryFn: fetchPlaylists });
  const leads = useQuery({ queryKey: ["admin-leads"], queryFn: fetchLeads });

  const invalidate = () => void qc.invalidateQueries();

  const addCategory = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      toast.success("Category added");
      invalidate();
    },
    onError: () => toast.error("Could not add that category"),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <h1 className="font-display text-xl font-semibold">Azimuth admin</h1>
            <p className="text-xs text-muted-foreground">Signed in as {email}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/videos">
                View library <ExternalLink className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container-page py-10">
        <Tabs defaultValue="videos">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="add">Add video</TabsTrigger>
            <TabsTrigger value="library">Playlists & categories</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-8">
            <VideoTable videos={videos.data ?? []} loading={videos.isLoading} onChanged={invalidate} />
          </TabsContent>

          <TabsContent value="add" className="mt-8">
            <AddVideoForm
              categories={categories.data ?? []}
              playlists={playlists.data ?? []}
              onCreateCategory={(name) => addCategory.mutate(name)}
            />
          </TabsContent>

          <TabsContent value="library" className="mt-8 grid gap-6 lg:grid-cols-2">
            <PlaylistManager playlists={playlists.data ?? []} onChanged={invalidate} />
            <CategoryManager categories={categories.data ?? []} onChanged={invalidate} />
          </TabsContent>

          <TabsContent value="leads" className="mt-8">
            <LeadsInbox leads={leads.data ?? []} loading={leads.isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function VideoTable({
  videos,
  loading,
  onChanged,
}: {
  videos: Video[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [rows, setRows] = useState<Video[]>(videos);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => setRows(videos), [videos]);

  const persist = async (next: Video[]) => {
    setRows(next);
    try {
      await reorderVideos(next.map((v, i) => ({ id: v.id, sort_order: i + 1 })));
      toast.success("Order saved");
      onChanged();
    } catch {
      toast.error("Could not save the new order");
    }
  };

  const drop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    void persist(next);
  };

  if (loading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (rows.length === 0)
    return <p className="surface-card p-10 text-center text-sm text-muted-foreground">No videos yet.</p>;

  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="p-4">Order</th>
            <th className="p-4">Video</th>
            <th className="p-4">Category</th>
            <th className="p-4">Status</th>
            <th className="p-4">Views</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((video, index) => (
            <tr
              key={video.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => drop(index)}
              className="border-b border-border/60 last:border-0"
            >
              <td className="p-4 text-muted-foreground">
                <span className="flex cursor-grab items-center gap-1">
                  <GripVertical className="size-4" /> {index + 1}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {fallbackThumbnail(video) ? (
                    <img
                      src={fallbackThumbnail(video)!}
                      alt=""
                      loading="lazy"
                      className="h-12 w-20 rounded-md object-cover"
                    />
                  ) : (
                    <span className="gradient-placeholder h-12 w-20 rounded-md" aria-hidden />
                  )}
                  <span>
                    <span className="block max-w-sm truncate font-medium">{video.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {relativeDate(video.published_at)}
                      {video.is_placeholder ? " · PLACEHOLDER — replace with real video" : ""}
                    </span>
                  </span>
                </div>
              </td>
              <td className="p-4">{video.category}</td>
              <td className="p-4">
                <span
                  className={
                    video.status === "published"
                      ? "rounded-full bg-brass/20 px-2.5 py-1 text-xs font-semibold text-accent-foreground"
                      : "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                  }
                >
                  {video.status}
                </span>
              </td>
              <td className="p-4">{video.view_count.toLocaleString()}</td>
              <td className="p-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await updateVideo(video.id, { is_featured: !video.is_featured });
                      toast.success(video.is_featured ? "Unfeatured" : "Featured");
                      onChanged();
                    }}
                  >
                    {video.is_featured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await updateVideo(video.id, {
                        status: video.status === "published" ? "draft" : "published",
                      });
                      toast.success("Status updated");
                      onChanged();
                    }}
                  >
                    {video.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!window.confirm(`Delete “${video.title}”?`)) return;
                      await deleteVideo(video.id);
                      toast.success("Video deleted");
                      onChanged();
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlaylistManager({
  playlists,
  onChanged,
}: {
  playlists: { id: string; title: string; description: string | null }[];
  onChanged: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="surface-card p-6">
      <h2 className="font-display text-lg font-semibold">Playlists / series</h2>
      <form
        className="mt-5 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await createPlaylist(title, description);
            toast.success("Playlist created");
            setTitle("");
            setDescription("");
            onChanged();
          } catch {
            toast.error("Could not create that playlist");
          }
        }}
      >
        <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Series title" />
        <Textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
        />
        <Button type="submit" variant="gold" size="sm">
          Create playlist
        </Button>
      </form>

      <ul className="mt-6 divide-y divide-border">
        {playlists.map((playlist) => (
          <li key={playlist.id} className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm font-medium">{playlist.title}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!window.confirm(`Delete “${playlist.title}”?`)) return;
                await deletePlaylist(playlist.id);
                toast.success("Playlist deleted");
                onChanged();
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryManager({
  categories,
  onChanged,
}: {
  categories: { id: string; name: string }[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="surface-card p-6">
      <h2 className="font-display text-lg font-semibold">Categories</h2>
      <form
        className="mt-5 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await createCategory(name);
            toast.success("Category added");
            setName("");
            onChanged();
          } catch {
            toast.error("Could not add that category");
          }
        }}
      >
        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
        <Button type="submit" variant="gold" size="sm">
          Add
        </Button>
      </form>

      <ul className="mt-6 divide-y divide-border">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm font-medium">{category.name}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!window.confirm(`Delete “${category.name}”?`)) return;
                await deleteCategory(category.id);
                toast.success("Category deleted");
                onChanged();
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeadsInbox({
  leads,
  loading,
}: {
  leads: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string | null;
    source: string;
    program: string | null;
    property_address: string | null;
    property_type: string | null;
    created_at: string;
  }[];
  loading: boolean;
}) {
  if (loading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (leads.length === 0)
    return (
      <div className="surface-card flex flex-col items-center gap-3 p-16 text-center">
        <Inbox className="size-7 text-brass" />
        <p className="text-sm text-muted-foreground">No form submissions yet.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <article key={lead.id} className="surface-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-base font-semibold">
              {lead.name} · <a href={`mailto:${lead.email}`} className="text-brass">{lead.email}</a>
            </h3>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{lead.source}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(lead.created_at).toLocaleString()} {lead.phone ? `· ${lead.phone}` : ""}
          </p>
          {lead.property_address || lead.property_type || lead.program ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {[lead.property_address, lead.property_type, lead.program].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {lead.message ? <p className="mt-3 text-sm leading-relaxed">{lead.message}</p> : null}
        </article>
      ))}
    </div>
  );
}
