import * as esbuild from "esbuild";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Ensure dist directories exist
mkdirSync(join(rootDir, "dist/babel-jsx"), { recursive: true });

// Common esbuild options for browser code
const browserOptions = {
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  sourcemap: true,
  minify: false,
};

// Common esbuild options for React components
const reactOptions = {
  ...browserOptions,
  jsx: "automatic",
  external: ["react", "react-dom", "react/jsx-runtime"],
};

// Build main entry point (universal, no framework dependencies)
await esbuild.build({
  ...browserOptions,
  entryPoints: [join(rootDir, "src/index.ts")],
  outfile: join(rootDir, "dist/index.js"),
  define: {
    "process.env.NODE_ENV": '"development"',
  },
});

console.log("Built main entry (universal ESM)");

// Build React entry point
await esbuild.build({
  ...reactOptions,
  entryPoints: [join(rootDir, "src/react.ts")],
  outfile: join(rootDir, "dist/react.js"),
  banner: {
    js: '"use client";',
  },
});

console.log("Built React entry (ESM)");

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

// Build vue-transform (ESM)
await esbuild.build({
  entryPoints: [join(rootDir, "src/vue-transform.ts")],
  outfile: join(rootDir, "dist/vue-transform.js"),
  bundle: false,
  format: "esm",
  platform: "node",
  target: "node18",
  sourcemap: true,
});

console.log("Built vue-transform (ESM)");

// Build angular-transform (ESM)
await esbuild.build({
  entryPoints: [join(rootDir, "src/angular-transform.ts")],
  outfile: join(rootDir, "dist/angular-transform.js"),
  bundle: false,
  format: "esm",
  platform: "node",
  target: "node18",
  sourcemap: true,
});

console.log("Built angular-transform (ESM)");

// Build vite-plugin (ESM)
await esbuild.build({
  entryPoints: [join(rootDir, "src/vite-plugin.ts")],
  outfile: join(rootDir, "dist/vite-plugin.js"),
  bundle: false,
  format: "esm",
  platform: "node",
  target: "node18",
  sourcemap: true,
});

console.log("Built vite-plugin (ESM)");

// Build production stub (ESM)
await esbuild.build({
  ...reactOptions,
  entryPoints: [join(rootDir, "src/stub.ts")],
  outfile: join(rootDir, "dist/stub.js"),
});

console.log("Built production stub (ESM)");

