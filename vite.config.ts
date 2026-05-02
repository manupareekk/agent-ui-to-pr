import { defineConfig } from "vite";

/** GitHub Pages project sites: `VITE_BASE_PATH=/agent-ui-to-pr/` (leading slash, trailing slash optional). */
function viteBase(): string {
  const b = process.env.VITE_BASE_PATH?.trim();
  if (!b || b === "/") return "/";
  const x = b.startsWith("/") ? b : `/${b}`;
  return x.endsWith("/") ? x : `${x}/`;
}

export default defineConfig({
  base: viteBase(),
  server: { port: 5180 },
  build: { target: "es2022" },
});
