/**
 * Universal Click-to-Source overlay.
 * Works with React, Vue, Angular, or any framework.
 * No framework dependencies - pure vanilla JS.
 *
 * Usage:
 * ```ts
 * // Auto-initialize (simplest)
 * import "@bakdotdev/dev-tools";
 *
 * // Or with options
 * import { initClickToSource } from "@bakdotdev/dev-tools";
 * initClickToSource({ editorProtocol: "zed" });
 *
 * // React component (optional, for React users who prefer JSX)
 * import { ClickToSource } from "@bakdotdev/dev-tools/react";
 * ```
 */

import { ClickToSourceOverlay, type EditorProtocol, type OverlayOptions } from "./overlay-core";

export type { EditorProtocol, OverlayOptions };
export { ClickToSourceOverlay };

let globalOverlay: ClickToSourceOverlay | null = null;

/**
 * Initialize the click-to-source overlay.
 * Safe to call multiple times - only one overlay will be created.
 * Returns a cleanup function to remove the overlay.
 */
export function initClickToSource(options: OverlayOptions = {}): () => void {
  // Only run in browser
  if (typeof window === "undefined") {
    return () => {};
  }

  // Only run in development
  if (process.env.NODE_ENV === "production") {
    return () => {};
  }

  // Prevent multiple overlays
  if (globalOverlay) {
    // Update protocol if different
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

/**
 * Set the editor protocol for the global overlay.
 */
export function setEditorProtocol(protocol: EditorProtocol): void {
  globalOverlay?.setEditorProtocol(protocol);
}

/**
 * Check if the overlay is currently active.
 */
export function isOverlayActive(): boolean {
  return globalOverlay !== null;
}

// Auto-initialize in development when imported
// Users can still call initClickToSource() with options if needed
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  // Defer initialization to allow users to call initClickToSource() with options first
  setTimeout(() => {
    if (!globalOverlay) {
      initClickToSource();
    }
  }, 0);
}
