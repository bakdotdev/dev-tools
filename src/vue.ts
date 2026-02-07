/**
 * Vue 3 composable for click-to-source functionality.
 *
 * Usage:
 * ```vue
 * <script setup>
 * import { useClickToSource } from "@bakdotdev/dev-tools/vue";
 *
 * useClickToSource({ editorProtocol: "zed" });
 * </script>
 * ```
 */

import { onMounted, onUnmounted, watch, type Ref, isRef } from "vue";
import { ClickToSourceOverlay, type EditorProtocol, type OverlayOptions } from "./overlay-core";

export type { EditorProtocol, OverlayOptions };

export interface UseClickToSourceOptions {
  editorProtocol?: EditorProtocol | Ref<EditorProtocol>;
}

/**
 * Vue composable that sets up the click-to-source overlay.
 * Automatically cleans up when the component unmounts.
 */
export function useClickToSource(options: UseClickToSourceOptions = {}): void {
  let overlay: ClickToSourceOverlay | null = null;

  const getProtocol = (): EditorProtocol => {
    if (isRef(options.editorProtocol)) {
      return options.editorProtocol.value;
    }
    return options.editorProtocol ?? "cursor";
  };

  onMounted(() => {
    overlay = new ClickToSourceOverlay({
      editorProtocol: getProtocol(),
    });
    overlay.mount();
  });

  onUnmounted(() => {
    overlay?.unmount();
    overlay = null;
  });

  // Watch for protocol changes if it's a ref
  if (isRef(options.editorProtocol)) {
    watch(options.editorProtocol, (protocol) => {
      overlay?.setEditorProtocol(protocol);
    });
  }
}

// Also export the overlay class for advanced usage
export { ClickToSourceOverlay };
