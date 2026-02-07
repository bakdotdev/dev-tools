// src/overlay-core.ts
var COLOR_PURPLE_50 = "#715CC7";
var COLOR_PURPLE_100 = "#5244A3";
var COLOR_PURPLE_0 = "#EDE8F5";
var COLOR_ORANGE_50 = "#E57A2E";
var COLOR_ORANGE_100 = "#B35D1C";
var COLOR_ORANGE_0 = "#FEF3E8";
var COLOR_GREEN_50 = "#47B379";
var COLOR_GREEN_100 = "#2D7A52";
var COLOR_GREEN_0 = "#E8F5ED";
var COLOR_BLUE_50 = "#4A8FD4";
var COLOR_BLUE_100 = "#3468A0";
var COLOR_BLUE_0 = "#E8F0F8";
var HIGHLIGHT_ENABLED_KEY = "cts_highlight_enabled";
var CURSOR_STYLE_ID = "cts-hide-cursor";
var OVERLAY_CONTAINER_ID = "cts-overlay-container";
function getAccentColor(mode, targetLevel) {
  if (mode === "copy" && targetLevel === "parent") return COLOR_GREEN_50;
  if (mode === "copy") return COLOR_ORANGE_50;
  if (targetLevel === "parent") return COLOR_BLUE_50;
  return COLOR_PURPLE_50;
}
function getAccentColor100(mode, targetLevel) {
  if (mode === "copy" && targetLevel === "parent") return COLOR_GREEN_100;
  if (mode === "copy") return COLOR_ORANGE_100;
  if (targetLevel === "parent") return COLOR_BLUE_100;
  return COLOR_PURPLE_100;
}
function getAccentColor0(mode, targetLevel) {
  if (mode === "copy" && targetLevel === "parent") return COLOR_GREEN_0;
  if (mode === "copy") return COLOR_ORANGE_0;
  if (targetLevel === "parent") return COLOR_BLUE_0;
  return COLOR_PURPLE_0;
}
var ClickToSourceOverlay = class {
  constructor(options = {}) {
    this.isActive = false;
    this.mode = "editor";
    this.targetLevel = "element";
    this.hoveredElement = null;
    this.mousePos = { x: 0, y: 0 };
    this.metaDown = false;
    this.ctrlDown = false;
    this.altDown = false;
    this.container = null;
    this.editorProtocol = options.editorProtocol ?? "vscode";
    this.onActivate = options.onActivate;
    this.onDeactivate = options.onDeactivate;
    const stored = localStorage.getItem(HIGHLIGHT_ENABLED_KEY);
    this.highlightEnabled = stored === null ? true : stored === "true";
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundClick = this.handleClick.bind(this);
    this.boundBlur = this.handleBlur.bind(this);
  }
  mount() {
    this.createContainer();
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
    window.addEventListener("mousemove", this.boundMouseMove, { passive: true });
    document.addEventListener("click", this.boundClick, true);
    document.addEventListener("contextmenu", this.boundClick, true);
    window.addEventListener("blur", this.boundBlur);
  }
  unmount() {
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    window.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("click", this.boundClick, true);
    document.removeEventListener("contextmenu", this.boundClick, true);
    window.removeEventListener("blur", this.boundBlur);
    this.removeContainer();
    this.showCursor();
  }
  setEditorProtocol(protocol) {
    this.editorProtocol = protocol;
  }
  createContainer() {
    if (this.container) return;
    this.container = document.createElement("div");
    this.container.id = OVERLAY_CONTAINER_ID;
    this.container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:999998;";
    document.body.appendChild(this.container);
  }
  removeContainer() {
    this.container?.remove();
    this.container = null;
  }
  hideCursor() {
    if (!document.getElementById(CURSOR_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = CURSOR_STYLE_ID;
      style.textContent = "* { cursor: none !important; }";
      document.head.appendChild(style);
    }
  }
  showCursor() {
    document.getElementById(CURSOR_STYLE_ID)?.remove();
  }
  handleKeyDown(e) {
    if (e.key === "Meta") this.metaDown = true;
    if (e.key === "Control") this.ctrlDown = true;
    if (e.key === "Alt") this.altDown = true;
    this.updateState();
  }
  handleKeyUp(e) {
    if (e.key === "Meta") this.metaDown = false;
    if (e.key === "Control") this.ctrlDown = false;
    if (e.key === "Alt") this.altDown = false;
    this.updateState();
  }
  handleMouseMove(e) {
    this.mousePos = { x: e.clientX, y: e.clientY };
    if (this.isActive && this.highlightEnabled) {
      this.hoveredElement = e.target;
      this.render();
    }
  }
  handleBlur() {
    this.metaDown = false;
    this.ctrlDown = false;
    this.altDown = false;
    this.deactivate();
  }
  handleClick(e) {
    if (!this.highlightEnabled || !this.metaDown && !this.ctrlDown) return;
    const target = e.target ?? this.hoveredElement;
    if (!target) return;
    if (target.closest("[data-cts-toggle]")) return;
    const skip = this.altDown ? 1 : 0;
    const locations = this.getAllSourceLocations(target);
    const locationWithElement = locations[skip] ?? locations[locations.length - 1];
    if (!locationWithElement) return;
    e.preventDefault();
    e.stopPropagation();
    const sourceLocation = {
      file: locationWithElement.file,
      line: locationWithElement.line,
      column: locationWithElement.column
    };
    if (this.metaDown) {
      const snippet = this.getLLMSnippet(locationWithElement.element, sourceLocation);
      navigator.clipboard.writeText(snippet);
      console.log("[ClickToSource] Copied to clipboard:\n", snippet);
    } else {
      this.openInEditor(sourceLocation);
    }
  }
  updateState() {
    const active = this.metaDown || this.ctrlDown;
    if (active && !this.isActive) {
      this.isActive = true;
      this.mode = this.metaDown ? "copy" : "editor";
      this.targetLevel = this.altDown ? "parent" : "element";
      if (this.highlightEnabled) {
        this.hideCursor();
        const el = document.elementFromPoint(this.mousePos.x, this.mousePos.y);
        if (el) this.hoveredElement = el;
      }
      this.onActivate?.();
      this.render();
    } else if (!active && this.isActive) {
      this.deactivate();
    } else if (active) {
      this.mode = this.metaDown ? "copy" : "editor";
      this.targetLevel = this.altDown ? "parent" : "element";
      this.render();
    }
  }
  deactivate() {
    this.isActive = false;
    this.mode = "editor";
    this.targetLevel = "element";
    this.showCursor();
    this.onDeactivate?.();
    this.render();
  }
  toggleHighlight() {
    this.highlightEnabled = !this.highlightEnabled;
    localStorage.setItem(HIGHLIGHT_ENABLED_KEY, String(this.highlightEnabled));
    this.render();
  }
  render() {
    if (!this.container) return;
    if (!this.isActive) {
      this.container.innerHTML = "";
      return;
    }
    const { x, y } = this.mousePos;
    const color = getAccentColor(this.mode, this.targetLevel);
    let html = "";
    if (this.highlightEnabled) {
      html += `
        <div style="position:absolute;left:${x}px;top:0;width:1px;height:100vh;background:${color};opacity:0.6;"></div>
        <div style="position:absolute;left:0;top:${y}px;width:100vw;height:1px;background:${color};opacity:0.6;"></div>
      `;
    }
    if (this.highlightEnabled && this.hoveredElement) {
      const skip = this.targetLevel === "parent" ? 1 : 0;
      const locations = this.getAllSourceLocations(this.hoveredElement);
      const loc = locations[skip] ?? locations[locations.length - 1];
      if (loc) {
        const rect = loc.element.getBoundingClientRect();
        const highlightBg = `color-mix(in oklch, ${color} 14%, transparent)`;
        const color100 = getAccentColor100(this.mode, this.targetLevel);
        const color0 = getAccentColor0(this.mode, this.targetLevel);
        let modeLabel = this.targetLevel === "parent" ? "Parent" : "Element";
        if (this.mode === "copy") modeLabel += " + Copy";
        const tagInfo = loc.element.tagName.toLowerCase() + (loc.element.id ? `#${loc.element.id}` : "") + (loc.element.className && typeof loc.element.className === "string" ? `.${loc.element.className.split(" ")[0]}` : "");
        const filePath = `${loc.file.split("/").slice(-2).join("/")}:${loc.line}`;
        html += `
          <div style="position:absolute;top:${rect.top}px;left:${rect.left}px;transform:translateY(-100%);background:${color};color:white;font-size:12px;font-family:monospace;line-height:1;padding:4px 6px;border-radius:3px 3px 0 0;display:flex;align-items:center;gap:4px;">
            <span>${tagInfo}</span>
            <span style="opacity:0.5;">|</span>
            <span>${modeLabel}</span>
          </div>
          <div style="position:absolute;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;border:2px solid ${color};background:${highlightBg};border-radius:0 4px 4px 4px;"></div>
          <div style="position:absolute;top:${rect.bottom}px;left:${rect.left}px;background:${color100};color:${color0};font-size:12px;font-family:monospace;line-height:1;padding:4px 6px;border-radius:0 0 3px 3px;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${filePath}
          </div>
        `;
      }
    }
    html += this.renderInstructions();
    this.container.innerHTML = html;
    const toggleBtn = this.container.querySelector("[data-cts-toggle]");
    if (toggleBtn) {
      toggleBtn.style.pointerEvents = "auto";
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleHighlight();
      });
    }
  }
  renderInstructions() {
    const shortcuts = [
      { keys: ["\u2303", "Click"], action: "Open in editor", color: COLOR_PURPLE_50, active: this.isActive && this.mode === "editor" && this.targetLevel === "element" },
      { keys: ["\u2303", "\u2325", "Click"], action: "Open parent in editor", color: COLOR_BLUE_50, active: this.isActive && this.mode === "editor" && this.targetLevel === "parent" },
      { keys: ["\u2318", "Click"], action: "Copy snippet", color: COLOR_ORANGE_50, active: this.isActive && this.mode === "copy" && this.targetLevel === "element" },
      { keys: ["\u2318", "\u2325", "Click"], action: "Copy parent snippet", color: COLOR_GREEN_50, active: this.isActive && this.mode === "copy" && this.targetLevel === "parent" }
    ];
    const shortcutHtml = shortcuts.map((s) => {
      const keysHtml = s.keys.map((key) => `
        <kbd style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:600;line-height:1;display:inline-flex;align-items:center;justify-content:center;height:20px;${key === "Click" ? "padding-left:6px;padding-right:6px;" : "width:20px;"}text-align:center;background-color:${s.active ? s.color : "rgba(255,255,255,0.12)"};color:${s.active ? "white" : "rgba(255,255,255,0.55)"};border-radius:2px;border:1px solid ${s.active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"};transition:background-color 0.15s,color 0.15s;">
          ${key}
        </kbd>
      `).join("");
      return `
        <div style="display:flex;align-items:center;gap:6px;padding:2px 4px 2px 2px;border-radius:4px;background-color:${s.active ? "rgba(255,255,255,0.1)" : "transparent"};transition:background-color 0.15s;">
          <div style="display:flex;align-items:center;gap:3px;">${keysHtml}</div>
          <span style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:500;color:${s.active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)"};white-space:nowrap;transition:color 0.15s;">
            ${s.action}
          </span>
        </div>
      `;
    }).join("");
    const toggleKnobLeft = this.highlightEnabled ? 16 : 2;
    const toggleBg = this.highlightEnabled ? COLOR_PURPLE_50 : "rgba(255,255,255,0.15)";
    return `
      <div style="position:fixed;bottom:8px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;align-items:center;gap:6px;">
        <div style="display:flex;gap:4px;padding:4px;background-color:rgba(0,0,0,0.85);border-radius:10px;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:none;opacity:${this.highlightEnabled ? 1 : 0.5};transition:opacity 0.15s;">
          ${shortcutHtml}
        </div>
        <button data-cts-toggle style="display:flex;align-items:center;justify-content:center;padding:4px;border-radius:10px;border:none;background-color:rgba(0,0,0,0.85);backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.3);cursor:pointer;pointer-events:auto;" title="${this.highlightEnabled ? "Disable highlighting" : "Enable highlighting"}">
          <div style="position:relative;width:28px;height:14px;border-radius:7px;background-color:${toggleBg};transition:background-color 0.15s;">
            <div style="position:absolute;top:2px;left:${toggleKnobLeft}px;width:10px;height:10px;border-radius:5px;background-color:white;transition:left 0.15s;"></div>
          </div>
        </button>
      </div>
    `;
  }
  parseLocatorJsAttribute(value) {
    const parts = value.split(":");
    if (parts.length < 3) return null;
    const column = parseInt(parts.pop(), 10);
    const line = parseInt(parts.pop(), 10);
    const file = parts.join(":");
    if (isNaN(line) || !file) return null;
    return { file, line, column: isNaN(column) ? 0 : column };
  }
  getAllSourceLocations(element) {
    const locations = [];
    let current = element;
    while (current) {
      const dataset = current.dataset;
      if (dataset) {
        const locatorjs = dataset.locatorjs;
        if (locatorjs) {
          const parsed = this.parseLocatorJsAttribute(locatorjs);
          if (parsed) {
            locations.push({ ...parsed, element: current });
          }
        } else {
          const file = dataset.sourceFile;
          const line = dataset.sourceLine;
          const column = dataset.sourceColumn;
          if (file && line) {
            locations.push({
              file,
              line: parseInt(line, 10),
              column: column ? parseInt(column, 10) : 0,
              element: current
            });
          }
        }
      }
      current = current.parentElement;
    }
    return locations;
  }
  cleanElement(element) {
    const clone = element.cloneNode(true);
    const removeSourceAttrs = (el) => {
      el.removeAttribute("data-locatorjs");
      el.removeAttribute("data-locatorjs-id");
      el.removeAttribute("data-locatorjs-styled");
      el.removeAttribute("data-source-file");
      el.removeAttribute("data-source-line");
      el.removeAttribute("data-source-column");
      Array.from(el.children).forEach(removeSourceAttrs);
    };
    removeSourceAttrs(clone);
    return clone;
  }
  formatHTML(html, indent = 2) {
    let formatted = "";
    let level = 0;
    const pad = () => " ".repeat(level * indent);
    html.replace(/></g, ">\n<").split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith("</")) {
        level = Math.max(0, level - 1);
      }
      formatted += pad() + trimmed + "\n";
      if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>") && !trimmed.includes("</")) {
        level++;
      }
    });
    return formatted.trim();
  }
  getLLMSnippet(element, sourceLocation) {
    const cleaned = this.cleanElement(element);
    const formatted = this.formatHTML(cleaned.outerHTML);
    const location = `${sourceLocation.file}:${sourceLocation.line}:${sourceLocation.column}`;
    return `<code source="${location}">
${formatted}
</code>`;
  }
  openInEditor(sourceLocation) {
    const { file, line, column } = sourceLocation;
    let url;
    switch (this.editorProtocol) {
      case "vscode":
      case "cursor":
        url = `${this.editorProtocol}://file/${file}:${line}:${column}`;
        break;
      case "zed":
        url = `zed://file${file}:${line}:${column}`;
        break;
      default:
        url = `vscode://file/${file}:${line}:${column}`;
    }
    const link = document.createElement("a");
    link.href = url;
    link.click();
  }
};

// src/index.ts
var globalOverlay = null;
function initClickToSource(options = {}) {
  if (typeof window === "undefined") {
    return () => {
    };
  }
  if (false) {
    return () => {
    };
  }
  if (globalOverlay) {
    if (options.editorProtocol) {
      globalOverlay.setEditorProtocol(options.editorProtocol);
    }
    return () => {
      globalOverlay?.unmount();
      globalOverlay = null;
    };
  }
  globalOverlay = new ClickToSourceOverlay(options);
  globalOverlay.mount();
  return () => {
    globalOverlay?.unmount();
    globalOverlay = null;
  };
}
function setEditorProtocol(protocol) {
  globalOverlay?.setEditorProtocol(protocol);
}
function isOverlayActive() {
  return globalOverlay !== null;
}
if (typeof window !== "undefined" && true) {
  setTimeout(() => {
    if (!globalOverlay) {
      initClickToSource();
    }
  }, 0);
}
export {
  ClickToSourceOverlay,
  initClickToSource,
  isOverlayActive,
  setEditorProtocol
};
//# sourceMappingURL=index.js.map
