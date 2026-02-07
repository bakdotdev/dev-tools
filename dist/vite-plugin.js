import { transformSync } from "@babel/core";
import locatorPlugin from "./babel-jsx/index.js";
import { transformVueSFC } from "./vue-transform.js";
import { transformAngularFile } from "./angular-transform.js";
const defaultInclude = [/\.[jt]sx?$/, /\.vue$/, /\.component\.html$/];
const defaultExclude = [/node_modules/, /\.next/, /\.nuxt/, /\.output/];
function matchesPattern(id, patterns) {
  return patterns.some((pattern) => {
    if (typeof pattern === "string") {
      return id.includes(pattern);
    }
    return pattern.test(id);
  });
}
function devToolsPlugin(options = {}) {
  const {
    environments = ["development"],
    ignoreComponentNames = [],
    include = defaultInclude,
    exclude = defaultExclude,
    vue = true,
    angular = true
  } = options;
  return {
    name: "@bakdotdev/dev-tools",
    enforce: "pre",
    // Run before other plugins (like @vitejs/plugin-react or @vitejs/plugin-vue)
    async transform(code, id) {
      const env = process.env.NODE_ENV || "development";
      if (!environments.includes(env)) {
        return null;
      }
      if (matchesPattern(id, exclude)) {
        return null;
      }
      if (!matchesPattern(id, include)) {
        return null;
      }
      if (!code.includes("<") || !code.includes(">")) {
        return null;
      }
      if (process.env.DEBUG_DEVTOOLS) {
        console.log(`[@bakdotdev/dev-tools] Processing: ${id}`);
      }
      if (vue && id.endsWith(".vue")) {
        return await transformVueFile(code, id, ignoreComponentNames);
      }
      if (angular && id.endsWith(".component.html")) {
        return transformAngularHtmlFile(code, id, ignoreComponentNames);
      }
      if (angular && id.endsWith(".component.ts") && code.includes("@Component")) {
        return transformAngularTsFile(code, id, ignoreComponentNames);
      }
      return transformJsxFile(code, id, ignoreComponentNames);
    }
  };
}
function transformAngularHtmlFile(code, id, ignoreComponentNames) {
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
function transformAngularTsFile(code, id, ignoreComponentNames) {
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
async function transformVueFile(code, id, ignoreComponentNames) {
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
function transformJsxFile(code, id, ignoreComponentNames) {
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
            onlyRemoveTypeImports: true
          }
        ]
      ],
      plugins: [
        [
          locatorPlugin,
          {
            dataAttribute: "path",
            ignoreComponentNames
          }
        ]
      ],
      retainLines: false,
      compact: false
    });
    if (!result || !result.code) {
      return null;
    }
    return {
      code: result.code,
      map: result.map
    };
  } catch (error) {
    console.warn(
      `[@bakdotdev/dev-tools] Failed to transform ${id}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}
var vite_plugin_default = devToolsPlugin;
export {
  vite_plugin_default as default,
  devToolsPlugin
};
//# sourceMappingURL=vite-plugin.js.map
