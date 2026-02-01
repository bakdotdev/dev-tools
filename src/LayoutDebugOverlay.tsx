"use client";

import { useEffect, useState, useCallback } from "react";
import { useDevTools, type LayoutOverlayConfig } from "./DevToolsProvider";

// ============================================================================
// Types
// ============================================================================

interface ElementBox {
  id: string;
  label: string;
  bounds: DOMRect;
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
  color: string;
  /** Which edges to draw (after adjacency detection) */
  edges: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}

// ============================================================================
// Config
// ============================================================================

/** Data attribute selectors with their colors */
const DATA_ATTRIBUTE_SELECTORS: Array<{ selector: string; color: string; label: string }> = [
  { selector: "[data-sidebar='left']", color: "#f97316", label: "Sidebar (left)" },
  { selector: "[data-sidebar='right']", color: "#ef4444", label: "Sidebar (right)" },
  { selector: "[data-explorer]", color: "#f97316", label: "Explorer" },
  { selector: "[data-inspector]", color: "#ef4444", label: "Inspector" },
  { selector: "[data-workspace]", color: "#a855f7", label: "Workspace" },
  { selector: "[data-canvas]", color: "#06b6d4", label: "Canvas" },
  { selector: "[data-toolbar]", color: "#3b82f6", label: "Toolbar" },
];

/** Colors for different layout types */
const LAYOUT_COLORS = {
  flex: "#8b5cf6", // violet
  grid: "#06b6d4", // cyan
  positioned: "#f59e0b", // amber
  overflow: "#ec4899", // pink
};

// ============================================================================
// Helpers
// ============================================================================

/** Threshold in pixels for considering edges as adjacent */
const ADJACENCY_THRESHOLD = 4;

/**
 * Detect adjacent edges between boxes and mark which edges should be hidden.
 * When two boxes share an edge (within threshold), only the "later" box's edge is hidden.
 */
function computeAdjacentEdges(boxes: ElementBox[]): void {
  for (let i = 0; i < boxes.length; i++) {
    const boxA = boxes[i];
    const boundsA = boxA.bounds;

    for (let j = i + 1; j < boxes.length; j++) {
      const boxB = boxes[j];
      const boundsB = boxB.bounds;

      // Check if boxes overlap vertically (for left/right edge comparison)
      const verticalOverlap =
        boundsA.top < boundsB.bottom && boundsA.bottom > boundsB.top;

      // Check if boxes overlap horizontally (for top/bottom edge comparison)
      const horizontalOverlap =
        boundsA.left < boundsB.right && boundsA.right > boundsB.left;

      if (verticalOverlap) {
        // Check if A's right edge is adjacent to B's left edge
        if (Math.abs(boundsA.right - boundsB.left) <= ADJACENCY_THRESHOLD) {
          boxB.edges.left = false;
        }
        // Check if A's left edge is adjacent to B's right edge
        if (Math.abs(boundsA.left - boundsB.right) <= ADJACENCY_THRESHOLD) {
          boxB.edges.right = false;
        }
      }

      if (horizontalOverlap) {
        // Check if A's bottom edge is adjacent to B's top edge
        if (Math.abs(boundsA.bottom - boundsB.top) <= ADJACENCY_THRESHOLD) {
          boxB.edges.top = false;
        }
        // Check if A's top edge is adjacent to B's bottom edge
        if (Math.abs(boundsA.top - boundsB.bottom) <= ADJACENCY_THRESHOLD) {
          boxB.edges.bottom = false;
        }
      }
    }
  }
}

function getBoxModel(el: HTMLElement): { padding: ElementBox["padding"]; margin: ElementBox["margin"] } {
  const style = getComputedStyle(el);
  return {
    padding: {
      top: parseFloat(style.paddingTop) || 0,
      right: parseFloat(style.paddingRight) || 0,
      bottom: parseFloat(style.paddingBottom) || 0,
      left: parseFloat(style.paddingLeft) || 0,
    },
    margin: {
      top: parseFloat(style.marginTop) || 0,
      right: parseFloat(style.marginRight) || 0,
      bottom: parseFloat(style.marginBottom) || 0,
      left: parseFloat(style.marginLeft) || 0,
    },
  };
}

