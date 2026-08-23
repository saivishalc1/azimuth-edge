import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const staticPaths = ["/", "/about", "/brokerage", "/academy", "/videos", "/contact"];

        let dynamic: string[] = [];
        try {
          const supabase = createClient(
            process.env["SUPABASE_URL"]!,
            process.env["SUPABASE_PUBLISHABLE_KEY"]!,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );
          const [{ data: videos }, { data: playlists }] = await Promise.all([
            supabase.from("videos").select("slug").eq("status", "published"),
            supabase.from("playlists").select("slug"),
          ]);
          dynamic = [
            ...(videos ?? []).map((v) => `/videos/${v.slug}`),
            ...(playlists ?? []).map((p) => `/playlists/${p.slug}`),
          ];
        } catch {
          dynamic = [];
        }

        const urls = [...staticPaths, ...dynamic]
          .map((path) => `  <url><loc>${origin}${path}</loc></url>`)
          .join("\n");

        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
          { headers: { "content-type": "application/xml; charset=utf-8" } },
        );
      },
    },
  },
});
