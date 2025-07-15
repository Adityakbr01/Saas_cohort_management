import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { visualizer } from "rollup-plugin-visualizer"
import viteCompression from "vite-plugin-compression"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true,
      filename: "bundle-report.html",
      gzipSize: true,
      brotliSize: true,
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only assets >10KB
      algorithm: "brotliCompress", // or "gzip"
      ext: ".br", // Or ".gz" for gzip
    }),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          excalidraw: ["@excalidraw/excalidraw"],
          recharts: ["recharts"],
          hls: ["hls.js", "mux-embed"],
          reactVendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-popover", "@radix-ui/react-dropdown-menu", "@radix-ui/react-dialog"],
        },
      },
    },
  },
})
