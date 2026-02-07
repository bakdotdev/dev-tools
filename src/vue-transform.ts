/**
 * Vue SFC Template Transform
 *
 * Injects source location data into Vue template elements,
 * enabling click-to-source functionality.
 */

import type {
  ElementNode,
  RootNode,
  TemplateChildNode,
  AttributeNode,
} from "@vue/compiler-core";

export interface VueTransformOptions {
  filename: string;
  ignoreComponentNames?: string[];
}

const DISALLOWED_TAGS = new Set([
  "template",
  "slot",
  "component",
  "transition",
  "transition-group",
  "keep-alive",
  "teleport",
  "suspense",
]);

/**
 * Check if an element should be skipped
 */
function shouldSkipElement(
  tag: string,
  ignoreComponentNames: string[]
): boolean {
  if (DISALLOWED_TAGS.has(tag)) return true;
  if (ignoreComponentNames.includes(tag)) return true;
  // Skip Vue's built-in dynamic component
  if (tag === "Component") return true;
  return false;
}

/**
 * Transform a Vue template AST to inject source location attributes
 */
export function transformVueTemplate(
  ast: RootNode,
  options: VueTransformOptions
): void {
  const { filename, ignoreComponentNames = [] } = options;

  function traverse(node: TemplateChildNode): void {
    if (node.type === 1) {
      // NodeTypes.ELEMENT = 1
      const element = node as ElementNode;

      if (!shouldSkipElement(element.tag, ignoreComponentNames)) {
        // Check if already has data-locatorjs attribute
        const hasLocator = element.props.some(
          (prop) =>
            prop.type === 6 && // NodeTypes.ATTRIBUTE = 6
            prop.name === "data-locatorjs"
        );

        if (!hasLocator && element.loc) {
          // Create the locator attribute
          const locatorValue = `${filename}:${element.loc.start.line}:${element.loc.start.column}`;

          // Add the attribute to the element
          const locatorAttr: AttributeNode = {
            type: 6, // NodeTypes.ATTRIBUTE
            name: "data-locatorjs",
            value: {
              type: 2, // NodeTypes.TEXT
              content: locatorValue,
              loc: element.loc,
            },
            loc: element.loc,
            nameLoc: element.loc,
          };

          element.props.push(locatorAttr);
        }
      }

      // Traverse children
      if (element.children) {
        for (const child of element.children) {
          traverse(child);
        }
      }
    } else if (node.type === 11) {
      // NodeTypes.FOR = 11
      // Handle v-for nodes
      const forNode = node as any;
      if (forNode.children) {
        for (const child of forNode.children) {
          traverse(child);
        }
      }
    } else if (node.type === 9) {
      // NodeTypes.IF = 9
      // Handle v-if nodes
      const ifNode = node as any;
      if (ifNode.branches) {
        for (const branch of ifNode.branches) {
          if (branch.children) {
            for (const child of branch.children) {
              traverse(child);
            }
          }
        }
      }
    }
  }

  // Traverse all children of the root
  for (const child of ast.children) {
    traverse(child);
  }
}

/**
 * Transform Vue SFC source code to inject source locations
 *
 * This function parses a .vue file, transforms the template,
 * and returns the modified source.
 */
export async function transformVueSFC(
  code: string,
  filename: string,
  options: { ignoreComponentNames?: string[] } = {}
): Promise<{ code: string; map?: any } | null> {
  // Dynamic import to avoid requiring Vue as a hard dependency
  let parse: typeof import("@vue/compiler-sfc").parse;
  let compileTemplate: typeof import("@vue/compiler-sfc").compileTemplate;

  try {
    const sfc = await import("@vue/compiler-sfc");
    parse = sfc.parse;
    compileTemplate = sfc.compileTemplate;
  } catch {
    console.warn(
      "[@bakdotdev/dev-tools] @vue/compiler-sfc not found. Vue support disabled."
    );
    return null;
  }

  const { descriptor, errors } = parse(code, {
    filename,
    sourceMap: true,
  });

  if (errors.length > 0) {
    return null;
  }

  if (!descriptor.template) {
    return null;
  }

  const templateContent = descriptor.template.content;
  const templateStart = descriptor.template.loc.start.offset;

  // Parse the template to get the AST
  const { baseParse } = await import("@vue/compiler-core");
  const ast = baseParse(templateContent, {
    getTextMode: () => 0,
  });

  // Transform the AST
  transformVueTemplate(ast, {
    filename,
    ignoreComponentNames: options.ignoreComponentNames,
  });

  // We need to serialize the AST back to HTML
  // Since Vue doesn't provide a built-in serializer, we'll use string manipulation
  // based on source locations

  // Collect all insertions we need to make
  const insertions: Array<{ offset: number; content: string }> = [];

  function collectInsertions(node: TemplateChildNode): void {
    if (node.type === 1) {
      const element = node as ElementNode;

      // Find the data-locatorjs attribute we added
      const locatorAttr = element.props.find(
        (prop): prop is AttributeNode =>
          prop.type === 6 &&
          prop.name === "data-locatorjs" &&
          !!(prop as AttributeNode).value?.content?.startsWith(filename)
      ) as AttributeNode | undefined;

      if (locatorAttr && locatorAttr.value) {
        // Calculate where to insert the attribute (after the tag name)
        const tagEnd = element.loc.start.offset + 1 + element.tag.length;
        insertions.push({
          offset: tagEnd,
          content: ` data-locatorjs="${locatorAttr.value.content}"`,
        });
      }

      // Process children
      if (element.children) {
        for (const child of element.children) {
          collectInsertions(child);
        }
      }
    } else if (node.type === 11 || node.type === 9) {
      const structural = node as any;
      const children = structural.children || structural.branches?.flatMap((b: any) => b.children) || [];
      for (const child of children) {
        collectInsertions(child);
      }
    }
  }

  for (const child of ast.children) {
    collectInsertions(child);
  }

  // Sort insertions by offset in reverse order (so we can insert without affecting earlier offsets)
  insertions.sort((a, b) => b.offset - a.offset);

  // Apply insertions to the template
  let modifiedTemplate = templateContent;
  for (const insertion of insertions) {
    modifiedTemplate =
      modifiedTemplate.slice(0, insertion.offset) +
      insertion.content +
      modifiedTemplate.slice(insertion.offset);
  }

  // Reconstruct the full SFC with the modified template
  const before = code.slice(0, templateStart);
  const after = code.slice(templateStart + templateContent.length);
  const modifiedCode = before + modifiedTemplate + after;

  return {
    code: modifiedCode,
  };
}