function getLayoutType(el: HTMLElement): { type: string; color: string } | null {
  const style = getComputedStyle(el);

  if (style.display === "flex" || style.display === "inline-flex") {
    return { type: "flex", color: LAYOUT_COLORS.flex };
  }
  if (style.display === "grid" || style.display === "inline-grid") {
    return { type: "grid", color: LAYOUT_COLORS.grid };
  }
  if (["relative", "absolute", "fixed", "sticky"].includes(style.position)) {
    return { type: style.position, color: LAYOUT_COLORS.positioned };
  }
  if (["hidden", "auto", "scroll"].includes(style.overflow) ||
      ["hidden", "auto", "scroll"].includes(style.overflowX) ||
      ["hidden", "auto", "scroll"].includes(style.overflowY)) {
    return { type: "overflow", color: LAYOUT_COLORS.overflow };
  }

  return null;
}

function shouldIncludeElement(
  el: HTMLElement,
  config: LayoutOverlayConfig
): { include: boolean; type: string; color: string } {
  const bounds = el.getBoundingClientRect();

  // Size threshold
  if (bounds.width < config.minWidth || bounds.height < config.minHeight) {
    return { include: false, type: "", color: "" };
  }

  const style = getComputedStyle(el);

  // Check flex
  if (config.showFlex && (style.display === "flex" || style.display === "inline-flex")) {
    return { include: true, type: "flex", color: LAYOUT_COLORS.flex };
  }

  // Check grid
  if (config.showGrid && (style.display === "grid" || style.display === "inline-grid")) {
    return { include: true, type: "grid", color: LAYOUT_COLORS.grid };
  }

  // Check positioned
  if (config.showPositioned && ["relative", "absolute", "fixed", "sticky"].includes(style.position)) {
    return { include: true, type: style.position, color: LAYOUT_COLORS.positioned };
  }

  // Check overflow
  if (config.showOverflow) {
    const hasOverflow = ["hidden", "auto", "scroll"].includes(style.overflow) ||
      ["hidden", "auto", "scroll"].includes(style.overflowX) ||
      ["hidden", "auto", "scroll"].includes(style.overflowY);
    if (hasOverflow) {
      return { include: true, type: "overflow", color: LAYOUT_COLORS.overflow };
    }
  }

  return { include: false, type: "", color: "" };
}

// ============================================================================
// Component
// ============================================================================

