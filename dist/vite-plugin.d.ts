import type { Plugin } from "vite";

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
