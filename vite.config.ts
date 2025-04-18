import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Create plugins array without top-level await
const getPlugins = () => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ];
  
  // Only add cartographer in development within Replit
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    // This will be handled dynamically during build
  }
  
  return plugins;
};

export default defineConfig({
  plugins: getPlugins(),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
