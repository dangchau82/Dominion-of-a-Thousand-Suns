import { defineConfig } from "vite";

// Relative paths so the game runs from GitHub Pages' sub-folder (and from a phone home screen).
export default defineConfig({
  base: "./",
  build: { outDir: "dist", assetsInlineLimit: 0 },
});
