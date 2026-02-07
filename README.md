# @bakdotdev/dev-tools

Click-to-source development tool. Inspect any element, open its source file in your editor, or copy an LLM-friendly snippet to your clipboard.

[![npm version](https://img.shields.io/npm/v/@bakdotdev/dev-tools.svg)](https://www.npmjs.com/package/@bakdotdev/dev-tools)
[![GitHub](https://img.shields.io/github/license/bakdotdev/dev-tools)](https://github.com/bakdotdev/dev-tools)

## Features

- **Click-to-source** — Ctrl+Click any element to open its source file in your editor
- **LLM snippets** — Cmd+Click to copy formatted code snippets for AI assistants
- **Parent navigation** — Hold Alt to target the parent component instead
- **Visual inspector** — Crosshairs, element badges, and file path display
- **Toggle highlighting** — Switch button to enable/disable visual overlay
- **Framework support** — React, Vue 3, Angular 17+, Next.js, Nuxt 3, TanStack Start
- **Editor support** — VS Code, Cursor, Zed

## Installation

```bash
pnpm add @bakdotdev/dev-tools
```

## React + Vite

**1. Add the Vite plugin:**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default defineConfig({
  plugins: [devToolsPlugin(), react()],
});
```

**2. Initialize the overlay:**

```tsx
// main.tsx
import { initClickToSource } from "@bakdotdev/dev-tools";

initClickToSource({ editorProtocol: "cursor" }); // or "vscode", "zed"
```

Or use the React component:

```tsx
import { ClickToSource } from "@bakdotdev/dev-tools/react";

function App() {
  return (
    <>
      <YourApp />
      <ClickToSource editorProtocol="cursor" />
    </>
  );
}
```

## Usage

| Shortcut | Action |
|----------|--------|
| **Ctrl + Click** | Open element's source in editor |
| **Ctrl + Alt + Click** | Open parent component's source in editor |
| **Cmd + Click** | Copy element as LLM-friendly snippet |
| **Cmd + Alt + Click** | Copy parent component as LLM-friendly snippet |

The overlay displays a toggle switch at the bottom to enable/disable visual highlighting while keeping keyboard shortcuts active.

### Editor Protocols

| Editor | Protocol |
|--------|----------|
| Cursor | `"cursor"` (default) |
| VS Code | `"vscode"` |
| Zed | `"zed"` |

## Other Frameworks

### Next.js

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "**/*.{tsx,jsx}": {
        loaders: [
          {
            loader: "@bakdotdev/dev-tools/webpack-loader",
            options: { env: "development" },
          },
        ],
      },
    },
  },
};

export default nextConfig;
```

For Webpack (non-Turbopack):

```js
// next.config.js
module.exports = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.module.rules.push({
        test: /\.(tsx|jsx)$/,
        exclude: /node_modules/,
        use: ["@bakdotdev/dev-tools/webpack-loader"],
      });
    }
    return config;
  },
};
```

### TanStack Start

```ts
// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default defineConfig({
  vite: {
    plugins: [devToolsPlugin()],
  },
});
```

```ts
// app/client.tsx
import { initClickToSource } from "@bakdotdev/dev-tools";

initClickToSource({ editorProtocol: "cursor" });
```

### Vue 3

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default defineConfig({
  plugins: [devToolsPlugin(), vue()],
});
```

```vue
<script setup>
import { useClickToSource } from "@bakdotdev/dev-tools/vue";

useClickToSource({ editorProtocol: "cursor" });
</script>
```

### Nuxt 3

```ts
// nuxt.config.ts
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default defineNuxtConfig({
  vite: {
    plugins: [devToolsPlugin()],
  },
});
```

### Angular 17+

```ts
// vite.config.ts (Angular uses Vite by default in v17+)
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default {
  plugins: [devToolsPlugin()],
};
```

```ts
// app.component.ts
import { Component, OnInit } from "@angular/core";
import { initClickToSource } from "@bakdotdev/dev-tools";

@Component({ ... })
export class AppComponent implements OnInit {
  ngOnInit() {
    initClickToSource({ editorProtocol: "cursor" });
  }
}
```

## Plugin Options

```ts
devToolsPlugin({
  // Environments to enable (default: ["development"])
  environments: ["development"],

  // Components to skip
  ignoreComponentNames: ["InternalComponent"],

  // File patterns to include
  include: [/\.[jt]sx?$/, /\.vue$/, /\.component\.html$/],

  // File patterns to exclude
  exclude: [/node_modules/, /\.test\./],
});
```

## API

### `initClickToSource(options?)`

Initialize the overlay. Returns a cleanup function.

```ts
const cleanup = initClickToSource({
  editorProtocol: "cursor",
});

cleanup(); // Remove overlay
```

### `setEditorProtocol(protocol)`

Change editor at runtime.

```ts
import { setEditorProtocol } from "@bakdotdev/dev-tools";

setEditorProtocol("vscode");
```

### `isOverlayActive()`

Check if overlay is mounted.

```ts
import { isOverlayActive } from "@bakdotdev/dev-tools";

if (isOverlayActive()) {
  console.log("Dev tools active");
}
```

## Requirements

- Node.js 18+
- Vite 5+ or webpack-compatible bundler
- React 18+, Vue 3+, or Angular 17+

## Follow for more stuff!

- [X / Twitter](https://x.com/bakdotdev)
- [LinkedIn](https://www.linkedin.com/in/erichquist/)

## License

MIT
