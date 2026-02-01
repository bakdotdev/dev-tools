import { transformSync } from "@babel/core";
import locatorPlugin from "./babel-jsx/index.js";
function locatorLoader(source) {
  const callback = this.async();
  const filePath = this.resourcePath;
  if (process.env.DEBUG_LOCATOR) {
    console.log(`[LocatorLoader] Processing: ${filePath}`);
  }
  if (filePath.includes("node_modules") || filePath.includes("middleware.")) {
    callback(null, source);
    return;
  }
  const options = this.getOptions();
  try {
    const result = transformSync(source, {
      filename: filePath,
      sourceMaps: true,
      sourceFileName: filePath,
      babelrc: false,
      configFile: false,
      // Use TypeScript preset to properly parse TS/TSX files
      presets: [
        [
          "@babel/preset-typescript",
          {
            isTSX: true,
            allExtensions: true,
            onlyRemoveTypeImports: true
          }
        ]
      ],
      // Apply the locator plugin with path-based data attributes for server components
      plugins: [[locatorPlugin, { ...options, dataAttribute: "path" }]],
      // Preserve the original code structure
      retainLines: false,
      compact: false
    });
    if (!result || !result.code) {
      callback(null, source);
      return;
    }
    callback(null, result.code, result.map || void 0);
  } catch (error) {
    console.warn(
      `[@bakdotdev/dev-tools/webpack-loader] Failed to transform ${filePath}:`,
      error instanceof Error ? error.message : String(error)
    );
    callback(null, source);
  }
}
var webpack_loader_default = locatorLoader;
export {
  webpack_loader_default as default
};
//# sourceMappingURL=webpack-loader.js.map
