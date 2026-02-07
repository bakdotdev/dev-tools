<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>

<template>
  <div class="test-box">
    <span>{{ label }}</span>
    <slot />
  </div>
</template>
