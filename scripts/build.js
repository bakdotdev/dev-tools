import * as esbuild from "esbuild";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Ensure dist directories exist
mkdirSync(join(rootDir, "dist/babel-jsx"), { recursive: true });

// Common esbuild options for React components
const reactOptions = {
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  sourcemap: true,
  jsx: "automatic",
  external: ["react", "react-dom", "react/jsx-runtime"],
  minify: false,
};

// Build main entry point (ClickToSource, DevToolsProvider, etc.)
await esbuild.build({
  ...reactOptions,
  entryPoints: [join(rootDir, "src/index.ts")],
  outfile: join(rootDir, "dist/index.js"),
  banner: {
    js: '"use client";',
  },
});

console.log("Built main entry (ESM)");

// Build babel-plugin (Node.js, ESM)
await esbuild.build({
  entryPoints: [join(rootDir, "src/babel-jsx/index.ts")],
  outfile: join(rootDir, "dist/babel-jsx/index.js"),
  bundle: false,
  format: "esm",
  platform: "node",
  target: "node18",
  sourcemap: true,
});

console.log("Built babel-plugin (ESM)");

// Build webpack-loader (ESM)
await esbuild.build({
  entryPoints: [join(rootDir, "src/webpack-loader.ts")],
  outfile: join(rootDir, "dist/webpack-loader.js"),
  bundle: false,
  format: "esm",
  platform: "node",
  target: "node18",
  sourcemap: true,
});

console.log("Built webpack-loader (ESM)");

// Build webpack-loader (CJS) for Turbopack compatibility
await esbuild.build({
  entryPoints: [join(rootDir, "src/webpack-loader.ts")],
  outfile: join(rootDir, "dist/webpack-loader.cjs"),
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: true,
  external: ["@babel/core", "@babel/preset-typescript"],
});

console.log("Built webpack-loader (CJS)");

// Build production stub (ESM)
await esbuild.build({
  ...reactOptions,
  entryPoints: [join(rootDir, "src/stub.ts")],
  outfile: join(rootDir, "dist/stub.js"),
});

console.log("Built production stub (ESM)");

// Create type declaration stubs
const mainDts = `export { ClickToSource } from "./Overlay";
export type { ClickToSourceProps } from "./Overlay";
export { LayoutDebugOverlay } from "./LayoutDebugOverlay";
export { DevToolsProvider, useDevTools, useDebug, useDomain } from "./DevToolsProvider";
export type { DevToolsProviderProps, Domain, AppName } from "./DevToolsProvider";
`;

const babelPluginDts = `declare const plugin: any;
export default plugin;
`;

const webpackLoaderDts = `declare const loader: any;
export default loader;
`;

const stubDts = `export const ClickToSource: () => null;
export type ClickToSourceProps = Record<string, unknown>;
export const DevToolsProvider: (props: { children: any }) => any;
export const useDevTools: () => Record<string, unknown>;
export const useDebug: () => Record<string, () => void>;
export const useDomain: () => null;
export type DevToolsProviderProps = { children: any };
export type Domain = string;
export type AppName = string;
export const LayoutDebugOverlay: () => null;
`;

writeFileSync(join(rootDir, "dist/index.d.ts"), mainDts);
writeFileSync(join(rootDir, "dist/stub.d.ts"), stubDts);
writeFileSync(join(rootDir, "dist/babel-jsx/index.d.ts"), babelPluginDts);
writeFileSync(join(rootDir, "dist/webpack-loader.d.ts"), webpackLoaderDts);

console.log("Created type declarations");
console.log("Build complete!");
