<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>

<template>
  <div class="test-box-inner">{{ label }}</div>
</template>
