# @bakdotdev/dev-tools

Click-to-source development tool for React, Vue, and Angular. Inspect any element, open its source file in your editor, or copy an LLM-friendly snippet to your clipboard.

[![npm version](https://img.shields.io/npm/v/@bakdotdev/dev-tools.svg)](https://www.npmjs.com/package/@bakdotdev/dev-tools)
[![GitHub](https://img.shields.io/github/license/bakdotdev/dev-tools)](https://github.com/bakdotdev/dev-tools)

## Features

- **Click-to-source**: Ctrl+Click any element to open its source file in your editor
- **LLM snippets**: Cmd+Click to copy formatted code snippets for AI assistants
- **Parent navigation**: Hold Alt to target parent components instead
- **Multi-framework**: React, Vue 3, Angular 17+, Next.js, Nuxt 3
- **Multi-editor**: VS Code, Cursor, Zed

## Quick Start

### 1. Install

```bash
npm install @bakdotdev/dev-tools
# or
pnpm add @bakdotdev/dev-tools
```

### 2. Add the Vite Plugin

The plugin injects source location data into your components at build time.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // or vue(), angular(), etc.
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default defineConfig({
  plugins: [
    devToolsPlugin(), // Add before your framework plugin
    react(),
  ],
});
```

### 3. Initialize the Overlay

#### Universal (works with any framework)

```ts
// main.ts or app entry
import { initClickToSource } from "@bakdotdev/dev-tools";

initClickToSource({ editorProtocol: "zed" }); // or "vscode", "cursor"
```

#### React

```tsx
// App.tsx or layout
import { initClickToSource } from "@bakdotdev/dev-tools";

// Call once at app initialization
initClickToSource({ editorProtocol: "cursor" });

function App() {
  return <div>...</div>;
}
```

Or use the React component:

```tsx
import { ClickToSource } from "@bakdotdev/dev-tools/react";

function Layout({ children }) {
  return (
    <>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ClickToSource editorProtocol="zed" />
      )}
    </>
  );
}
```

#### Vue 3

```vue
<script setup>
import { useClickToSource } from "@bakdotdev/dev-tools/vue";

useClickToSource({ editorProtocol: "zed" });
</script>
```

#### Angular

```typescript
// app.component.ts
import { Component, OnInit } from "@angular/core";
import { initClickToSource } from "@bakdotdev/dev-tools";

@Component({ ... })
export class AppComponent implements OnInit {
  ngOnInit() {
    initClickToSource({ editorProtocol: "zed" });
  }
}
```

## Editor Configuration

Set the `editorProtocol` option to your preferred editor:

| Editor | Protocol | URL Format |
|--------|----------|------------|
| VS Code | `"vscode"` | `vscode://file/{path}:{line}:{column}` |
| Cursor | `"cursor"` | `cursor://file/{path}:{line}:{column}` |
| Zed | `"zed"` | `zed://file{path}:{line}:{column}` |

**Default:** `"cursor"`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl + Click** | Open source file in editor |
| **Ctrl + Alt + Click** | Open parent component's source |
| **Cmd + Click** | Copy LLM-friendly snippet |
| **Cmd + Alt + Click** | Copy parent component's snippet |

The overlay shows a toggle switch to enable/disable element highlighting while keeping shortcuts active.

## Framework Setup

### Vite (React, Vue, Solid, etc.)

```ts
// vite.config.ts
import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";

export default defineConfig({
  plugins: [devToolsPlugin(), yourFrameworkPlugin()],
});
```

### Next.js (Turbopack)

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

### Next.js (Webpack)

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

## Vite Plugin Options

```ts
devToolsPlugin({
  // Environments to enable (default: ["development"])
  environments: ["development"],

  // Components to skip
  ignoreComponentNames: ["InternalComponent"],

  // File patterns to include
  include: [/\.[jt]sx?$/, /\.vue$/, /\.component\.html$/],

  // File patterns to exclude (default includes node_modules)
  exclude: [/node_modules/, /\.test\./],
});
```

## API Reference

### `initClickToSource(options?)`

Initialize the overlay. Safe to call multiple times.

```ts
import { initClickToSource } from "@bakdotdev/dev-tools";

const cleanup = initClickToSource({
  editorProtocol: "zed", // "vscode" | "cursor" | "zed"
});

// Optional: remove overlay
cleanup();
```

### `setEditorProtocol(protocol)`

Change the editor at runtime.

```ts
import { setEditorProtocol } from "@bakdotdev/dev-tools";

setEditorProtocol("vscode");
```

### `isOverlayActive()`

Check if the overlay is currently mounted.

```ts
import { isOverlayActive } from "@bakdotdev/dev-tools";

if (isOverlayActive()) {
  console.log("Dev tools overlay is active");
}
```

## Requirements

- React 18+, Vue 3+, or Angular 17+
- Vite 5+ or webpack-compatible bundler
- Node.js 18+

## Links

- [GitHub Repository](https://github.com/bakdotdev/dev-tools)
- [npm Package](https://www.npmjs.com/package/@bakdotdev/dev-tools)
- [Report Issues](https://github.com/bakdotdev/dev-tools/issues)

## License

MIT
