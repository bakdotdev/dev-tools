# @bakdotdev/dev-tools

Click-to-source development tool for React. Inspect any element, open its source file in your editor, or copy an LLM-friendly snippet to your clipboard.

## Install

```bash
npm install @bakdotdev/dev-tools
```

## Setup

### 1. Configure the webpack loader

The loader injects source location data into your JSX at build time.

**Next.js with Turbopack:**

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

**Next.js with Webpack:**

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

### 2. Add the component

```tsx
import { ClickToSource } from "@bakdotdev/dev-tools";

export default function Layout({ children }) {
  return (
    <>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ClickToSource editorProtocol="cursor" />
      )}
    </>
  );
}
```

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| **Ctrl + Click** | Open source file in editor |
| **Ctrl + Option + Click** | Open parent component's source file |
| **Cmd + Click** | Copy LLM-friendly snippet to clipboard |
| **Cmd + Option + Click** | Copy parent component's snippet |

A toggle switch in the overlay lets you disable highlighting while keeping the shortcut reference visible.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `editorProtocol` | `"vscode" \| "cursor" \| "webstorm" \| "idea"` | `"cursor"` | Editor URL protocol for opening files |

## Requirements

- React 18+
- A bundler that supports webpack loaders (Next.js, Webpack, Turbopack)

## License

MIT
