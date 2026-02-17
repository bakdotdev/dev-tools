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

// Editor options: "vscode" (default) | "cursor" | "zed"
initClickToSource();
initClickToSource({ editorProtocol: "cursor" }); // for Cursor
initClickToSource({ editorProtocol: "zed" });    // for Zed
```

Or use the React component:

```tsx
import { ClickToSource } from "@bakdotdev/dev-tools/react";

function App() {
  return (
    <>
      <YourApp />
      {/* editorProtocol: "vscode" (default) | "cursor" | "zed" */}
      <ClickToSource />
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

### LLM Snippet Format

When copying with Cmd+Click, the snippet is formatted for optimal LLM parsing:

```xml
<code source="/path/to/file.tsx:42:8">
<div class="example">
  <span>Content</span>
</div>
</code>
```

The `source` attribute contains `file:line:column`. This format works across all major LLMs (Claude, GPT, Gemini, etc.).

### Editor Protocols

| Editor | Protocol |
|--------|----------|
| VS Code | `"vscode"` (default) |
| Cursor | `"cursor"` |
| Zed | `"zed"` |

## Other Frameworks

### Next.js (Turbopack)

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.tsx": {
        loaders: [
          {
            loader: "@bakdotdev/dev-tools/webpack-loader",
            options: { env: "development" },
          },
        ],
      },
      "*.jsx": {
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

Add the React component to your root layout:

```tsx
// app/layout.tsx
import { ClickToSource } from "@bakdotdev/dev-tools/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ClickToSource editorProtocol="vscode" />
      </body>
    </html>
  );
}
```

### Next.js (Webpack)

For Next.js without Turbopack:

```js
// next.config.js
module.exports = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.module.rules.push({
        test: /\.(tsx|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "@bakdotdev/dev-tools/webpack-loader",
            options: { env: "development" },
          },
        ],
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

initClickToSource({ editorProtocol: "vscode" });
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

useClickToSource({ editorProtocol: "vscode" });
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
    initClickToSource({ editorProtocol: "vscode" });
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
  editorProtocol: "vscode",
  modifierLocation: "any", // "any" | "left" | "right"
});

cleanup(); // Remove overlay
```

### `modifierLocation` Option

Control which modifier keys (Ctrl, Cmd, Alt) activate the tool:

| Value | Description |
|-------|-------------|
| `"any"` (default) | Respond to both left and right modifier keys |
| `"left"` | Only respond to left-side modifier keys |
| `"right"` | Only respond to right-side modifier keys |

This is useful when you want to reserve one side of the keyboard for other shortcuts. For example, use `"right"` to only activate the tool with right-Ctrl/Cmd, leaving left-Ctrl/Cmd free for browser shortcuts.

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
