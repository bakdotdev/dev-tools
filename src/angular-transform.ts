/**
 * Angular Template Transform
 *
 * Injects source location data into Angular template elements,
 * enabling click-to-source functionality.
 *
 * Supports:
 * - External templates (.component.html files)
 * - Inline templates in .component.ts files
 */

export interface AngularTransformOptions {
  filename: string;
  ignoreComponentNames?: string[];
}

// Elements to skip (Angular structural directives, ng-container, etc.)
const SKIP_ELEMENTS = new Set([
  "ng-container",
  "ng-template",
  "ng-content",
  "router-outlet",
]);

// Self-closing HTML elements
const VOID_ELEMENTS = new Set([
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
  "wbr",
]);

/**
 * Transform an Angular HTML template to inject source locations
 */
export function transformAngularTemplate(
  code: string,
  options: AngularTransformOptions
): { code: string; map?: any } | null {
  const { filename, ignoreComponentNames = [] } = options;

  // Simple regex-based approach for Angular templates
  // Matches opening tags: <tagName ...>
  const tagRegex = /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^>]*)?)\s*(\/?)>/g;

  let result = "";
  let lastIndex = 0;
  let lineNumber = 1;
  let lineStart = 0;
  let modified = false;

  // Build a line map for calculating line numbers
  const lineBreaks: number[] = [0];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === "\n") {
      lineBreaks.push(i + 1);
    }
  }

  function getLineAndColumn(offset: number): { line: number; column: number } {
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

    // Skip elements we shouldn't modify
    if (
      SKIP_ELEMENTS.has(tagName.toLowerCase()) ||
      ignoreComponentNames.includes(tagName)
    ) {
      continue;
    }

    // Skip if already has data-locatorjs
    if (attributes && attributes.includes("data-locatorjs")) {
      continue;
    }

    // Skip comments
    if (tagName.startsWith("!")) {
      continue;
    }

    // Calculate line and column
    const { line, column } = getLineAndColumn(matchStart);
    const locatorValue = `${filename}:${line}:${column}`;

    // Determine where to insert the attribute
    // Insert before the closing > or />
    const insertPos = matchStart + fullMatch.length - (selfClosing ? 2 : 1);

    // Build the new code
    result += code.slice(lastIndex, insertPos);
    result += ` data-locatorjs="${locatorValue}"`;
    result += code.slice(insertPos, matchStart + fullMatch.length);

    lastIndex = matchStart + fullMatch.length;
    modified = true;
  }

  if (!modified) {
    return null;
  }

  // Append remaining code
  result += code.slice(lastIndex);

  return { code: result };
}

/**
 * Transform an Angular component file with inline template
 */
export function transformAngularComponent(
  code: string,
  filename: string,
  options: { ignoreComponentNames?: string[] } = {}
): { code: string; map?: any } | null {
  // Find inline template in @Component decorator
  // Matches: template: `...` or template: '...' or template: "..."
  const templateRegex =
    /template\s*:\s*(`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;

  let result = code;
  let modified = false;
  let offset = 0;

  let match;
  while ((match = templateRegex.exec(code)) !== null) {
    const [fullMatch, templateLiteral] = match;
    const matchStart = match.index + offset;

    // Extract template content (remove quotes/backticks)
    const quote = templateLiteral[0];
    const templateContent = templateLiteral.slice(1, -1);

    // Calculate the offset where the template content starts in the original file
    const templateStartInFile = match.index + fullMatch.indexOf(templateLiteral) + 1;

    // Transform the template
    const transformed = transformAngularTemplate(templateContent, {
      filename,
      ignoreComponentNames: options.ignoreComponentNames,
    });

    if (transformed) {
      // Reconstruct with the transformed template
      const before = result.slice(0, matchStart + fullMatch.indexOf(templateLiteral));
      const after = result.slice(matchStart + fullMatch.indexOf(templateLiteral) + templateLiteral.length);

      const newTemplateLiteral = quote + transformed.code + quote;
      result = before + newTemplateLiteral + after;

      // Adjust offset for subsequent matches
      offset += newTemplateLiteral.length - templateLiteral.length;
      modified = true;
    }
  }

  if (!modified) {
    return null;
  }

  return { code: result };
}

/**
 * Transform Angular files (both .html templates and .ts components)
 */
export function transformAngularFile(
  code: string,
  filename: string,
  options: { ignoreComponentNames?: string[] } = {}
): { code: string; map?: any } | null {
  if (filename.endsWith(".html")) {
    return transformAngularTemplate(code, { filename, ...options });
  }

  if (filename.endsWith(".ts") && code.includes("@Component")) {
    return transformAngularComponent(code, filename, options);
  }

  return null;
}
