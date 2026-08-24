// Static build for GitHub Pages. Lovable's preview/publish keep using vite.config.ts.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const base = process.env["PAGES_BASE_PATH"] || "/azimuth-edge/";

export default defineConfig({
  vite: { base, preview: { host: "127.0.0.1" } },
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
    spa: {
      enabled: true,
      prerender: { enabled: true, outputPath: "/index.html", crawlLinks: false },
    },
  },
});
