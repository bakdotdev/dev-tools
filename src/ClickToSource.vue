<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { ClickToSourceOverlay, type EditorProtocol, type ModifierLocation } from "./overlay-core";

const props = withDefaults(
  defineProps<{
    editorProtocol?: EditorProtocol;
    /**
     * Which modifier key location to respond to.
     * - "any" (default): Respond to both left and right modifier keys
     * - "left": Only respond to left-side modifier keys
     * - "right": Only respond to right-side modifier keys
     */
    modifierLocation?: ModifierLocation;
  }>(),
  {
    editorProtocol: "cursor",
    modifierLocation: "any",
  }
);

let overlay: ClickToSourceOverlay | null = null;

onMounted(() => {
  overlay = new ClickToSourceOverlay({
    editorProtocol: props.editorProtocol,
    modifierLocation: props.modifierLocation,
  });
  overlay.mount();
});

onUnmounted(() => {
  overlay?.unmount();
  overlay = null;
});

watch(
  () => props.editorProtocol,
  (protocol) => {
    overlay?.setEditorProtocol(protocol);
  }
);

watch(
  () => props.modifierLocation,
  (location) => {
    overlay?.setModifierLocation(location);
  }
);
</script>

<template>
  <slot></slot>
</template>
