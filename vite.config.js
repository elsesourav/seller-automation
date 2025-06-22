import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react()],
   build: {
      // Generate Chrome Extension compatible build
      rollupOptions: {
         input: {
            // Multiple HTML entry points
            popup: resolve(
               fileURLToPath(new URL(".", import.meta.url)),
               "popup.html"
            ),
            options: resolve(
               fileURLToPath(new URL(".", import.meta.url)),
               "options.html"
            ),
            // JavaScript entry points
            background: resolve(
               fileURLToPath(new URL(".", import.meta.url)),
               "src/background.js"
            ),
            content: resolve(
               fileURLToPath(new URL(".", import.meta.url)),
               "src/content.js"
            ),
         },
         output: {
            // Organize output files
            entryFileNames: (chunkInfo) => {
               if (
                  chunkInfo.name === "background" ||
                  chunkInfo.name === "content"
               ) {
                  return "[name].js";
               }
               return "assets/[name]-[hash].js";
            },
            chunkFileNames: "assets/[name]-[hash].js",
            assetFileNames: "assets/[name]-[hash].[ext]",
         },
      },
      // Disable minification for easier debugging (optional)
      minify: false,
      // Output directory
      outDir: "dist",
      // Clean output directory before build
      emptyOutDir: true,
   },
   // Public directory for static assets
   publicDir: "public",
   // Base path for assets
   base: "./",
});
