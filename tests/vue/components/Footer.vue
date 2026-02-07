<script setup lang="ts">
const GITHUB_URL = "https://github.com/bakdotdev/dev-tools";
</script>

<template>
  <div class="footer">
    <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer">GitHub</a>
    {{ " · " }}
    <a :href="`${GITHUB_URL}#readme`" target="_blank" rel="noopener noreferrer">Readme</a>
    {{ " · " }}
    <a href="https://x.com/bakdotdev" target="_blank" rel="noopener noreferrer">X</a>
    {{ " · " }}
    <a href="https://www.linkedin.com/in/erichquist/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    {{ " · " }}
    <a href="https://github.com/bakdotdev" target="_blank" rel="noopener noreferrer">@bakdotdev</a>
  </div>
</template>
