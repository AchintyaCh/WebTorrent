import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  define: {
    "process.env": {},
    global: {},
  },
  resolve: {
    alias: {
      buffer: "buffer",
      events: "events",
      stream: "stream-browserify",
      util: "util",
      path: "path-browserify",
      crypto: "crypto-browserify",
      vm: "vm-browserify",
      "bittorrent-dht": resolve(__dirname, "src/utils/dht-browser.js"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
    include: [
      "buffer",
      "process",
      "util",
      "events",
      "stream-browserify",
      "path-browserify",
      "crypto-browserify",
      "pbkdf2",
      "vm-browserify",
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
});
