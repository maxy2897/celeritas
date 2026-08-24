import { defineConfig } from "vite";
import { sites } from "@openai/sites-vite-plugin";
import { resolve } from "node:path";

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
    : {
        rollupOptions: {
          input: {
            inicio: resolve(import.meta.dirname, "index.html"),
            comprar: resolve(import.meta.dirname, "comprar.html"),
            coche: resolve(import.meta.dirname, "coche.html"),
            vender: resolve(import.meta.dirname, "vender.html"),
            proceso: resolve(import.meta.dirname, "como-funciona.html"),
            contacto: resolve(import.meta.dirname, "contacto.html"),
            tasacion: resolve(import.meta.dirname, "tasacion.html"),
          },
        },
      },
}));
