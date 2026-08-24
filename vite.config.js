import { defineConfig } from "vite";
import { sites } from "@openai/sites-vite-plugin";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: isSsrBuild ? [] : [sites()],
  build: isSsrBuild
    ? {
        outDir: "dist/server",
        emptyOutDir: false,
        rollupOptions: {
          output: {
            entryFileNames: "index.js",
          },
        },
      }
    : undefined,
}));
