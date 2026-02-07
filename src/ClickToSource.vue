<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { ClickToSourceOverlay, type EditorProtocol } from "./overlay-core";

const props = withDefaults(
  defineProps<{
    editorProtocol?: EditorProtocol;
  }>(),
  {
    editorProtocol: "cursor",
  }
);

let overlay: ClickToSourceOverlay | null = null;

onMounted(() => {
  overlay = new ClickToSourceOverlay({
    editorProtocol: props.editorProtocol,
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
</script>

<template>
  <slot></slot>
</template>
