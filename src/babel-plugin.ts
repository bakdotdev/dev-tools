/**
 * Babel Plugin: Source Location Injector
 *
 * This plugin injects source file location data into JSX elements,
 * enabling the ClickToSource component to open source files in editors.
 *
 * Usage in next.config.js:
 * ```js
 * const nextConfig = {
 *   experimental: {
 *     babel: {
 *       plugins: process.env.NODE_ENV === "development"
 *         ? ["@bakdotdev/dev-tools/babel-plugin"]
 *         : [],
 *     },
 *   },
 * };
 * ```
 */

import type { PluginObj, NodePath, types as t } from "@babel/core";
import type { JSXOpeningElement } from "@babel/types";

interface PluginOptions {
  /**
   * Only inject into elements matching these tag names
   * If not specified, injects into all elements
   */
  includeElements?: string[];

  /**
   * Exclude these tag names (e.g., Fragment, React.Fragment)
   * @default ["Fragment", "React.Fragment", "Suspense", "React.Suspense"]
   */
  excludeElements?: string[];

  /**
   * Only inject into the first N elements per file to reduce bundle bloat
   * @default undefined (no limit)
   */
  maxElementsPerFile?: number;
}

const DEFAULT_EXCLUDED_ELEMENTS = [
  "Fragment",
  "React.Fragment",
  "Suspense",
  "React.Suspense",
  "StrictMode",
  "React.StrictMode",
  "Profiler",
  "React.Profiler",
];

export default function sourceLocationPlugin({
  types: t,
}: {
  types: typeof import("@babel/types");
}): PluginObj {
  return {
    name: "source-location",
    visitor: {
      Program: {
        enter(_path, state) {
          // Track element count per file
          (state as { elementCount?: number }).elementCount = 0;
        },
      },
      JSXOpeningElement(
        path: NodePath<JSXOpeningElement>,
        state: {
          filename?: string;
          opts?: PluginOptions;
          elementCount?: number;
        }
      ) {
        // Skip if no filename available
        if (!state.filename) return;

        // Skip node_modules
        if (state.filename.includes("node_modules")) return;

        // Skip .next build directory
        if (state.filename.includes(".next")) return;

        const { node } = path;
        const { loc } = node;

        if (!loc) return;

        // Get element name
        const elementName = getElementName(node.name);

        // Skip excluded elements
        const excludeElements =
          state.opts?.excludeElements ?? DEFAULT_EXCLUDED_ELEMENTS;
        if (excludeElements.includes(elementName)) return;

        // Check includeElements if specified
        if (
          state.opts?.includeElements &&
          !state.opts.includeElements.includes(elementName)
        ) {
          return;
        }

        // Check max elements per file
        if (
          state.opts?.maxElementsPerFile !== undefined &&
          (state.elementCount ?? 0) >= state.opts.maxElementsPerFile
        ) {
          return;
        }
        state.elementCount = (state.elementCount ?? 0) + 1;

        // Skip if already has source attributes (avoid double-injection)
        const hasSourceAttr = node.attributes.some(
          (attr) =>
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === "data-source-file"
        );
        if (hasSourceAttr) return;

        // Inject source location attributes
        node.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier("data-source-file"),
            t.stringLiteral(state.filename)
          ),
          t.jsxAttribute(
            t.jsxIdentifier("data-source-line"),
            t.stringLiteral(String(loc.start.line))
          ),
          t.jsxAttribute(
            t.jsxIdentifier("data-source-column"),
            t.stringLiteral(String(loc.start.column))
          )
        );
      },
    },
  };
}

/**
 * Get the element name from a JSX element name node
 */
function getElementName(
  name:
    | import("@babel/types").JSXIdentifier
    | import("@babel/types").JSXMemberExpression
    | import("@babel/types").JSXNamespacedName
): string {
  if ("name" in name && typeof name.name === "string") {
    return name.name;
  }
  if ("object" in name && "property" in name) {
    // JSXMemberExpression like React.Fragment
    const obj = getElementName(
      name.object as import("@babel/types").JSXIdentifier
    );
    const prop = getElementName(
      name.property as import("@babel/types").JSXIdentifier
    );
    return `${obj}.${prop}`;
  }
  return "";
}
