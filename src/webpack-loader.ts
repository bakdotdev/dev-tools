import { transformSync } from "@babel/core";
import presetTypescript from "@babel/preset-typescript";
import locatorPlugin from "./babel-jsx/index.js";

interface LocatorLoaderOptions {
  env?: string;
  ignoreComponentNames?: string[];
}

interface LoaderContext<T = Record<string, unknown>> {
  getOptions(): T;
  resourcePath: string;
}

/**
 * Webpack/Turbopack loader for @bakdotdev/dev-tools babel-jsx plugin
 *
 * This loader applies the LocatorJS babel transformation to JSX/TSX files,
 * enabling component location tracking for click-to-source functionality.
 *
 * Works with both Webpack and Turbopack (Next.js).
 *
 * @example
 * ```js
 * // next.config.js (Turbopack)
 * module.exports = {
 *   turbopack: {
 *     rules: {
 *       '*.tsx': {
 *         loaders: [{
 *           loader: '@bakdotdev/dev-tools/webpack-loader',
 *           options: { env: 'development' }
 *         }],
 *       },
 *       '*.jsx': {
 *         loaders: [{
 *           loader: '@bakdotdev/dev-tools/webpack-loader',
 *           options: { env: 'development' }
 *         }],
 *       },
 *     },
 *   },
 * };
 * ```
 */
function locatorLoader(
  this: LoaderContext<LocatorLoaderOptions>,
  source: string
): string {
  const filePath = this.resourcePath;

  // Debug: log that loader is being called (set DEBUG_LOCATOR=1 to enable)
  if (process.env.DEBUG_LOCATOR) {
    console.log(`[LocatorLoader] Processing: ${filePath}`);
  }

  // Skip node_modules and middleware files by default
  if (filePath.includes("node_modules") || filePath.includes("middleware.")) {
    return source;
  }

  const options = this.getOptions();

  try {
    const result = transformSync(source, {
      filename: filePath,
      sourceMaps: false,
      sourceFileName: filePath,
      babelrc: false,
      configFile: false,
      // Use TypeScript preset with direct import (not string name)
      // This ensures the preset is bundled and doesn't require runtime resolution
      presets: [
        [
          presetTypescript,
          {
            isTSX: true,
            allExtensions: true,
            onlyRemoveTypeImports: true,
          },
        ],
      ],
      // Apply the locator plugin with path-based data attributes
      plugins: [[locatorPlugin, { ...options, dataAttribute: "path" }]],
      retainLines: false,
      compact: false,
    });

    if (!result || !result.code) {
      return source;
    }

    return result.code;
  } catch (error) {
    // If transformation fails, return original source and log warning
    console.warn(
      `[@bakdotdev/dev-tools/webpack-loader] Failed to transform ${filePath}:`,
      error instanceof Error ? error.message : String(error)
    );
    return source;
  }
}

export default locatorLoader;