// Build overlay-core (browser ESM)
await esbuild.build({
  entryPoints: [join(rootDir, "src/overlay-core.ts")],
  outfile: join(rootDir, "dist/overlay-core.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  sourcemap: true,
  minify: false,
});

console.log("Built overlay-core (ESM)");

// Build vanilla click-to-source (browser ESM)
await esbuild.build({
  entryPoints: [join(rootDir, "src/click-to-source.ts")],
  outfile: join(rootDir, "dist/vanilla.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  sourcemap: true,
  minify: false,
});

console.log("Built vanilla click-to-source (ESM)");

// Build Vue composable (browser ESM)
await esbuild.build({
  entryPoints: [join(rootDir, "src/vue.ts")],
  outfile: join(rootDir, "dist/vue.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  sourcemap: true,
  minify: false,
  external: ["vue"],
});

console.log("Built Vue composable (ESM)");

// Build Angular component (browser ESM) - imports overlay-core
await esbuild.build({
  entryPoints: [join(rootDir, "src/click-to-source.component.ts")],
  outfile: join(rootDir, "dist/angular.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  sourcemap: true,
  minify: false,
  external: ["@angular/core"],
});

console.log("Built Angular component (ESM)");

// Create type declaration stubs
const mainDts = `export type EditorProtocol = "vscode" | "cursor" | "zed";

export interface OverlayOptions {
  editorProtocol?: EditorProtocol;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function initClickToSource(options?: OverlayOptions): () => void;
export function setEditorProtocol(protocol: EditorProtocol): void;
export function isOverlayActive(): boolean;

export { ClickToSourceOverlay } from "./overlay-core";
`;

const reactDts = `export { ClickToSource } from "./Overlay";
export type { ClickToSourceProps, EditorProtocol } from "./Overlay";
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

const vueTransformDts = `export interface VueTransformOptions {
  filename: string;
  ignoreComponentNames?: string[];
}

export function transformVueSFC(
  code: string,
  filename: string,
  options?: { ignoreComponentNames?: string[] }
): Promise<{ code: string; map?: any } | null>;
`;

const angularTransformDts = `export interface AngularTransformOptions {
  filename: string;
  ignoreComponentNames?: string[];
}

export function transformAngularTemplate(
  code: string,
  options: AngularTransformOptions
): { code: string; map?: any } | null;

export function transformAngularComponent(
  code: string,
  filename: string,
  options?: { ignoreComponentNames?: string[] }
): { code: string; map?: any } | null;

export function transformAngularFile(
  code: string,
  filename: string,
  options?: { ignoreComponentNames?: string[] }
): { code: string; map?: any } | null;
`;

const vitePluginDts = `import type { Plugin } from "vite";

export interface DevToolsPluginOptions {
  environments?: string[];
  ignoreComponentNames?: string[];
  include?: (string | RegExp)[];
  exclude?: (string | RegExp)[];
  vue?: boolean;
  angular?: boolean;
}

export function devToolsPlugin(options?: DevToolsPluginOptions): Plugin;
export default devToolsPlugin;
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

const overlayCoreTs = `export type EditorProtocol = "vscode" | "cursor" | "zed";

export interface OverlayOptions {
  editorProtocol?: EditorProtocol;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export class ClickToSourceOverlay {
  constructor(options?: OverlayOptions);
  mount(): void;
  unmount(): void;
  setEditorProtocol(protocol: EditorProtocol): void;
  toggleHighlight(): void;
}
`;

const vanillaDts = `export type EditorProtocol = "vscode" | "cursor" | "zed";

export interface OverlayOptions {
  editorProtocol?: EditorProtocol;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function initClickToSource(options?: OverlayOptions): () => void;
export { ClickToSourceOverlay } from "./overlay-core";
`;

const vueDts = `import type { Ref } from "vue";

export type EditorProtocol = "vscode" | "cursor" | "zed";

export interface UseClickToSourceOptions {
  editorProtocol?: EditorProtocol | Ref<EditorProtocol>;
}

export function useClickToSource(options?: UseClickToSourceOptions): void;

export { ClickToSourceOverlay } from "./overlay-core";
`;

const angularDts = `import type { OnInit, OnDestroy, OnChanges, SimpleChanges } from "@angular/core";
import type { EditorProtocol } from "./overlay-core";

export class ClickToSourceComponent implements OnInit, OnDestroy, OnChanges {
  editorProtocol: EditorProtocol;
  ngOnInit(): void;
  ngOnDestroy(): void;
  ngOnChanges(changes: SimpleChanges): void;
}
`;

writeFileSync(join(rootDir, "dist/overlay-core.d.ts"), overlayCoreTs);
writeFileSync(join(rootDir, "dist/vanilla.d.ts"), vanillaDts);
writeFileSync(join(rootDir, "dist/vue.d.ts"), vueDts);
writeFileSync(join(rootDir, "dist/angular.d.ts"), angularDts);

writeFileSync(join(rootDir, "dist/index.d.ts"), mainDts);
writeFileSync(join(rootDir, "dist/react.d.ts"), reactDts);
writeFileSync(join(rootDir, "dist/stub.d.ts"), stubDts);
writeFileSync(join(rootDir, "dist/babel-jsx/index.d.ts"), babelPluginDts);
writeFileSync(join(rootDir, "dist/webpack-loader.d.ts"), webpackLoaderDts);
writeFileSync(join(rootDir, "dist/vue-transform.d.ts"), vueTransformDts);
writeFileSync(join(rootDir, "dist/angular-transform.d.ts"), angularTransformDts);
writeFileSync(join(rootDir, "dist/vite-plugin.d.ts"), vitePluginDts);

console.log("Created type declarations");
console.log("Build complete!");
