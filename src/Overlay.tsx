"use client";

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { useDevTools } from "./DevToolsProvider";

type Mode = "editor" | "copy";
type TargetLevel = "element" | "parent";

const CURSOR_STYLE_ID = "cts-hide-cursor";
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

/**
 * Supported editor protocols for opening source files
 */
export type EditorProtocol = "vscode" | "cursor" | "zed";

/**
 * Which modifier key location to respond to
 */
export type ModifierLocation = "any" | "left" | "right";

export interface ClickToSourceProps {
  /**
   * Editor protocol to use
   * @default "cursor"
   */
  editorProtocol?: EditorProtocol;

  /**
   * Which modifier key location to respond to.
   * - "left" (default): Only respond to left-side modifier keys
   * - "right": Only respond to right-side modifier keys
   * - "any": Respond to both left and right modifier keys
   * @default "left"
   */
  modifierLocation?: ModifierLocation;

  /**
   * Custom children to render (optional)
   */
  children?: ReactNode;
}

interface SourceLocation {
  file: string;
  line: number;
  column: number;
}

/**
 * ClickToSource - Development tool for inspecting React components
 *
 * Hold **Cmd** (Mac) to activate:
 * - **Cmd+Click**: Open source file in editor (element level)
 * - **Cmd+Alt+Click**: Open parent component's source file
 * - **Cmd+Ctrl+Click**: Copy LLM-friendly snippet AND open in editor
 *
 * The webpack-loader (@bakdotdev/dev-tools/webpack-loader) must be
 * configured to inject source location data.
 */
const HIGHLIGHT_ENABLED_KEY = "cts_highlight_enabled";
const EDITOR_PROTOCOL_KEY = "cts_editor_protocol";
const MODIFIER_LOCATION_KEY = "cts_modifier_location";

/**
 * Check if a key event's location matches the configured modifier location.
 * KeyboardEvent.location values:
 * - 1 = DOM_KEY_LOCATION_LEFT
 * - 2 = DOM_KEY_LOCATION_RIGHT
 */
function matchesModifierLocation(e: KeyboardEvent, location: ModifierLocation): boolean {
  if (location === "any") return true;
  if (location === "left") return e.location === 1;
  if (location === "right") return e.location === 2;
  return true;
}

