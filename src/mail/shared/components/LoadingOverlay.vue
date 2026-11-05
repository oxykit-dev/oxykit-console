<script setup lang="ts">
defineProps<{
  loading: boolean
  size?: number | string
  color?: string
  opacity?: number
}>()
</script>

<template>
  <div v-if="loading" class="loading-overlay" role="status" aria-label="Loading">
    <span class="spinner" />
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: color-mix(in srgb, var(--oxy-surface) 78%, transparent);
}
</style>
