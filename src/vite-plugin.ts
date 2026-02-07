import { transformSync } from "@babel/core";
import type { Plugin } from "vite";
import locatorPlugin from "./babel-jsx/index.js";
import { transformVueSFC } from "./vue-transform.js";
import { transformAngularFile } from "./angular-transform.js";

export interface DevToolsPluginOptions {
  /**
   * Only apply in these environments
   * @default ["development"]
   */
  environments?: string[];

  /**
   * Component names to ignore (won't get source location attributes)
   */
  ignoreComponentNames?: string[];

  /**
   * File patterns to include (uses picomatch patterns)
   * @default [/\.[jt]sx?$/, /\.vue$/]
   */
  include?: (string | RegExp)[];

  /**
   * File patterns to exclude
   * @default [/node_modules/, /\.next/, /\.nuxt/]
   */
  exclude?: (string | RegExp)[];

  /**
   * Enable Vue SFC support
   * @default true
   */
  vue?: boolean;

  /**
   * Enable Angular support (.component.html and inline templates)
   * @default true
   */
  angular?: boolean;
}

const defaultInclude = [/\.[jt]sx?$/, /\.vue$/, /\.component\.html$/];
const defaultExclude = [/node_modules/, /\.next/, /\.nuxt/, /\.output/];

function matchesPattern(
  id: string,
  patterns: (string | RegExp)[]
): boolean {
  return patterns.some((pattern) => {
    if (typeof pattern === "string") {
      return id.includes(pattern);
    }
    return pattern.test(id);
  });
}

/**
 * Vite plugin for @bakdotdev/dev-tools
 *
 * Injects source location data into JSX and Vue template elements,
 * enabling click-to-source functionality in development.
 *
 * Supports:
 * - React (JSX/TSX)
 * - Vue 3 (SFC templates)
 * - Angular 17+ (component templates)
 * - TanStack Start
 * - Nuxt 3
 *
 * @example React / TanStack Start
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import react from "@vitejs/plugin-react";
 * import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     devToolsPlugin(),
 *   ],
 * });
 * ```
 *
 * @example Vue 3 / Nuxt 3
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import vue from "@vitejs/plugin-vue";
 * import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     vue(),
 *     devToolsPlugin(),
 *   ],
 * });
 * ```
 *
 * @example Nuxt 3 (nuxt.config.ts)
 * ```ts
 * import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";
 *
 * export default defineNuxtConfig({
 *   vite: {
 *     plugins: [devToolsPlugin()],
 *   },
 * });
 * ```
 *
 * @example Angular 17+ (angular.json - uses Vite by default)
 * ```ts
 * // vite.config.ts (if using custom Vite config)
 * import { devToolsPlugin } from "@bakdotdev/dev-tools/vite-plugin";
 *
 * export default {
 *   plugins: [devToolsPlugin()],
 * };
 * ```
 */
export function devToolsPlugin(options: DevToolsPluginOptions = {}): Plugin {
  const {
    environments = ["development"],
    ignoreComponentNames = [],
    include = defaultInclude,
    exclude = defaultExclude,
    vue = true,
    angular = true,
  } = options;

  return {
    name: "@bakdotdev/dev-tools",
    enforce: "pre", // Run before other plugins (like @vitejs/plugin-react or @vitejs/plugin-vue)

    async transform(code, id) {
      // Check environment
      const env = process.env.NODE_ENV || "development";
      if (!environments.includes(env)) {
        return null;
      }

      // Check exclusions first
      if (matchesPattern(id, exclude)) {
        return null;
      }

      // Check file patterns
      if (!matchesPattern(id, include)) {
        return null;
      }

      // Skip files without angle brackets (quick check)
      if (!code.includes("<") || !code.includes(">")) {
        return null;
      }

      // Debug logging
      if (process.env.DEBUG_DEVTOOLS) {
        console.log(`[@bakdotdev/dev-tools] Processing: ${id}`);
      }

      // Handle Vue SFC files
      if (vue && id.endsWith(".vue")) {
        return await transformVueFile(code, id, ignoreComponentNames);
      }

      // Handle Angular template files
      if (angular && id.endsWith(".component.html")) {
        return transformAngularHtmlFile(code, id, ignoreComponentNames);
      }

      // Handle Angular component files with inline templates
      if (angular && id.endsWith(".component.ts") && code.includes("@Component")) {
        return transformAngularTsFile(code, id, ignoreComponentNames);
      }

      // Handle JSX/TSX files
      return transformJsxFile(code, id, ignoreComponentNames);
    },
  };
}

/**
 * Transform an Angular .component.html file
 */
function transformAngularHtmlFile(
  code: string,
  id: string,
  ignoreComponentNames: string[]
): { code: string; map?: any } | null {
  try {
    return transformAngularFile(code, id, { ignoreComponentNames });
  } catch (error) {
    console.warn(
      `[@bakdotdev/dev-tools] Failed to transform Angular template ${id}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

/**
 * Transform an Angular .component.ts file with inline template
 */
function transformAngularTsFile(
  code: string,
  id: string,
  ignoreComponentNames: string[]
): { code: string; map?: any } | null {
  try {
    return transformAngularFile(code, id, { ignoreComponentNames });
  } catch (error) {
    console.warn(
      `[@bakdotdev/dev-tools] Failed to transform Angular component ${id}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

/**
 * Transform a Vue SFC file
 */
async function transformVueFile(
  code: string,
  id: string,
  ignoreComponentNames: string[]
): Promise<{ code: string; map?: any } | null> {
  try {
    const result = await transformVueSFC(code, id, { ignoreComponentNames });
    return result;
  } catch (error) {
    console.warn(
      `[@bakdotdev/dev-tools] Failed to transform Vue file ${id}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

/**
 * Transform a JSX/TSX file using Babel
 */
function transformJsxFile(
  code: string,
  id: string,
  ignoreComponentNames: string[]
): { code: string; map?: any } | null {
  try {
    const result = transformSync(code, {
      filename: id,
      sourceMaps: true,
      sourceFileName: id,
      babelrc: false,
      configFile: false,
      presets: [
        [
          "@babel/preset-typescript",
          {
            isTSX: true,
            allExtensions: true,
            onlyRemoveTypeImports: true,
          },
        ],
      ],
      plugins: [
        [
          locatorPlugin,
          {
            dataAttribute: "path",
            ignoreComponentNames,
          },
        ],
      ],
      retainLines: false,
      compact: false,
    });

    if (!result || !result.code) {
      return null;
    }

    return {
      code: result.code,
      map: result.map,
    };
  } catch (error) {
    console.warn(
      `[@bakdotdev/dev-tools] Failed to transform ${id}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

// Default export for convenience
export default devToolsPlugin;
