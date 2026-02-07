<script setup lang="ts">
import TestBox from "./TestBox.vue";
import TestBoxInner from "./TestBoxInner.vue";
</script>

<template>
  <div class="test-elements">
    <h2>Test Elements</h2>
    <p>Hover over these with Ctrl/Cmd held to test click-to-source:</p>
    <div class="element-grid">
      <TestBox label="Box 1" />
      <TestBox label="Box 2" />
      <TestBox label="Nested">
        <TestBoxInner label="Inner" />
      </TestBox>
    </div>
    <p class="hint">
      Each element should show its source file and line number when highlighted.
    </p>
  </div>
</template>