export function ClickToSource({
  editorProtocol: editorProtocolProp = "cursor",
  modifierLocation: modifierLocationProp = "left",
  children,
}: ClickToSourceProps) {
  const { clickToSourceEnabled } = useDevTools();
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<Mode>("editor");
  const [targetLevel, setTargetLevel] = useState<TargetLevel>("element");
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
    null
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [highlightEnabled, setHighlightEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(HIGHLIGHT_ENABLED_KEY);
    return stored === null ? true : stored === "true";
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentEditorProtocol, setCurrentEditorProtocol] = useState<EditorProtocol>(() => {
    if (typeof window === "undefined") return editorProtocolProp;
    const stored = localStorage.getItem(EDITOR_PROTOCOL_KEY) as EditorProtocol | null;
    return stored ?? editorProtocolProp;
  });
  const [currentModifierLocation, setCurrentModifierLocation] = useState<ModifierLocation>(() => {
    if (typeof window === "undefined") return modifierLocationProp;
    const stored = localStorage.getItem(MODIFIER_LOCATION_KEY) as ModifierLocation | null;
    return stored ?? modifierLocationProp;
  });
  const metaDown = useRef(false);
  const ctrlDown = useRef(false);
  const altDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const toggleHighlight = useCallback(() => {
    setHighlightEnabled((v) => {
      const next = !v;
      localStorage.setItem(HIGHLIGHT_ENABLED_KEY, String(next));
      return next;
    });
  }, []);

  const toggleSettings = useCallback(() => {
    setSettingsOpen((v) => !v);
  }, []);

  const handleEditorChange = useCallback((protocol: EditorProtocol) => {
    setCurrentEditorProtocol(protocol);
    localStorage.setItem(EDITOR_PROTOCOL_KEY, protocol);
  }, []);

  const handleModifierLocationChange = useCallback((location: ModifierLocation) => {
    setCurrentModifierLocation(location);
    localStorage.setItem(MODIFIER_LOCATION_KEY, location);
  }, []);

  const deactivate = useCallback(() => {
    metaDown.current = false;
    ctrlDown.current = false;
    altDown.current = false;
    setIsActive(false);
    setMode("editor");
    setTargetLevel("element");
  }, []);

  // Always track mouse position so we can resolve hovered element instantly on activation
  useEffect(() => {
    if (!clickToSourceEnabled) return;
    const trackMouse = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener("mousemove", trackMouse, { passive: true });
    return () => document.removeEventListener("mousemove", trackMouse);
  }, [clickToSourceEnabled]);

  // Track modifier keys
  // Ctrl = activate in editor mode, Cmd = activate in copy mode, Alt = parent targeting
  useEffect(() => {
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
      // Hide cursor immediately (don't wait for React effect)
      if (highlightEnabled) {
        hideCursor();
      }
      // Immediately resolve element under cursor on activation
      const { x, y } = lastMousePos.current;
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      if (el) {
        setHoveredElement(el);
        setMousePos({ x, y });
      }
      setMode(metaDown.current ? "copy" : "editor");
      setTargetLevel(altDown.current ? "parent" : "element");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!matchesModifierLocation(e, currentModifierLocation)) return;
      if (e.key === "Meta") metaDown.current = true;
      if (e.key === "Control") ctrlDown.current = true;
      if (e.key === "Alt") altDown.current = true;
      updateState();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!matchesModifierLocation(e, currentModifierLocation)) return;
      if (e.key === "Meta") metaDown.current = false;
      if (e.key === "Control") ctrlDown.current = false;
      if (e.key === "Alt") altDown.current = false;
      updateState();
    };

    // Deactivate when window loses focus
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

  // Track hovered element and mouse position (only when active and highlighting enabled)
  useEffect(() => {
    if (!clickToSourceEnabled || !isActive || !highlightEnabled) {
      setHoveredElement(null);
      showCursor();
      return;
    }

    // Hide cursor when active
    hideCursor();

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setHoveredElement(target);
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      showCursor();
    };
  }, [clickToSourceEnabled, isActive, highlightEnabled]);

  // Handle click on element (only when Cmd is held)
  const handleClick = useCallback(
    async (e: MouseEvent) => {
      // Only intercept when enabled, highlighting on, and Ctrl or Cmd is held
      if (!clickToSourceEnabled || !highlightEnabled || (!metaDown.current && !ctrlDown.current)) return;

      const target = (e.target as HTMLElement | null) ?? hoveredElement;
      if (!target) return;

      // Skip clicks on the toggle button
      if (target.closest("[data-cts-toggle]")) return;

      // Get target location - when Alt held, find parent component (different file)
      const locations = getAllSourceLocations(target);
      const locationWithElement = getTargetLocation(locations, altDown.current);

      // Only hijack clicks on elements with source location data
      if (!locationWithElement) return;

      const sourceLocation: SourceLocation = {
        file: locationWithElement.file,
        line: locationWithElement.line,
        column: locationWithElement.column,
      };
      const targetElement = locationWithElement.element;

      e.preventDefault();
      e.stopPropagation();

      if (metaDown.current) {
        // Cmd = copy mode
        const snippet = getLLMSnippet(targetElement, sourceLocation);
        await navigator.clipboard.writeText(snippet);
        console.log("[ClickToSource] Copied to clipboard:\n", snippet);
      } else {
        // Ctrl = editor mode
        openInEditor(currentEditorProtocol, sourceLocation);
      }
    },
    [clickToSourceEnabled, highlightEnabled, hoveredElement, currentEditorProtocol]
  );

  useEffect(() => {
    // Listen on both click and contextmenu — on macOS, Ctrl+Click fires contextmenu instead of click
    document.addEventListener("click", handleClick, true);
    document.addEventListener("contextmenu", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("contextmenu", handleClick, true);
    };
  }, [handleClick]);

  // Only show element badges when hovering element with source data
  const showBadges =
    clickToSourceEnabled && highlightEnabled && isActive && hoveredElement && getSourceLocation(hoveredElement);

  return (
    <>
      {children}
      {clickToSourceEnabled && highlightEnabled && isActive && <FullScreenCrosshairs x={mousePos.x} y={mousePos.y} mode={mode} targetLevel={targetLevel} />}
      {showBadges && <InspectorBadges element={hoveredElement} mode={mode} targetLevel={targetLevel} />}
      {clickToSourceEnabled && isActive && (
        <InstructionsOverlay
          mode={mode}
          targetLevel={targetLevel}
          isActive={isActive && highlightEnabled}
          highlightEnabled={highlightEnabled}
          onToggle={toggleHighlight}
          settingsOpen={settingsOpen}
          onToggleSettings={toggleSettings}
          editorProtocol={currentEditorProtocol}
          modifierLocation={currentModifierLocation}
          onEditorChange={handleEditorChange}
          onModifierLocationChange={handleModifierLocationChange}
        />
      )}
    </>
  );
}