export function LayoutDebugOverlay() {
  const { showLayoutOverlay, layoutOverlayConfig } = useDevTools();
  const [boxes, setBoxes] = useState<ElementBox[]>([]);

  const scanElements = useCallback(() => {
    const found: ElementBox[] = [];
    const seen = new Set<HTMLElement>();

    // Scan data attribute selectors
    if (layoutOverlayConfig.showDataAttributes) {
      DATA_ATTRIBUTE_SELECTORS.forEach(({ selector, color, label }) => {
        const elements = document.querySelectorAll<HTMLElement>(selector);
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
            edges: { top: true, right: true, bottom: true, left: true },
          });
        });
      });
    }

    // Scan all elements for layout containers
    const allElements = document.querySelectorAll<HTMLElement>("*");
    allElements.forEach((el, index) => {
      if (seen.has(el)) return;

      // Skip script, style, svg internals, etc.
      const tag = el.tagName.toLowerCase();
      if (["script", "style", "link", "meta", "head", "html", "path", "circle", "rect", "line", "polygon", "polyline", "ellipse", "text", "tspan", "g", "defs", "clippath", "mask"].includes(tag)) {
        return;
      }

      const result = shouldIncludeElement(el, layoutOverlayConfig);
      if (!result.include) return;

      seen.add(el);
      const bounds = el.getBoundingClientRect();
      const { padding, margin } = getBoxModel(el);

      // Try to get a meaningful label
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
        edges: { top: true, right: true, bottom: true, left: true },
      });
    });

    // Compute which edges should be hidden due to adjacency
    computeAdjacentEdges(found);

    setBoxes(found);
  }, [layoutOverlayConfig]);

  // Scan on mount and on scroll/resize
  useEffect(() => {
    if (!showLayoutOverlay) {
      setBoxes([]);
      return;
    }

    scanElements();

    const handleUpdate = () => scanElements();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    // Rescan periodically for dynamic content
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99997,
      }}
    >
      {boxes.map((box) => (
        <BoxOverlay
          key={box.id}
          box={box}
          showPadding={layoutOverlayConfig.showPadding}
          showMargin={layoutOverlayConfig.showMargin}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Box Overlay
// ============================================================================

function BoxOverlay({
  box,
  showPadding,
  showMargin
}: {
  box: ElementBox;
  showPadding: boolean;
  showMargin: boolean;
}) {
  const { bounds, padding, margin, color, label } = box;

  return (
    <>
      {/* Margin visualization (orange tint) */}
      {showMargin && (margin.top > 0 || margin.bottom > 0 || margin.left > 0 || margin.right > 0) && (
        <>
          {margin.top > 0 && (
            <div
              style={{
                position: "absolute",
                top: bounds.top - margin.top,
                left: bounds.left,
                width: bounds.width,
                height: margin.top,
                backgroundColor: "rgba(249, 115, 22, 0.3)",
              }}
            />
          )}
          {margin.bottom > 0 && (
            <div
              style={{
                position: "absolute",
                top: bounds.bottom,
                left: bounds.left,
                width: bounds.width,
                height: margin.bottom,
                backgroundColor: "rgba(249, 115, 22, 0.3)",
              }}
            />
          )}
          {margin.left > 0 && (
            <div
              style={{
                position: "absolute",
                top: bounds.top,
                left: bounds.left - margin.left,
                width: margin.left,
                height: bounds.height,
                backgroundColor: "rgba(249, 115, 22, 0.3)",
              }}
            />
          )}
          {margin.right > 0 && (
            <div
              style={{
                position: "absolute",
                top: bounds.top,
                left: bounds.right,
                width: margin.right,
                height: bounds.height,
                backgroundColor: "rgba(249, 115, 22, 0.3)",
              }}
            />
          )}
        </>
      )}

      {/* Padding visualization (green tint) */}
      {showPadding && (padding.top > 0 || padding.bottom > 0 || padding.left > 0 || padding.right > 0) && (
        <>
          {padding.top > 0 && (
            <div
              style={{
                position: "absolute",
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: padding.top,
                backgroundColor: "rgba(34, 197, 94, 0.3)",
              }}
            />
          )}
          {padding.bottom > 0 && (
            <div
              style={{
                position: "absolute",
                top: bounds.bottom - padding.bottom,
                left: bounds.left,
                width: bounds.width,
                height: padding.bottom,
                backgroundColor: "rgba(34, 197, 94, 0.3)",
              }}
            />
          )}
          {padding.left > 0 && (
            <div
              style={{
                position: "absolute",
                top: bounds.top + padding.top,
                left: bounds.left,
                width: padding.left,
                height: bounds.height - padding.top - padding.bottom,
                backgroundColor: "rgba(34, 197, 94, 0.3)",
              }}
            />
          )}
          {padding.right > 0 && (
            <div
              style={{
                position: "absolute",
                top: bounds.top + padding.top,
                left: bounds.right - padding.right,
                width: padding.right,
                height: bounds.height - padding.top - padding.bottom,
                backgroundColor: "rgba(34, 197, 94, 0.3)",
              }}
            />
          )}
        </>
      )}

      {/* Border outline - individual edges to handle adjacency */}
      {box.edges.top && (
        <div
          style={{
            position: "absolute",
            top: bounds.top,
            left: bounds.left,
            width: bounds.width,
            height: 2,
            backgroundColor: color,
          }}
        />
      )}
      {box.edges.right && (
        <div
          style={{
            position: "absolute",
            top: bounds.top,
            left: bounds.right - 2,
            width: 2,
            height: bounds.height,
            backgroundColor: color,
          }}
        />
      )}
      {box.edges.bottom && (
        <div
          style={{
            position: "absolute",
            top: bounds.bottom - 2,
            left: bounds.left,
            width: bounds.width,
            height: 2,
            backgroundColor: color,
          }}
        />
      )}
      {box.edges.left && (
        <div
          style={{
            position: "absolute",
            top: bounds.top,
            left: bounds.left,
            width: 2,
            height: bounds.height,
            backgroundColor: color,
          }}
        />
      )}

      {/* Label */}
      <div
        style={{
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
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </>
  );
}

export default LayoutDebugOverlay;
