import { parseExpression } from "@babel/parser";
const disallowedNames = {
  Fragment: true,
  "React.Fragment": true,
  Suspense: true,
  "React.Suspense": true
};
const r3fPatterns = [
  /^mesh$/,
  /^group$/,
  /^fog$/,
  /^color$/,
  /^ambientLight$/,
  /^directionalLight$/,
  /^pointLight$/,
  /^spotLight$/,
  /Geometry$/,
  /Material$/,
  /Helper$/,
  /Controls$/,
  /Camera$/
];
function isDisallowedComponent(name) {
  if (disallowedNames[name]) return true;
  if (name.match(/Provider$/)) return true;
  for (const pattern of r3fPatterns) {
    if (pattern.test(name)) return true;
  }
  return false;
}
function transformLocatorJsComponents(babel) {
  const env = process.env.BABEL_ENV || process.env.NODE_ENV || "development";
  const t = babel.types;
  let fileStorage = null;
  let wrappingComponent = null;
  let lastComponentId = 0;
  let lastExpressionId = 0;
  let lastStyledId = 0;
  let currentWrappingComponentId = null;
  function addExpressionToStorage(expression) {
    if (fileStorage) {
      const id = lastExpressionId;
      fileStorage.expressions[id] = expression;
      lastExpressionId++;
      return id;
    } else {
      throw new Error("No fileStorage");
    }
  }
  function addStyledToStorage(styled) {
    if (fileStorage) {
      const id = lastStyledId;
      fileStorage.styledDefinitions[id] = styled;
      lastStyledId++;
      return id;
    } else {
      throw new Error("No fileStorage");
    }
  }
  function addComponentToStorage(component) {
    if (fileStorage) {
      const id = lastComponentId;
      fileStorage.components[id] = component;
      lastComponentId++;
      return id;
    } else {
      throw new Error("No fileStorage");
    }
  }
  return {
    visitor: {
      Program: {
        // TODO state is any, we should check if the state depends on webpack or what it depends on?
        enter(path, state) {
          function isLocallyDisallowedComponent(name) {
            const opts = state?.opts?.ignoreComponentNames || [];
            return opts.includes(name);
          }
          if (state.opts?.env) {
            if (state.opts?.env !== env) {
              return;
            }
          }
          lastComponentId = 0;
          lastExpressionId = 0;
          lastStyledId = 0;
          if (!state?.filename) {
            throw new Error("No file name");
          }
          if (state.filename.includes("node_modules")) {
            fileStorage = null;
          } else {
            const isWithinCwd = state.filename.startsWith(state.cwd);
            fileStorage = {
              // If file is within cwd, make it relative; otherwise keep absolute path
              filePath: isWithinCwd ? state.filename.replace(state.cwd, "") : state.filename,
              // Only set projectPath if file is within cwd
              projectPath: isWithinCwd ? state.cwd : "",
              expressions: [],
              styledDefinitions: [],
              components: []
            };
          }
          path.traverse({
            // TODO add also for arrow function and class components
            FunctionDeclaration: {
              enter(path2, state2) {
                if (!fileStorage) {
                  return;
                }
                if (!path2 || !path2.node || !path2.node.id || !path2.node.loc) {
                  return;
                }
                const name = path2.node.id.name;
                wrappingComponent = {
                  name,
                  locString: path2.node.loc.start.line + ":" + path2.node.loc.start.column,
                  loc: path2.node.loc
                };
                currentWrappingComponentId = addComponentToStorage(wrappingComponent);
              },
              exit(path2, state2) {
                if (!fileStorage) {
                  return;
                }
                if (!path2 || !path2.node || !path2.node.id || !path2.node.loc) {
                  return;
                }
                const name = path2.node.id.name;
                if (wrappingComponent && wrappingComponent.name === name && wrappingComponent.locString === path2.node.loc.start.line + ":" + path2.node.loc.start.column) {
                  wrappingComponent = null;
                }
              }
            },
            TaggedTemplateExpression(path2) {
              if (!fileStorage) {
                return;
              }
              const tag = path2.node.tag;
              if (tag.type === "MemberExpression") {
                const property = tag.property;
                const object = tag.object;
                if (object.type === "Identifier" && object.name === "styled" && property.type === "Identifier") {
                  let name = null;
                  const parent = path2.parent;
                  if (parent.type === "VariableDeclarator") {
                    if (parent.id.type === "Identifier") {
                      name = parent.id.name;
                    }
                  }
                  if (path2.node.loc) {
                    const id = addStyledToStorage({
                      name,
                      loc: path2.node.loc,
                      htmlTag: property.name
                    });
                    path2.node.tag = t.callExpression(
                      t.memberExpression(tag, t.identifier("attrs")),
                      [
                        t.arrowFunctionExpression(
                          [],
                          t.objectExpression([
                            t.objectProperty(
                              t.stringLiteral("data-locatorjs-styled"),
                              t.stringLiteral(createDataId(fileStorage, id))
                            )
                          ])
                        )
                      ]
                    );
                  }
                }
              }
            },
            JSXElement(path2) {
              if (!fileStorage) {
                return;
              }
              function getName(el) {
                if (el.type === "JSXIdentifier") {
                  return el.name;
                } else if (el.type === "JSXMemberExpression") {
                  return getName(el.object) + "." + el.property.name;
                } else if (el.type === "JSXNamespacedName") {
                  return el.namespace.name + "." + el.name.name;
                }
                return "";
              }
              const name = getName(path2.node.openingElement.name);
              if (name && !isDisallowedComponent(name) && !isLocallyDisallowedComponent(name)) {
                if (path2.node.loc) {
                  const dataAttributeMode = state?.opts?.dataAttribute || "id";
                  const id = addExpressionToStorage({
                    name,
                    loc: path2.node.loc,
                    wrappingComponentId: currentWrappingComponentId
                  });
                  let newAttr;
                  if (dataAttributeMode === "path") {
                    newAttr = t.jSXAttribute(
                      t.jSXIdentifier("data-locatorjs"),
                      t.jSXExpressionContainer(
                        t.stringLiteral(
                          createFullPathWithLocation(fileStorage, path2.node.loc)
                        )
                      )
                    );
                  } else {
                    newAttr = t.jSXAttribute(
                      t.jSXIdentifier("data-locatorjs-id"),
                      t.jSXExpressionContainer(
                        t.stringLiteral(
                          // this is stored by projectPath+filePath because that's the only unique identifier
                          createDataId(fileStorage, id)
                        )
                        // t.ObjectExpression([
                        // ])
                      )
                    );
                  }
                  path2.node.openingElement.attributes.push(newAttr);
                }
              }
            }
          });
        },
        exit(path, state) {
          if (state.opts?.env) {
            if (state.opts.env !== env) {
              return;
            }
          }
          if (!fileStorage) {
            return;
          }
          const dataCode = JSON.stringify(fileStorage);
          const dataAst = parseExpression(dataCode, {
            sourceType: "script"
          });
          const insertCode = `(() => {
            if (typeof window !== "undefined") {
              window.__LOCATOR_DATA__ = window.__LOCATOR_DATA__ || {};
              window.__LOCATOR_DATA__["${createFullPath(
            fileStorage
          )}"] = ${dataCode};
            }
          })()`;
          const insertAst = parseExpression(insertCode, {
            sourceType: "script"
          });
          path.node.body.push(t.expressionStatement(insertAst));
        }
      }
    }
  };
}
function createDataId(fileStorage, id) {
  return createFullPath(fileStorage) + "::" + String(id);
}
function createFullPath(fileStorage) {
  return fileStorage.projectPath + fileStorage.filePath;
}
function createFullPathWithLocation(fileStorage, loc) {
  return `${fileStorage.projectPath}${fileStorage.filePath}:${loc.start.line}:${loc.start.column}`;
}
export {
  transformLocatorJsComponents as default
};
//# sourceMappingURL=index.js.map