/**
 * Full-screen crosshairs that follow the cursor
 */
// Accent colors — matched saturation/brightness across the palette
const COLOR_PURPLE_50 = "#715CC7";
const COLOR_PURPLE_100 = "#5244A3";
const COLOR_PURPLE_0 = "#EDE8F5";

const COLOR_ORANGE_50 = "#E57A2E";
const COLOR_ORANGE_100 = "#B35D1C";
const COLOR_ORANGE_0 = "#FEF3E8";

const COLOR_GREEN_50 = "#47B379";
const COLOR_GREEN_100 = "#2D7A52";
const COLOR_GREEN_0 = "#E8F5ED";

const COLOR_BLUE_50 = "#4A8FD4";
const COLOR_BLUE_100 = "#3468A0";
const COLOR_BLUE_0 = "#E8F0F8";

const COLOR_YELLOW_50 = "#C9A33D";
const COLOR_YELLOW_100 = "#9A7C2E";
const COLOR_YELLOW_0 = "#F8F2E4";

function getAccentColor(mode: Mode, targetLevel: TargetLevel): string {
  if (mode === "copy" && targetLevel === "parent") return COLOR_GREEN_50;
  if (mode === "copy") return COLOR_ORANGE_50;
  if (targetLevel === "parent") return COLOR_BLUE_50;
  return COLOR_PURPLE_50;
}

