/**
 * Dev Tools
 *
 * Click-to-source development tool:
 *
 * **Ctrl+Click** — Open source file in editor
 * **Ctrl+Option+Click** — Open parent component's source file
 * **Cmd+Click** — Copy LLM-friendly snippet to clipboard
 * **Cmd+Option+Click** — Copy parent component's snippet
 *
 * Usage:
 * ```tsx
 * import { ClickToSource } from "@bakdotdev/dev-tools";
 *
 * // In your app's root layout (development only)
 * {process.env.NODE_ENV === "development" && (
 *   <ClickToSource editorProtocol="cursor" />
 * )}
 * ```
 *
 * For source location injection, configure the webpack loader:
 * ```ts
 * // next.config.ts (Turbopack)
 * const nextConfig = {
 *   turbopack: {
 *     rules: {
 *       "**\/*.{tsx,jsx}": {
 *         loaders: [{
 *           loader: "@bakdotdev/dev-tools/webpack-loader",
 *           options: { env: "development" },
 *         }],
 *       },
 *     },
 *   },
 * };
 * ```
 */

export { ClickToSource } from "./Overlay";
export type { ClickToSourceProps, EditorProtocol, ModifierLocation } from "./Overlay";

export { LayoutDebugOverlay } from "./LayoutDebugOverlay";

export {
  DevToolsProvider,
  useDevTools,
  useDebug,
  useDomain,
} from "./DevToolsProvider";
export type {
  DevToolsProviderProps,
  Domain,
  AppName,
} from "./DevToolsProvider";
