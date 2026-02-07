import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default defineConfig({
  plugins: [
    devToolsPlugin(), // Must come before vue() to transform templates first
    vue(),
  ],
});