/**
 * Instructions overlay at the bottom of the screen
 */
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
  onModifierLocationChange,
}: {
  mode: Mode;
  targetLevel: TargetLevel;
  isActive: boolean;
  highlightEnabled: boolean;
  onToggle: () => void;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  editorProtocol: EditorProtocol;
  modifierLocation: ModifierLocation;
  onEditorChange: (protocol: EditorProtocol) => void;
  onModifierLocationChange: (location: ModifierLocation) => void;
}) {
  const shortcuts = [
    { keys: ["⌃", "Click"], action: "Open in editor", color: COLOR_PURPLE_50, active: isActive && mode === "editor" && targetLevel === "element" },
    { keys: ["⌃", "⌥", "Click"], action: "Open parent in editor", color: COLOR_BLUE_50, active: isActive && mode === "editor" && targetLevel === "parent" },
    { keys: ["⌘", "Click"], action: "Copy snippet", color: COLOR_ORANGE_50, active: isActive && mode === "copy" && targetLevel === "element" },
    { keys: ["⌘", "⌥", "Click"], action: "Copy parent snippet", color: COLOR_GREEN_50, active: isActive && mode === "copy" && targetLevel === "parent" },
  ];

  return (
    <>
      {/* Backdrop and dialog rendered OUTSIDE the bar so z-index works correctly */}
      {settingsOpen && (
        <>
          <div
            data-cts-settings-backdrop=""
            onClick={(e) => { e.stopPropagation(); onToggleSettings(); }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999997,
              pointerEvents: "auto",
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: 44,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 999998,
              backgroundColor: "rgba(0, 0, 0, 0.92)",
              borderRadius: 12,
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              padding: 16,
              minWidth: 200,
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: "white",
                marginBottom: 12,
              }}
            >
              Settings
            </div>
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.6)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Editor
              </label>
              <select
                value={editorProtocol}
                onChange={(e) => onEditorChange(e.target.value as EditorProtocol)}
                style={{
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
                  paddingRight: 28,
                }}
              >
                <option value="vscode">VS Code</option>
                <option value="cursor">Cursor</option>
                <option value="zed">Zed</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.6)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Modifier Keys
              </label>
              <select
                value={modifierLocation}
                onChange={(e) => onModifierLocationChange(e.target.value as ModifierLocation)}
                style={{
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
                  paddingRight: 28,
                }}
              >
                <option value="left">Left side</option>
                <option value="right">Right side</option>
                <option value="any">Both sides</option>
              </select>
            </div>
          </div>
        </>
      )}
      <div
        style={{
          position: "fixed",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999999,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: 4,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            borderRadius: 10,
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            pointerEvents: "none",
            opacity: highlightEnabled ? 1 : 0.5,
            transition: "opacity 0.15s",
          }}
        >
          {shortcuts.map((shortcut, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "2px 4px 2px 2px",
              borderRadius: 4,
              backgroundColor: shortcut.active ? "rgba(255, 255, 255, 0.1)" : "transparent",
              transition: "background-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {shortcut.keys.map((key, j) => (
                <kbd
                  key={j}
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 20,
                    ...(key === "Click"
                      ? { paddingLeft: 6, paddingRight: 6 }
                      : { width: 20 }),
                    textAlign: "center",
                    backgroundColor: shortcut.active ? shortcut.color : "rgba(255, 255, 255, 0.12)",
                    color: shortcut.active ? "white" : "rgba(255, 255, 255, 0.55)",
                    borderRadius: 2,
                    border: `1px solid ${shortcut.active ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)"}`,
                    transition: "background-color 0.15s, color 0.15s",
                  }}
                >
                  {key}
                </kbd>
              ))}
            </div>
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 11,
                fontWeight: 500,
                color: shortcut.active ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.4)",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
            >
              {shortcut.action}
            </span>
          </div>
        ))}
      </div>
      <button
        data-cts-toggle=""
        onClickCapture={(e) => { e.stopPropagation(); onToggle(); }}
        onMouseDown={(e) => { e.stopPropagation(); }}
        style={{
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
          pointerEvents: "auto",
        }}
        title={highlightEnabled ? "Disable highlighting" : "Enable highlighting"}
      >
        <div
          style={{
            position: "relative",
            width: 28,
            height: 14,
            borderRadius: 7,
            backgroundColor: highlightEnabled ? COLOR_PURPLE_50 : "rgba(255, 255, 255, 0.15)",
            transition: "background-color 0.15s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: highlightEnabled ? 16 : 2,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "white",
              transition: "left 0.15s",
            }}
          />
        </div>
      </button>
      <button
        data-cts-settings=""
        onClickCapture={(e) => { e.stopPropagation(); onToggleSettings(); }}
        onMouseDown={(e) => { e.stopPropagation(); }}
        style={{
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
          color: "rgba(255, 255, 255, 0.6)",
        }}
        title="Settings"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>
    </>
  );
}

