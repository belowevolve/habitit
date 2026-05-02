import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      includeAssets: ["favicon.svg", "pwa-192x192.svg", "pwa-512x512.svg"],
      manifest: {
        background_color: "#ffffff",
        description: "Build better habits, one day at a time",
        display: "standalone",
        icons: [
          {
            sizes: "192x192",
            src: "pwa-192x192.svg",
            type: "image/svg+xml",
          },
          {
            sizes: "512x512",
            src: "pwa-512x512.svg",
            type: "image/svg+xml",
          },
          {
            purpose: "any maskable",
            sizes: "512x512",
            src: "pwa-512x512.svg",
            type: "image/svg+xml",
          },
        ],
        name: "habitit",
        short_name: "habitit",
        start_url: "/",
        theme_color: "#863bff",
      },
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
