"use client";

// src/Overlay.tsx
import { useEffect as useEffect2, useState as useState2, useCallback as useCallback2, useRef } from "react";

// src/DevToolsProvider.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import { jsx } from "react/jsx-runtime";
var defaultLayoutOverlayConfig = {
  showFlex: true,
  showGrid: true,
  showPositioned: false,
  showOverflow: false,
  showDataAttributes: true,
  minWidth: 50,
  minHeight: 50,
  showPadding: true,
  showMargin: true
};
var DevToolsContext = createContext(
  void 0
);
var DOMAIN_STORAGE_KEY = "dev-tools-domain";
var DEBUG_STORAGE_KEY = "dev-tools-debug";
var CLICK_TO_SOURCE_STORAGE_KEY = "dev-tools-click-to-source";
function DevToolsProvider({
  children,
  app = "app",
  defaultDomain = "marketing"
}) {
  const isDevelopment = true;
  const [domain, setDomainState] = useState(defaultDomain);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showDataIds, setShowDataIds] = useState(false);
  const [showLayoutOverlay, setShowLayoutOverlay] = useState(false);
  const [layoutOverlayConfig, setLayoutOverlayConfig] = useState(defaultLayoutOverlayConfig);
  const [clickLogging, setClickLogging] = useState(isDevelopment);
  const [clickToSourceEnabled, setClickToSourceEnabled] = useState(true);
  useEffect(() => {
    try {
      const storedDomain = localStorage.getItem(DOMAIN_STORAGE_KEY);
      if (storedDomain && ["product", "marketing", "sui"].includes(storedDomain)) {
        setDomainState(storedDomain);
      }
      const storedDebug = localStorage.getItem(DEBUG_STORAGE_KEY);
      if (storedDebug === "true") {
        setDebugEnabled(true);
      }
      const storedClickToSource = localStorage.getItem(CLICK_TO_SOURCE_STORAGE_KEY);
      if (storedClickToSource === "false") {
        setClickToSourceEnabled(false);
      }
    } catch {
    }
  }, []);
  const setDomain = useCallback((newDomain) => {
    setDomainState(newDomain);
    try {
      localStorage.setItem(DOMAIN_STORAGE_KEY, newDomain);
    } catch {
    }
  }, []);
  const formatPrefix = useCallback(
    (label) => {
      const parts = [`[${app}]`, domain];
      if (label) parts.push(label);
      return `[${parts.join(":")}]`;
    },
    [app, domain]
  );
  const toggleDebug = useCallback(() => {
    setDebugEnabled((prev) => {
      const newValue = !prev;
      console.log(
        `${formatPrefix()} Debug logging ${newValue ? "enabled" : "disabled"}`
      );
      try {
        localStorage.setItem(DEBUG_STORAGE_KEY, String(newValue));
      } catch {
      }
      return newValue;
    });
  }, [formatPrefix]);
  const debug = useCallback(
    (...args) => {
      if (debugEnabled) {
        console.log(formatPrefix(), ...args);
      }
    },
    [debugEnabled, formatPrefix]
  );
  const debugLog = useCallback(
    (label, ...args) => {
      if (debugEnabled) {
        console.log(formatPrefix(label), ...args);
      }
    },
    [debugEnabled, formatPrefix]
  );
  const toggleLabels = useCallback(() => setShowLabels((prev) => !prev), []);
  const toggleDataIds = useCallback(() => setShowDataIds((prev) => !prev), []);
  const toggleLayoutOverlay = useCallback(() => setShowLayoutOverlay((prev) => !prev), []);
  const updateLayoutOverlayConfig = useCallback((updates) => {
    setLayoutOverlayConfig((prev) => ({ ...prev, ...updates }));
  }, []);
  const toggleClickLogging = useCallback(
    () => setClickLogging((prev) => !prev),
    []
  );
  const toggleClickToSource = useCallback(() => {
    setClickToSourceEnabled((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(CLICK_TO_SOURCE_STORAGE_KEY, String(newValue));
      } catch {
      }
      return newValue;
    });
  }, []);
  useEffect(() => {
    if (!clickLogging) return;
    const handleGlobalClick = (e) => {
      const target = e.target;
      console.log("\u{1F3AF} Click target:", {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        dataId: target.getAttribute("data-id"),
        dataSlot: target.getAttribute("data-slot"),
        pointerEvents: getComputedStyle(target).pointerEvents,
        zIndex: getComputedStyle(target).zIndex
      });
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [clickLogging]);
  const value = {
    domain,
    setDomain,
    debugEnabled,
    toggleDebug,
    debug,
    debugLog,
    showLabels,
    toggleLabels,
    showDataIds,
    toggleDataIds,
    showLayoutOverlay,
    toggleLayoutOverlay,
    layoutOverlayConfig,
    updateLayoutOverlayConfig,
    clickLogging,
    toggleClickLogging,
    clickToSourceEnabled,
    toggleClickToSource,
    app
  };
  return /* @__PURE__ */ jsx(DevToolsContext.Provider, { value, children });
}
function useDevTools() {
  const context = useContext(DevToolsContext);
  if (!context) {
    return {
      domain: "marketing",
      setDomain: () => {
      },
      debugEnabled: false,
      toggleDebug: () => {
      },
      debug: () => {
      },
      debugLog: () => {
      },
      showLabels: false,
      toggleLabels: () => {
      },
      showDataIds: false,
      toggleDataIds: () => {
      },
      showLayoutOverlay: false,
      toggleLayoutOverlay: () => {
      },
      layoutOverlayConfig: defaultLayoutOverlayConfig,
      updateLayoutOverlayConfig: () => {
      },
      clickLogging: false,
      toggleClickLogging: () => {
      },
      clickToSourceEnabled: true,
      toggleClickToSource: () => {
      },
      app: "app"
    };
  }
  return context;
}
function useDebug() {
  const { debugEnabled, toggleDebug, debug, debugLog, domain, app } = useDevTools();
  return { debugEnabled, toggleDebug, debug, debugLog, domain, app };
}
function useDomain() {
  const { domain, setDomain } = useDevTools();
  return { domain, setDomain };
}

// src/Overlay.tsx
import { Fragment, jsx as jsx2, jsxs } from "react/jsx-runtime";
var CURSOR_STYLE_ID = "cts-hide-cursor";
function hideCursor() {
  if (!document.getElementById(CURSOR_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = CURSOR_STYLE_ID;
    style.textContent = "* { cursor: none !important; }";
    document.head.appendChild(style);
  }
}
function showCursor() {
  document.getElementById(CURSOR_STYLE_ID)?.remove();
}
var HIGHLIGHT_ENABLED_KEY = "cts_highlight_enabled";
var EDITOR_PROTOCOL_KEY = "cts_editor_protocol";
var MODIFIER_LOCATION_KEY = "cts_modifier_location";
function matchesModifierLocation(e, location) {
  if (location === "any") return true;
  if (location === "left") return e.location === 1;
  if (location === "right") return e.location === 2;
  return true;
}
function ClickToSource({
  editorProtocol: editorProtocolProp = "cursor",
  modifierLocation: modifierLocationProp = "left",
  children
}) {
  const { clickToSourceEnabled } = useDevTools();
  const [isActive, setIsActive] = useState2(false);
  const [mode, setMode] = useState2("editor");
  const [targetLevel, setTargetLevel] = useState2("element");
  const [hoveredElement, setHoveredElement] = useState2(
    null
  );
  const [mousePos, setMousePos] = useState2({ x: 0, y: 0 });
  const [highlightEnabled, setHighlightEnabled] = useState2(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(HIGHLIGHT_ENABLED_KEY);
    return stored === null ? true : stored === "true";
  });
  const [settingsOpen, setSettingsOpen] = useState2(false);
  const [currentEditorProtocol, setCurrentEditorProtocol] = useState2(() => {
    if (typeof window === "undefined") return editorProtocolProp;
    const stored = localStorage.getItem(EDITOR_PROTOCOL_KEY);
    return stored ?? editorProtocolProp;
  });
  const [currentModifierLocation, setCurrentModifierLocation] = useState2(() => {
    if (typeof window === "undefined") return modifierLocationProp;
    const stored = localStorage.getItem(MODIFIER_LOCATION_KEY);
    return stored ?? modifierLocationProp;
  });
  const metaDown = useRef(false);
  const ctrlDown = useRef(false);
  const altDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const toggleHighlight = useCallback2(() => {
    setHighlightEnabled((v) => {
      const next = !v;
      localStorage.setItem(HIGHLIGHT_ENABLED_KEY, String(next));
      return next;
    });
  }, []);
  const toggleSettings = useCallback2(() => {
    setSettingsOpen((v) => !v);
  }, []);
  const handleEditorChange = useCallback2((protocol) => {
    setCurrentEditorProtocol(protocol);
    localStorage.setItem(EDITOR_PROTOCOL_KEY, protocol);
  }, []);
  const handleModifierLocationChange = useCallback2((location) => {
    setCurrentModifierLocation(location);
    localStorage.setItem(MODIFIER_LOCATION_KEY, location);
  }, []);
  const deactivate = useCallback2(() => {
    metaDown.current = false;
    ctrlDown.current = false;
    altDown.current = false;
    setIsActive(false);
    setMode("editor");
    setTargetLevel("element");
  }, []);
  useEffect2(() => {
    if (!clickToSourceEnabled) return;
    const trackMouse = (e) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener("mousemove", trackMouse, { passive: true });
    return () => document.removeEventListener("mousemove", trackMouse);
  }, [clickToSourceEnabled]);
  useEffect2(() => {
    if (!clickToSourceEnabled) return;
    const updateState = () => {
      const active = metaDown.current || ctrlDown.current;
      setIsActive(active);
      if (!active) {
        setMode("editor");
        setTargetLevel("element");
        showCursor();
        return;
      }
      if (highlightEnabled) {
        hideCursor();
      }
      const { x, y } = lastMousePos.current;
      const el = document.elementFromPoint(x, y);
      if (el) {
        setHoveredElement(el);
        setMousePos({ x, y });
      }
      setMode(metaDown.current ? "copy" : "editor");
      setTargetLevel(altDown.current ? "parent" : "element");
    };
    const handleKeyDown = (e) => {
      if (!matchesModifierLocation(e, currentModifierLocation)) return;
      if (e.key === "Meta") metaDown.current = true;
      if (e.key === "Control") ctrlDown.current = true;
      if (e.key === "Alt") altDown.current = true;
      updateState();
    };
    const handleKeyUp = (e) => {
      if (!matchesModifierLocation(e, currentModifierLocation)) return;
      if (e.key === "Meta") metaDown.current = false;
      if (e.key === "Control") ctrlDown.current = false;
      if (e.key === "Alt") altDown.current = false;
      updateState();
    };
    const handleBlur = () => {
      deactivate();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [clickToSourceEnabled, highlightEnabled, deactivate, currentModifierLocation]);
  useEffect2(() => {
    if (!clickToSourceEnabled || !isActive || !highlightEnabled) {
      setHoveredElement(null);
      showCursor();
      return;
    }
    hideCursor();
    const handleMouseMove = (e) => {
      const target = e.target;
      setHoveredElement(target);
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      showCursor();
    };
  }, [clickToSourceEnabled, isActive, highlightEnabled]);
  const handleClick = useCallback2(
    async (e) => {
      if (!clickToSourceEnabled || !highlightEnabled || !metaDown.current && !ctrlDown.current) return;
      const target = e.target ?? hoveredElement;
      if (!target) return;
      if (target.closest("[data-cts-toggle]")) return;
      const locations = getAllSourceLocations(target);
      const locationWithElement = getTargetLocation(locations, altDown.current);
      if (!locationWithElement) return;
      const sourceLocation = {
        file: locationWithElement.file,
        line: locationWithElement.line,
        column: locationWithElement.column
      };
      const targetElement = locationWithElement.element;
      e.preventDefault();
      e.stopPropagation();
      if (metaDown.current) {
        const snippet = getLLMSnippet(targetElement, sourceLocation);
        await navigator.clipboard.writeText(snippet);
        console.log("[ClickToSource] Copied to clipboard:\n", snippet);
      } else {
        openInEditor(currentEditorProtocol, sourceLocation);
      }
    },
    [clickToSourceEnabled, highlightEnabled, hoveredElement, currentEditorProtocol]
  );
  useEffect2(() => {
    document.addEventListener("click", handleClick, true);
    document.addEventListener("contextmenu", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("contextmenu", handleClick, true);
    };
  }, [handleClick]);
  const showBadges = clickToSourceEnabled && highlightEnabled && isActive && hoveredElement && getSourceLocation(hoveredElement);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    children,
    clickToSourceEnabled && highlightEnabled && isActive && /* @__PURE__ */ jsx2(FullScreenCrosshairs, { x: mousePos.x, y: mousePos.y, mode, targetLevel }),
    showBadges && /* @__PURE__ */ jsx2(InspectorBadges, { element: hoveredElement, mode, targetLevel }),
    clickToSourceEnabled && isActive && /* @__PURE__ */ jsx2(
      InstructionsOverlay,
      {
        mode,
        targetLevel,
        isActive: isActive && highlightEnabled,
        highlightEnabled,
        onToggle: toggleHighlight,
        settingsOpen,
        onToggleSettings: toggleSettings,
        editorProtocol: currentEditorProtocol,
        modifierLocation: currentModifierLocation,
        onEditorChange: handleEditorChange,
        onModifierLocationChange: handleModifierLocationChange
      }
    )
  ] });
}
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
function getAccentColor(mode, targetLevel) {
  if (mode === "copy" && targetLevel === "parent") return COLOR_GREEN_50;
  if (mode === "copy") return COLOR_ORANGE_50;
  if (targetLevel === "parent") return COLOR_BLUE_50;
  return COLOR_PURPLE_50;
}
function InstructionsOverlay({
  mode,
  targetLevel,
  isActive,
  highlightEnabled,
  onToggle,
  settingsOpen,
  onToggleSettings,
  editorProtocol,
  modifierLocation,
  onEditorChange,
  onModifierLocationChange
}) {
  const shortcuts = [
    { keys: ["\u2303", "Click"], action: "Open in editor", color: COLOR_PURPLE_50, active: isActive && mode === "editor" && targetLevel === "element" },
    { keys: ["\u2303", "\u2325", "Click"], action: "Open parent in editor", color: COLOR_BLUE_50, active: isActive && mode === "editor" && targetLevel === "parent" },
    { keys: ["\u2318", "Click"], action: "Copy snippet", color: COLOR_ORANGE_50, active: isActive && mode === "copy" && targetLevel === "element" },
    { keys: ["\u2318", "\u2325", "Click"], action: "Copy parent snippet", color: COLOR_GREEN_50, active: isActive && mode === "copy" && targetLevel === "parent" }
  ];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        position: "fixed",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        gap: 6
      },
      children: [
        /* @__PURE__ */ jsx2(
          "div",
          {
            style: {
              display: "flex",
              gap: 4,
              padding: 4,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              borderRadius: 10,
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              pointerEvents: "none",
              opacity: highlightEnabled ? 1 : 0.5,
              transition: "opacity 0.15s"
            },
            children: shortcuts.map((shortcut, i) => /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "2px 4px 2px 2px",
                  borderRadius: 4,
                  backgroundColor: shortcut.active ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  transition: "background-color 0.15s"
                },
                children: [
                  /* @__PURE__ */ jsx2("div", { style: { display: "flex", alignItems: "center", gap: 3 }, children: shortcut.keys.map((key, j) => /* @__PURE__ */ jsx2(
                    "kbd",
                    {
                      style: {
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        lineHeight: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 20,
                        ...key === "Click" ? { paddingLeft: 6, paddingRight: 6 } : { width: 20 },
                        textAlign: "center",
                        backgroundColor: shortcut.active ? shortcut.color : "rgba(255, 255, 255, 0.12)",
                        color: shortcut.active ? "white" : "rgba(255, 255, 255, 0.55)",
                        borderRadius: 2,
                        border: `1px solid ${shortcut.active ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)"}`,
                        transition: "background-color 0.15s, color 0.15s"
                      },
                      children: key
                    },
                    j
                  )) }),
                  /* @__PURE__ */ jsx2(
                    "span",
                    {
                      style: {
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        color: shortcut.active ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.4)",
                        whiteSpace: "nowrap",
                        transition: "color 0.15s"
                      },
                      children: shortcut.action
                    }
                  )
                ]
              },
              i
            ))
          }
        ),
        /* @__PURE__ */ jsx2(
          "button",
          {
            "data-cts-toggle": "",
            onClickCapture: (e) => {
              e.stopPropagation();
              onToggle();
            },
            onMouseDown: (e) => {
              e.stopPropagation();
            },
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              borderRadius: 10,
              border: "none",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              cursor: "pointer",
              pointerEvents: "auto"
            },
            title: highlightEnabled ? "Disable highlighting" : "Enable highlighting",
            children: /* @__PURE__ */ jsx2(
              "div",
              {
                style: {
                  position: "relative",
                  width: 28,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: highlightEnabled ? COLOR_PURPLE_50 : "rgba(255, 255, 255, 0.15)",
                  transition: "background-color 0.15s"
                },
                children: /* @__PURE__ */ jsx2(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: 2,
                      left: highlightEnabled ? 16 : 2,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "white",
                      transition: "left 0.15s"
                    }
                  }
                )
              }
            )
          }
        ),
        /* @__PURE__ */ jsx2(
          "button",
          {
            "data-cts-settings": "",
            onClickCapture: (e) => {
              e.stopPropagation();
              onToggleSettings();
            },
            onMouseDown: (e) => {
              e.stopPropagation();
            },
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: 10,
              border: "none",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              cursor: "pointer",
              pointerEvents: "auto",
              color: "rgba(255, 255, 255, 0.6)"
            },
            title: "Settings",
            children: /* @__PURE__ */ jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "3" }),
              /* @__PURE__ */ jsx2("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })
            ] })
          }
        ),
        settingsOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx2(
            "div",
            {
              "data-cts-settings-backdrop": "",
              onClick: (e) => {
                e.stopPropagation();
                onToggleSettings();
              },
              style: {
                position: "fixed",
                inset: 0,
                zIndex: 999998,
                pointerEvents: "auto"
              }
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                position: "fixed",
                bottom: 44,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 999999,
                backgroundColor: "rgba(0, 0, 0, 0.92)",
                borderRadius: 12,
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                padding: 16,
                minWidth: 200,
                pointerEvents: "auto"
              },
              children: [
                /* @__PURE__ */ jsx2(
                  "div",
                  {
                    style: {
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "white",
                      marginBottom: 12
                    },
                    children: "Settings"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { style: { marginBottom: 12 }, children: [
                  /* @__PURE__ */ jsx2(
                    "label",
                    {
                      style: {
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255, 255, 255, 0.6)",
                        marginBottom: 4,
                        display: "block"
                      },
                      children: "Editor"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: editorProtocol,
                      onChange: (e) => onEditorChange(e.target.value),
                      style: {
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: 12,
                        padding: "6px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        cursor: "pointer",
                        width: "100%",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 8px center",
                        paddingRight: 28
                      },
                      children: [
                        /* @__PURE__ */ jsx2("option", { value: "vscode", children: "VS Code" }),
                        /* @__PURE__ */ jsx2("option", { value: "cursor", children: "Cursor" }),
                        /* @__PURE__ */ jsx2("option", { value: "zed", children: "Zed" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx2(
                    "label",
                    {
                      style: {
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255, 255, 255, 0.6)",
                        marginBottom: 4,
                        display: "block"
                      },
                      children: "Modifier Keys"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: modifierLocation,
                      onChange: (e) => onModifierLocationChange(e.target.value),
                      style: {
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: 12,
                        padding: "6px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        cursor: "pointer",
                        width: "100%",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 8px center",
                        paddingRight: 28
                      },
                      children: [
                        /* @__PURE__ */ jsx2("option", { value: "left", children: "Left side" }),
                        /* @__PURE__ */ jsx2("option", { value: "right", children: "Right side" }),
                        /* @__PURE__ */ jsx2("option", { value: "any", children: "Both sides" })
                      ]
                    }
                  )
                ] })
              ]
            }
          )
        ] })
      ]
    }
  );
}
function FullScreenCrosshairs({ x, y, mode, targetLevel }) {
  const color = getAccentColor(mode, targetLevel);
  return /* @__PURE__ */ jsxs("div", { style: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999998 }, children: [
    /* @__PURE__ */ jsx2(
      "div",
      {
        style: {
          position: "absolute",
          left: x,
          top: 0,
          width: "1px",
          height: "100vh",
          backgroundColor: color,
          opacity: 0.6
        }
      }
    ),
    /* @__PURE__ */ jsx2(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          top: y,
          width: "100vw",
          height: "1px",
          backgroundColor: color,
          opacity: 0.6
        }
      }
    )
  ] });
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
function InspectorBadges({ element, mode, targetLevel }) {
  const locations = getAllSourceLocations(element);
  const locationWithElement = getTargetLocation(locations, targetLevel === "parent");
  if (!locationWithElement) return null;
  const targetElement = locationWithElement.element;
  const sourceLocation = locationWithElement;
  const rect = targetElement.getBoundingClientRect();
  const accentColor = getAccentColor(mode, targetLevel);
  const highlightBg = `color-mix(in oklch, ${accentColor} 14%, transparent)`;
  let modeLabel = targetLevel === "parent" ? "Parent" : "Element";
  if (mode === "copy") modeLabel += " + Copy";
  const badgeStyle = {
    fontSize: "12px",
    fontFamily: "monospace",
    lineHeight: 1,
    padding: "4px 6px"
  };
  return /* @__PURE__ */ jsxs("div", { style: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999999 }, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          ...badgeStyle,
          position: "absolute",
          top: rect.top,
          left: rect.left,
          transform: "translateY(-100%)",
          backgroundColor: accentColor,
          color: "white",
          borderTopLeftRadius: "3px",
          borderTopRightRadius: "3px",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        },
        children: [
          /* @__PURE__ */ jsxs("span", { children: [
            targetElement.tagName.toLowerCase(),
            targetElement.id && `#${targetElement.id}`,
            targetElement.className && typeof targetElement.className === "string" && `.${targetElement.className.split(" ")[0]}`
          ] }),
          /* @__PURE__ */ jsx2("span", { style: { opacity: 0.5 }, children: "|" }),
          /* @__PURE__ */ jsx2("span", { children: modeLabel })
        ]
      }
    ),
    /* @__PURE__ */ jsx2(
      "div",
      {
        style: {
          position: "absolute",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: `2px solid ${accentColor}`,
          backgroundColor: highlightBg,
          borderRadius: "0 4px 4px 4px"
        }
      }
    ),
    sourceLocation && /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          ...badgeStyle,
          position: "absolute",
          top: rect.bottom,
          left: rect.left,
          backgroundColor: getAccentColor100(mode, targetLevel),
          color: getAccentColor0(mode, targetLevel),
          borderBottomLeftRadius: "3px",
          borderBottomRightRadius: "3px",
          maxWidth: "320px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        },
        children: [
          sourceLocation.file.split("/").slice(-2).join("/"),
          ":",
          sourceLocation.line
        ]
      }
    )
  ] });
}
function parseLocatorJsAttribute(value) {
  const parts = value.split(":");
  if (parts.length < 3) return null;
  const column = parseInt(parts.pop(), 10);
  const line = parseInt(parts.pop(), 10);
  const file = parts.join(":");
  if (isNaN(line) || !file) return null;
  return {
    file,
    line,
    column: isNaN(column) ? 0 : column
  };
}
function getTargetLocation(locations, targetParent) {
  if (locations.length === 0) return null;
  if (!targetParent) {
    return locations[0];
  }
  const currentFile = locations[0].file;
  const parentLocation = locations.find((loc) => loc.file !== currentFile);
  return parentLocation ?? locations[locations.length - 1];
}
function getAllSourceLocations(element) {
  const locations = [];
  let current = element;
  while (current) {
    if (current instanceof HTMLElement && current.dataset) {
      const locatorjs = current.dataset.locatorjs;
      if (locatorjs) {
        const parsed = parseLocatorJsAttribute(locatorjs);
        if (parsed) {
          locations.push({ ...parsed, element: current });
        }
      } else {
        const file = current.dataset.sourceFile;
        const line = current.dataset.sourceLine;
        const column = current.dataset.sourceColumn;
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
function getSourceLocation(element, skip = 0) {
  const locations = getAllSourceLocations(element);
  return locations[skip] ?? locations[locations.length - 1] ?? null;
}
function cleanElement(element) {
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
function formatHTML(html, indent = 2) {
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
function getLLMSnippet(element, sourceLocation) {
  const cleaned = cleanElement(element);
  const formatted = formatHTML(cleaned.outerHTML);
  return `${sourceLocation.file}:${sourceLocation.line}
${formatted}`;
}
function openInEditor(protocol, sourceLocation) {
  const { file, line, column } = sourceLocation;
  let url;
  switch (protocol) {
    case "vscode":
    case "cursor":
      url = `${protocol}://file/${file}:${line}:${column}`;
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

// src/LayoutDebugOverlay.tsx
import { useEffect as useEffect3, useState as useState3, useCallback as useCallback3 } from "react";
import { Fragment as Fragment2, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var DATA_ATTRIBUTE_SELECTORS = [
  { selector: "[data-sidebar='left']", color: "#f97316", label: "Sidebar (left)" },
  { selector: "[data-sidebar='right']", color: "#ef4444", label: "Sidebar (right)" },
  { selector: "[data-explorer]", color: "#f97316", label: "Explorer" },
  { selector: "[data-inspector]", color: "#ef4444", label: "Inspector" },
  { selector: "[data-workspace]", color: "#a855f7", label: "Workspace" },
  { selector: "[data-canvas]", color: "#06b6d4", label: "Canvas" },
  { selector: "[data-toolbar]", color: "#3b82f6", label: "Toolbar" }
];
var LAYOUT_COLORS = {
  flex: "#8b5cf6",
  // violet
  grid: "#06b6d4",
  // cyan
  positioned: "#f59e0b",
  // amber
  overflow: "#ec4899"
  // pink
};
var ADJACENCY_THRESHOLD = 4;
function computeAdjacentEdges(boxes) {
  for (let i = 0; i < boxes.length; i++) {
    const boxA = boxes[i];
    const boundsA = boxA.bounds;
    for (let j = i + 1; j < boxes.length; j++) {
      const boxB = boxes[j];
      const boundsB = boxB.bounds;
      const verticalOverlap = boundsA.top < boundsB.bottom && boundsA.bottom > boundsB.top;
      const horizontalOverlap = boundsA.left < boundsB.right && boundsA.right > boundsB.left;
      if (verticalOverlap) {
        if (Math.abs(boundsA.right - boundsB.left) <= ADJACENCY_THRESHOLD) {
          boxB.edges.left = false;
        }
        if (Math.abs(boundsA.left - boundsB.right) <= ADJACENCY_THRESHOLD) {
          boxB.edges.right = false;
        }
      }
      if (horizontalOverlap) {
        if (Math.abs(boundsA.bottom - boundsB.top) <= ADJACENCY_THRESHOLD) {
          boxB.edges.top = false;
        }
        if (Math.abs(boundsA.top - boundsB.bottom) <= ADJACENCY_THRESHOLD) {
          boxB.edges.bottom = false;
        }
      }
    }
  }
}
function getBoxModel(el) {
  const style = getComputedStyle(el);
  return {
    padding: {
      top: parseFloat(style.paddingTop) || 0,
      right: parseFloat(style.paddingRight) || 0,
      bottom: parseFloat(style.paddingBottom) || 0,
      left: parseFloat(style.paddingLeft) || 0
    },
    margin: {
      top: parseFloat(style.marginTop) || 0,
      right: parseFloat(style.marginRight) || 0,
      bottom: parseFloat(style.marginBottom) || 0,
      left: parseFloat(style.marginLeft) || 0
    }
  };
}
function shouldIncludeElement(el, config) {
  const bounds = el.getBoundingClientRect();
  if (bounds.width < config.minWidth || bounds.height < config.minHeight) {
    return { include: false, type: "", color: "" };
  }
  const style = getComputedStyle(el);
  if (config.showFlex && (style.display === "flex" || style.display === "inline-flex")) {
    return { include: true, type: "flex", color: LAYOUT_COLORS.flex };
  }
  if (config.showGrid && (style.display === "grid" || style.display === "inline-grid")) {
    return { include: true, type: "grid", color: LAYOUT_COLORS.grid };
  }
  if (config.showPositioned && ["relative", "absolute", "fixed", "sticky"].includes(style.position)) {
    return { include: true, type: style.position, color: LAYOUT_COLORS.positioned };
  }
  if (config.showOverflow) {
    const hasOverflow = ["hidden", "auto", "scroll"].includes(style.overflow) || ["hidden", "auto", "scroll"].includes(style.overflowX) || ["hidden", "auto", "scroll"].includes(style.overflowY);
    if (hasOverflow) {
      return { include: true, type: "overflow", color: LAYOUT_COLORS.overflow };
    }
  }
  return { include: false, type: "", color: "" };
}
function LayoutDebugOverlay() {
  const { showLayoutOverlay, layoutOverlayConfig } = useDevTools();
  const [boxes, setBoxes] = useState3([]);
  const scanElements = useCallback3(() => {
    const found = [];
    const seen = /* @__PURE__ */ new Set();
    if (layoutOverlayConfig.showDataAttributes) {
      DATA_ATTRIBUTE_SELECTORS.forEach(({ selector, color, label }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
          if (seen.has(el)) return;
          seen.add(el);
          const bounds = el.getBoundingClientRect();
          if (bounds.width < layoutOverlayConfig.minWidth || bounds.height < layoutOverlayConfig.minHeight) return;
          const { padding, margin } = getBoxModel(el);
          found.push({
            id: `data-${selector}-${index}`,
            label,
            bounds,
            padding,
            margin,
            color,
            edges: { top: true, right: true, bottom: true, left: true }
          });
        });
      });
    }
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el, index) => {
      if (seen.has(el)) return;
      const tag = el.tagName.toLowerCase();
      if (["script", "style", "link", "meta", "head", "html", "path", "circle", "rect", "line", "polygon", "polyline", "ellipse", "text", "tspan", "g", "defs", "clippath", "mask"].includes(tag)) {
        return;
      }
      const result = shouldIncludeElement(el, layoutOverlayConfig);
      if (!result.include) return;
      seen.add(el);
      const bounds = el.getBoundingClientRect();
      const { padding, margin } = getBoxModel(el);
      let label = result.type;
      if (el.id) {
        label = `#${el.id} (${result.type})`;
      } else if (el.className && typeof el.className === "string") {
        const firstClass = el.className.split(" ")[0];
        if (firstClass && firstClass.length < 30) {
          label = `.${firstClass} (${result.type})`;
        }
      }
      found.push({
        id: `layout-${index}`,
        label,
        bounds,
        padding,
        margin,
        color: result.color,
        edges: { top: true, right: true, bottom: true, left: true }
      });
    });
    computeAdjacentEdges(found);
    setBoxes(found);
  }, [layoutOverlayConfig]);
  useEffect3(() => {
    if (!showLayoutOverlay) {
      setBoxes([]);
      return;
    }
    scanElements();
    const handleUpdate = () => scanElements();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    const interval = setInterval(scanElements, 500);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      clearInterval(interval);
    };
  }, [showLayoutOverlay, scanElements]);
  if (!showLayoutOverlay || boxes.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx3(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99997
      },
      children: boxes.map((box) => /* @__PURE__ */ jsx3(
        BoxOverlay,
        {
          box,
          showPadding: layoutOverlayConfig.showPadding,
          showMargin: layoutOverlayConfig.showMargin
        },
        box.id
      ))
    }
  );
}
function BoxOverlay({
  box,
  showPadding,
  showMargin
}) {
  const { bounds, padding, margin, color, label } = box;
  return /* @__PURE__ */ jsxs2(Fragment2, { children: [
    showMargin && (margin.top > 0 || margin.bottom > 0 || margin.left > 0 || margin.right > 0) && /* @__PURE__ */ jsxs2(Fragment2, { children: [
      margin.top > 0 && /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            position: "absolute",
            top: bounds.top - margin.top,
            left: bounds.left,
            width: bounds.width,
            height: margin.top,
            backgroundColor: "rgba(249, 115, 22, 0.3)"
          }
        }
      ),
      margin.bottom > 0 && /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            position: "absolute",
            top: bounds.bottom,
            left: bounds.left,
            width: bounds.width,
            height: margin.bottom,
            backgroundColor: "rgba(249, 115, 22, 0.3)"
          }
        }
      ),
      margin.left > 0 && /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            position: "absolute",
            top: bounds.top,
            left: bounds.left - margin.left,
            width: margin.left,
            height: bounds.height,
            backgroundColor: "rgba(249, 115, 22, 0.3)"
          }
        }
      ),
      margin.right > 0 && /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            position: "absolute",
            top: bounds.top,
            left: bounds.right,
            width: margin.right,
            height: bounds.height,
            backgroundColor: "rgba(249, 115, 22, 0.3)"
          }
        }
      )
    ] }),
    showPadding && (padding.top > 0 || padding.bottom > 0 || padding.left > 0 || padding.right > 0) && /* @__PURE__ */ jsxs2(Fragment2, { children: [
      padding.top > 0 && /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            position: "absolute",
            top: bounds.top,
            left: bounds.left,
            width: bounds.width,
            height: padding.top,
            backgroundColor: "rgba(34, 197, 94, 0.3)"
          }
        }
      ),
      padding.bottom > 0 && /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            position: "absolute",
            top: bounds.bottom - padding.bottom,
            left: bounds.left,
            width: bounds.width,
            height: padding.bottom,
            backgroundColor: "rgba(34, 197, 94, 0.3)"
          }
        }
      ),
      padding.left > 0 && /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            position: "absolute",
            top: bounds.top + padding.top,
            left: bounds.left,
            width: padding.left,
            height: bounds.height - padding.top - padding.bottom,
            backgroundColor: "rgba(34, 197, 94, 0.3)"
          }
        }
      ),
      padding.right > 0 && /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            position: "absolute",
            top: bounds.top + padding.top,
            left: bounds.right - padding.right,
            width: padding.right,
            height: bounds.height - padding.top - padding.bottom,
            backgroundColor: "rgba(34, 197, 94, 0.3)"
          }
        }
      )
    ] }),
    box.edges.top && /* @__PURE__ */ jsx3(
      "div",
      {
        style: {
          position: "absolute",
          top: bounds.top,
          left: bounds.left,
          width: bounds.width,
          height: 2,
          backgroundColor: color
        }
      }
    ),
    box.edges.right && /* @__PURE__ */ jsx3(
      "div",
      {
        style: {
          position: "absolute",
          top: bounds.top,
          left: bounds.right - 2,
          width: 2,
          height: bounds.height,
          backgroundColor: color
        }
      }
    ),
    box.edges.bottom && /* @__PURE__ */ jsx3(
      "div",
      {
        style: {
          position: "absolute",
          top: bounds.bottom - 2,
          left: bounds.left,
          width: bounds.width,
          height: 2,
          backgroundColor: color
        }
      }
    ),
    box.edges.left && /* @__PURE__ */ jsx3(
      "div",
      {
        style: {
          position: "absolute",
          top: bounds.top,
          left: bounds.left,
          width: 2,
          height: bounds.height,
          backgroundColor: color
        }
      }
    ),
    /* @__PURE__ */ jsx3(
      "div",
      {
        style: {
          position: "absolute",
          top: bounds.top,
          left: bounds.left,
          transform: "translateY(-100%)",
          backgroundColor: color,
          color: "white",
          fontSize: 10,
          fontFamily: "ui-monospace, monospace",
          padding: "2px 6px",
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          whiteSpace: "nowrap"
        },
        children: label
      }
    )
  ] });
}
export {
  ClickToSource,
  DevToolsProvider,
  LayoutDebugOverlay,
  useDebug,
  useDevTools,
  useDomain
};
//# sourceMappingURL=react.js.map