function FullScreenCrosshairs({ x, y, mode, targetLevel }: { x: number; y: number; mode: Mode; targetLevel: TargetLevel }) {
  const color = getAccentColor(mode, targetLevel);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999998 }}>
      {/* Vertical line */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: "1px",
          height: "100vh",
          backgroundColor: color,
          opacity: 0.6,
        }}
      />
      {/* Horizontal line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: y,
          width: "100vw",
          height: "1px",
          backgroundColor: color,
          opacity: 0.6,
        }}
      />
    </div>
  );
}

function getAccentColor100(mode: Mode, targetLevel: TargetLevel): string {
  if (mode === "copy" && targetLevel === "parent") return COLOR_GREEN_100;
  if (mode === "copy") return COLOR_ORANGE_100;
  if (targetLevel === "parent") return COLOR_BLUE_100;
  return COLOR_PURPLE_100;
}

function getAccentColor0(mode: Mode, targetLevel: TargetLevel): string {
  if (mode === "copy" && targetLevel === "parent") return COLOR_GREEN_0;
  if (mode === "copy") return COLOR_ORANGE_0;
  if (targetLevel === "parent") return COLOR_BLUE_0;
  return COLOR_PURPLE_0;
}

/**
 * Inspector badges overlay
 */
function InspectorBadges({ element, mode, targetLevel }: { element: HTMLElement; mode: Mode; targetLevel: TargetLevel }) {
  // Get the appropriate element based on target level
  // When targeting parent, find first element in a different file (parent component)
  const locations = getAllSourceLocations(element);
  const locationWithElement = getTargetLocation(locations, targetLevel === "parent");

  if (!locationWithElement) return null;

  const targetElement = locationWithElement.element;
  const sourceLocation = locationWithElement;
  const rect = targetElement.getBoundingClientRect();

  const accentColor = getAccentColor(mode, targetLevel);
  const highlightBg = `color-mix(in oklch, ${accentColor} 14%, transparent)`;

  // Build mode label
  let modeLabel = targetLevel === "parent" ? "Parent" : "Element";
  if (mode === "copy") modeLabel += " + Copy";

  const badgeStyle: React.CSSProperties = {
    fontSize: "12px",
    fontFamily: "monospace",
    lineHeight: 1,
    padding: "4px 6px",
  };

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999999 }}>
      {/* Top badge - element info */}
      <div
        style={{
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
          gap: "4px",
        }}
      >
        <span>
          {targetElement.tagName.toLowerCase()}
          {targetElement.id && `#${targetElement.id}`}
          {targetElement.className &&
            typeof targetElement.className === "string" &&
            `.${targetElement.className.split(" ")[0]}`}
        </span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>{modeLabel}</span>
      </div>

      {/* Highlight box */}
      <div
        style={{
          position: "absolute",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: `2px solid ${accentColor}`,
          backgroundColor: highlightBg,
          borderRadius: "0 4px 4px 4px",
        }}
      />

      {/* Bottom badge - source location */}
      {sourceLocation && (
        <div
          style={{
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
            whiteSpace: "nowrap",
          }}
        >
          {sourceLocation.file.split("/").slice(-2).join("/")}:
          {sourceLocation.line}
        </div>
      )}
    </div>
  );
}

/**
 * Parse the data-locatorjs attribute format: "${projectPath}${filePath}:${line}:${column}"
 * Example: "/home/user/project/src/App.tsx:42:8"
 */
function parseLocatorJsAttribute(value: string): SourceLocation | null {
  // Split from the end to handle file paths with colons (Windows paths, etc.)
  const parts = value.split(":");
  if (parts.length < 3) return null;

  const column = parseInt(parts.pop()!, 10);
  const line = parseInt(parts.pop()!, 10);
  const file = parts.join(":"); // Rejoin in case path had colons

  if (isNaN(line) || !file) return null;

  return {
    file,
    line,
    column: isNaN(column) ? 0 : column,
  };
}

interface SourceLocationWithElement extends SourceLocation {
  element: HTMLElement;
}

/**
 * Find the target source location based on whether we want the element or parent component.
 * When targeting parent, finds the first element in a DIFFERENT file (actual parent component),
 * not just the next element with source data (which could be in the same file).
 */
