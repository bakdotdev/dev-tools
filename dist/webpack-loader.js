import { transformSync } from "@babel/core";
import presetTypescript from "@babel/preset-typescript";
import locatorPlugin from "./babel-jsx/index.js";
function locatorLoader(source) {
  const filePath = this.resourcePath;
  if (process.env.DEBUG_LOCATOR) {
    console.log(`[LocatorLoader] Processing: ${filePath}`);
  }
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
            onlyRemoveTypeImports: true
          }
        ]
      ],
      // Apply the locator plugin with path-based data attributes
      plugins: [[locatorPlugin, { ...options, dataAttribute: "path" }]],
      retainLines: false,
      compact: false
    });
    if (!result || !result.code) {
      return source;
    }
    return result.code;
  } catch (error) {
    console.warn(
      `[@bakdotdev/dev-tools/webpack-loader] Failed to transform ${filePath}:`,
      error instanceof Error ? error.message : String(error)
    );
    return source;
  }
}
var webpack_loader_default = locatorLoader;
export {
  webpack_loader_default as default
};
//# sourceMappingURL=webpack-loader.js.map
