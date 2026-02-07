import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default defineConfig({
  plugins: [
    devToolsPlugin(), // Must come before react() to transform templates first
    react(),
  ],
});
