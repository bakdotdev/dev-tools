/**
 * Vanilla JS click-to-source overlay.
 * Works with any framework or vanilla HTML/JS.
 *
 * Usage:
 * ```ts
 * import { initClickToSource } from "@bakdotdev/dev-tools/vanilla";
 *
 * const cleanup = initClickToSource({ editorProtocol: "cursor" });
 *
 * // Later, to remove:
 * cleanup();
 * ```
 */

import { ClickToSourceOverlay, type EditorProtocol, type ModifierLocation, type OverlayOptions } from "./overlay-core";

export type { EditorProtocol, ModifierLocation, OverlayOptions };

/**
 * Initialize the click-to-source overlay.
 * Returns a cleanup function to remove the overlay.
 */
export function initClickToSource(options: OverlayOptions = {}): () => void {
  const overlay = new ClickToSourceOverlay(options);
  overlay.mount();

  return () => {
    overlay.unmount();
  };
}

// Also export the class for advanced usage
export { ClickToSourceOverlay };