function getTargetLocation(
  locations: SourceLocationWithElement[],
  targetParent: boolean
): SourceLocationWithElement | null {
  if (locations.length === 0) return null;

  if (!targetParent) {
    return locations[0];
  }

  // Find first location in a different file (parent component)
  const currentFile = locations[0].file;
  const parentLocation = locations.find(loc => loc.file !== currentFile);

  // Fall back to last location if no different file found
  return parentLocation ?? locations[locations.length - 1];
}

/**
 * Get all source locations from element up through the DOM tree
 * Returns an array where [0] is the closest element and subsequent entries are parents
 */
function getAllSourceLocations(element: HTMLElement): SourceLocationWithElement[] {
  const locations: SourceLocationWithElement[] = [];
  let current: Element | null = element;

  while (current) {
    // Skip non-HTML elements (SVG, etc.) that don't have dataset
    if (current instanceof HTMLElement && current.dataset) {
      // Try data-locatorjs format first (from babel-jsx plugin)
      const locatorjs = current.dataset.locatorjs;
      if (locatorjs) {
        const parsed = parseLocatorJsAttribute(locatorjs);
        if (parsed) {
          locations.push({ ...parsed, element: current });
        }
      } else {
        // Fall back to separate attribute format
        const file = current.dataset.sourceFile;
        const line = current.dataset.sourceLine;
        const column = current.dataset.sourceColumn;

        if (file && line) {
          locations.push({
            file,
            line: parseInt(line, 10),
            column: column ? parseInt(column, 10) : 0,
            element: current,
          });
        }
      }
    }
    current = current.parentElement;
  }

  return locations;
}

/**
 * Get source location from element's data attributes
 * (Injected by the Babel plugin)
 *
 * Supports two formats:
 * 1. data-locatorjs="${projectPath}${filePath}:${line}:${column}" (babel-jsx plugin with dataAttribute: "path")
 * 2. data-source-file, data-source-line, data-source-column (separate attributes)
 *
 * @param skip - Number of source locations to skip (0 = element, 1 = parent, etc.)
 */
function getSourceLocation(element: HTMLElement, skip = 0): SourceLocation | null {
  const locations = getAllSourceLocations(element);
  return locations[skip] ?? locations[locations.length - 1] ?? null;
}

/**
 * Clean an element by removing source location attributes
 */
function cleanElement(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;

  const removeSourceAttrs = (el: Element) => {
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

/**
 * Format HTML with basic indentation
 */
function formatHTML(html: string, indent = 2): string {
  let formatted = "";
  let level = 0;
  const pad = () => " ".repeat(level * indent);

  html
    .replace(/></g, ">\n<")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith("</")) {
        level = Math.max(0, level - 1);
      }

      formatted += pad() + trimmed + "\n";

      if (
        trimmed.startsWith("<") &&
        !trimmed.startsWith("</") &&
        !trimmed.endsWith("/>") &&
        !trimmed.includes("</")
      ) {
        level++;
      }
    });

  return formatted.trim();
}

/**
 * Get just the opening tag of an element (without children)
 */
function getOpeningTag(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const attrs: string[] = [];

  for (const attr of element.attributes) {
    // Skip source location attributes
    if (attr.name.startsWith("data-locatorjs") ||
        attr.name.startsWith("data-source-")) {
      continue;
    }

    if (attr.value) {
      attrs.push(`${attr.name}="${attr.value}"`);
    } else {
      attrs.push(attr.name);
    }
  }

  const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";
  return `<${tag}${attrStr}>`;
}

/**
 * Generate an LLM-friendly code snippet with the full element
 */
function getLLMSnippet(
  element: HTMLElement,
  sourceLocation: SourceLocation
): string {
  const cleaned = cleanElement(element);
  const formatted = formatHTML(cleaned.outerHTML);

  return `${sourceLocation.file}:${sourceLocation.line}\n${formatted}`;
}

/**
 * Open source file in editor
 */
function openInEditor(
  protocol: string,
  sourceLocation: SourceLocation
): void {
  const { file, line, column } = sourceLocation;
  let url: string;

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
