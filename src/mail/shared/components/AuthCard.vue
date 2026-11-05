<template>
  <div class="login-wrapper">
    <section class="card--auth panel">
      <p class="mail-kicker">OxyKit</p>
      <h1 class="mail-title">{{ title }}</h1>
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<style scoped>
.mail-kicker {
  margin: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--oxy-accent);
  font-family: var(--oxy-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-weight: 700;
}

.mail-title {
  margin: 0.2rem 0 0.85rem;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  line-height: 1.15;
}
</style>
