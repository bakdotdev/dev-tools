<script setup lang="ts">
defineProps<{
  packageVersion: string;
  overlayActive: boolean;
  editorProtocol: string;
  frameworkName: string;
  frameworkVersion: string;
  requiredVersion: string;
}>();
</script>

<template>
  <div class="status-card">
    <h2>Status</h2>
    <table>
      <tbody>
        <tr>
          <td>Package</td>
          <td><code>@bakdotdev/dev-tools@{{ packageVersion }}</code></td>
        </tr>
        <tr>
          <td>Overlay</td>
          <td :class="overlayActive ? 'status-ok' : 'status-error'">
            {{ overlayActive ? "✓ Active" : "✗ Not Active" }}
          </td>
        </tr>
        <tr>
          <td>Editor</td>
          <td>{{ editorProtocol }}</td>
        </tr>
      </tbody>
    </table>

    <h2 style="margin-top: 1rem">Framework</h2>
    <table>
      <tbody>
        <tr>
          <td>{{ frameworkName }}</td>
          <td>
            <code>{{ frameworkVersion }}</code>
            <span class="version-req">requires {{ requiredVersion }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
