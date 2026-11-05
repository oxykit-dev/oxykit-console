<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { moduleNav, type ModuleId } from '@/modules'
import { getTheme, toggleTheme } from './theme'

const route = useRoute()
const isDark = ref(getTheme() === 'dark')

function onToggleTheme() {
  isDark.value = toggleTheme() === 'dark'
}

function isActive(id: ModuleId): boolean {
  if (id === 'mail') return route.meta.mail === true
  if (id === 'render') return route.path.startsWith('/render')
  return route.path.startsWith('/flow')
}
</script>

<template>
  <nav class="oxy-nav" aria-label="OxyKit">
    <span class="oxy-brand">OxyKit</span>
    <div class="oxy-links">
      <router-link
        v-for="link in moduleNav"
        :key="link.id"
        class="oxy-link"
        :class="{ active: isActive(link.id) }"
        :to="link.to"
        :aria-current="isActive(link.id) ? 'page' : undefined"
      >
        {{ link.label }}
      </router-link>
    </div>
    <div class="oxy-slot">
      <slot />
      <button
        type="button"
        class="oxy-theme"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="onToggleTheme"
      >
        <svg v-if="isDark" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.oxy-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.55rem 1rem;
  background: var(--oxy-nav-bg, #134e4a);
  color: var(--oxy-nav-ink, #ecfdf5);
  font-family: var(--oxy-font-ui, ui-sans-serif, system-ui, sans-serif);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.oxy-brand {
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.oxy-links {
  display: flex;
  gap: 0.35rem;
  flex: 1;
}

.oxy-link {
  color: var(--oxy-nav-muted, #99f6e4);
  text-decoration: none;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
}

.oxy-link:hover,
.oxy-link.active {
  color: var(--oxy-nav-ink, #ecfdf5);
  background: rgba(255, 255, 255, 0.1);
}

.oxy-link:focus-visible,
.oxy-theme:focus-visible {
  outline-color: var(--oxy-nav-ink, #ecfdf5);
}

.oxy-slot {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.oxy-theme {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--oxy-nav-ink, #ecfdf5);
  cursor: pointer;
}

.oxy-theme:hover {
  background: rgba(255, 255, 255, 0.1);
}

.oxy-theme svg {
  width: 1.15rem;
  height: 1.15rem;
}
</style>
