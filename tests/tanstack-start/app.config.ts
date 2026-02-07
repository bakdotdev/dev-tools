import { defineConfig } from "@tanstack/start/config";
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default defineConfig({
  vite: {
    plugins: [devToolsPlugin()],
  },
});
