const DISALLOWED_TAGS = /* @__PURE__ */ new Set([
  "template",
  "slot",
  "component",
  "transition",
  "transition-group",
  "keep-alive",
  "teleport",
  "suspense"
]);
function shouldSkipElement(tag, ignoreComponentNames) {
  if (DISALLOWED_TAGS.has(tag)) return true;
  if (ignoreComponentNames.includes(tag)) return true;
  if (tag === "Component") return true;
  return false;
}
function transformVueTemplate(ast, options) {
  const { filename, ignoreComponentNames = [] } = options;
  function traverse(node) {
    if (node.type === 1) {
      const element = node;
      if (!shouldSkipElement(element.tag, ignoreComponentNames)) {
        const hasLocator = element.props.some(
          (prop) => prop.type === 6 && // NodeTypes.ATTRIBUTE = 6
          prop.name === "data-locatorjs"
        );
        if (!hasLocator && element.loc) {
          const locatorValue = `${filename}:${element.loc.start.line}:${element.loc.start.column}`;
          const locatorAttr = {
            type: 6,
            // NodeTypes.ATTRIBUTE
            name: "data-locatorjs",
            value: {
              type: 2,
              // NodeTypes.TEXT
              content: locatorValue,
              loc: element.loc
            },
            loc: element.loc,
            nameLoc: element.loc
          };
          element.props.push(locatorAttr);
        }
      }
      if (element.children) {
        for (const child of element.children) {
          traverse(child);
        }
      }
    } else if (node.type === 11) {
      const forNode = node;
      if (forNode.children) {
        for (const child of forNode.children) {
          traverse(child);
        }
      }
    } else if (node.type === 9) {
      const ifNode = node;
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
  for (const child of ast.children) {
    traverse(child);
  }
}
async function transformVueSFC(code, filename, options = {}) {
  let parse;
  let compileTemplate;
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
    sourceMap: true
  });
  if (errors.length > 0) {
    return null;
  }
  if (!descriptor.template) {
    return null;
  }
  const templateContent = descriptor.template.content;
  const templateStart = descriptor.template.loc.start.offset;
  const { baseParse } = await import("@vue/compiler-core");
  const ast = baseParse(templateContent, {
    getTextMode: () => 0
  });
  transformVueTemplate(ast, {
    filename,
    ignoreComponentNames: options.ignoreComponentNames
  });
  const insertions = [];
  function collectInsertions(node) {
    if (node.type === 1) {
      const element = node;
      const locatorAttr = element.props.find(
        (prop) => prop.type === 6 && prop.name === "data-locatorjs" && !!prop.value?.content?.startsWith(filename)
      );
      if (locatorAttr && locatorAttr.value) {
        const tagEnd = element.loc.start.offset + 1 + element.tag.length;
        insertions.push({
          offset: tagEnd,
          content: ` data-locatorjs="${locatorAttr.value.content}"`
        });
      }
      if (element.children) {
        for (const child of element.children) {
          collectInsertions(child);
        }
      }
    } else if (node.type === 11 || node.type === 9) {
      const structural = node;
      const children = structural.children || structural.branches?.flatMap((b) => b.children) || [];
      for (const child of children) {
        collectInsertions(child);
      }
    }
  }
  for (const child of ast.children) {
    collectInsertions(child);
  }
  insertions.sort((a, b) => b.offset - a.offset);
  let modifiedTemplate = templateContent;
  for (const insertion of insertions) {
    modifiedTemplate = modifiedTemplate.slice(0, insertion.offset) + insertion.content + modifiedTemplate.slice(insertion.offset);
  }
  const before = code.slice(0, templateStart);
  const after = code.slice(templateStart + templateContent.length);
  const modifiedCode = before + modifiedTemplate + after;
  return {
    code: modifiedCode
  };
}
export {
  transformVueSFC,
  transformVueTemplate
};
//# sourceMappingURL=vue-transform.js.map
