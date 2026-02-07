<script setup lang="ts">
import { ref, onMounted, onUnmounted, version as vueVersion } from "vue";
import { useClickToSource } from "@bakdotdev/dev-tools/vue";
import { isOverlayActive } from "@bakdotdev/dev-tools";
import StatusCard from "./components/StatusCard.vue";
import TestElements from "./components/TestElements.vue";
import Instructions from "./components/Instructions.vue";
import Footer from "./components/Footer.vue";

useClickToSource({ editorProtocol: "zed" });

const PACKAGE_VERSION = "0.2.0";
const REQUIRED_VUE = ">=3.0.0";

const overlayStatus = ref(false);

let interval: ReturnType<typeof setInterval>;

onMounted(() => {
  const check = () => { overlayStatus.value = isOverlayActive(); };
  check();
  interval = setInterval(check, 500);
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div>
    <h1>Dev Tools Test — Vue</h1>
    <StatusCard
      :packageVersion="PACKAGE_VERSION"
      :overlayActive="overlayStatus"
      editorProtocol="zed"
      frameworkName="Vue"
      :frameworkVersion="vueVersion"
      :requiredVersion="REQUIRED_VUE"
    />
    <TestElements />
    <Instructions />
    <Footer />
  </div>
</template>
