const SKIP_ELEMENTS = /* @__PURE__ */ new Set([
  "ng-container",
  "ng-template",
  "ng-content",
  "router-outlet"
]);
const VOID_ELEMENTS = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
function transformAngularTemplate(code, options) {
  const { filename, ignoreComponentNames = [] } = options;
  const tagRegex = /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^>]*)?)\s*(\/?)>/g;
  let result = "";
  let lastIndex = 0;
  let lineNumber = 1;
  let lineStart = 0;
  let modified = false;
  const lineBreaks = [0];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === "\n") {
      lineBreaks.push(i + 1);
    }
  }
  function getLineAndColumn(offset) {
    let line = 1;
    for (let i = 0; i < lineBreaks.length; i++) {
      if (lineBreaks[i] > offset) {
        break;
      }
      line = i + 1;
    }
    const column = offset - lineBreaks[line - 1];
    return { line, column };
  }
  let match;
  while ((match = tagRegex.exec(code)) !== null) {
    const [fullMatch, tagName, attributes, selfClosing] = match;
    const matchStart = match.index;
    if (SKIP_ELEMENTS.has(tagName.toLowerCase()) || ignoreComponentNames.includes(tagName)) {
      continue;
    }
    if (attributes && attributes.includes("data-locatorjs")) {
      continue;
    }
    if (tagName.startsWith("!")) {
      continue;
    }
    const { line, column } = getLineAndColumn(matchStart);
    const locatorValue = `${filename}:${line}:${column}`;
    const insertPos = matchStart + fullMatch.length - (selfClosing ? 2 : 1);
    result += code.slice(lastIndex, insertPos);
    result += ` data-locatorjs="${locatorValue}"`;
    result += code.slice(insertPos, matchStart + fullMatch.length);
    lastIndex = matchStart + fullMatch.length;
    modified = true;
  }
  if (!modified) {
    return null;
  }
  result += code.slice(lastIndex);
  return { code: result };
}
function transformAngularComponent(code, filename, options = {}) {
  const templateRegex = /template\s*:\s*(`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;
  let result = code;
  let modified = false;
  let offset = 0;
  let match;
  while ((match = templateRegex.exec(code)) !== null) {
    const [fullMatch, templateLiteral] = match;
    const matchStart = match.index + offset;
    const quote = templateLiteral[0];
    const templateContent = templateLiteral.slice(1, -1);
    const templateStartInFile = match.index + fullMatch.indexOf(templateLiteral) + 1;
    const transformed = transformAngularTemplate(templateContent, {
      filename,
      ignoreComponentNames: options.ignoreComponentNames
    });
    if (transformed) {
      const before = result.slice(0, matchStart + fullMatch.indexOf(templateLiteral));
      const after = result.slice(matchStart + fullMatch.indexOf(templateLiteral) + templateLiteral.length);
      const newTemplateLiteral = quote + transformed.code + quote;
      result = before + newTemplateLiteral + after;
      offset += newTemplateLiteral.length - templateLiteral.length;
      modified = true;
    }
  }
  if (!modified) {
    return null;
  }
  return { code: result };
}
function transformAngularFile(code, filename, options = {}) {
  if (filename.endsWith(".html")) {
    return transformAngularTemplate(code, { filename, ...options });
  }
  if (filename.endsWith(".ts") && code.includes("@Component")) {
    return transformAngularComponent(code, filename, options);
  }
  return null;
}
export {
  transformAngularComponent,
  transformAngularFile,
  transformAngularTemplate
};
//# sourceMappingURL=angular-transform.js.map
