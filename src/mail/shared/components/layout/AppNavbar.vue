<template>
  <nav v-if="auth.isLoggedIn && onMail" class="mail-links" aria-label="Mail">
    <router-link v-if="auth.canViewDashboardUi" to="/dashboard">Dashboard</router-link>
    <router-link v-if="auth.isAdmin" to="/users">Users</router-link>
    <router-link v-if="auth.isAdmin" to="/ops">Ops</router-link>
    <router-link v-if="auth.isAdmin" to="/templates">Templates</router-link>
  </nav>
  <button
    v-if="auth.isLoggedIn && onMail && auth.canSendEmail"
    type="button"
    class="btn nav-send"
    @click="sendDialogOpen = true"
  >
    Send
  </button>
  <div v-if="auth.isLoggedIn" ref="accountEl" class="account">
    <button
      type="button"
      class="avatar-btn"
      aria-label="Account"
      :aria-expanded="open"
      @click="open = !open"
    >
      <img v-if="auth.user?.userName && avatarExists" :src="avatarUrl" alt="" @error="onAvatarError" />
      <span v-else-if="auth.user?.userName">{{ getInitials(auth.user.userName) }}</span>
    </button>
    <div v-if="open" class="account-menu">
      <button type="button" @click="goTo('/profile')">Profile</button>
      <button v-if="auth.canAccessApiKeys" type="button" @click="goTo('/apikeys')">API Keys</button>
      <LogoffButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sendDialogOpen } from '@mail/features/email/sendDialog'
import { LogoffButton, useAuthStore } from '@mail/features/identity'
import { useAvatar } from '@mail/features/users'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const open = ref(false)
const accountEl = ref<HTMLElement | null>(null)
const onMail = computed(() => route.meta.mail === true)
const { avatarUrl, avatarExists, onAvatarError, getInitials } = useAvatar()

function goTo(path: string) {
  open.value = false
  void router.push(path)
}

function onPointerDown(event: PointerEvent) {
  if (!open.value || !accountEl.value) return
  if (!accountEl.value.contains(event.target as Node)) open.value = false
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.mail-links {
  display: flex;
  gap: 0.35rem;
}

.mail-links a {
  color: var(--oxy-nav-muted, #99f6e4);
  text-decoration: none;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--oxy-font-ui, ui-sans-serif, system-ui, sans-serif);
}

.mail-links a:hover,
.mail-links a.router-link-active {
  color: var(--oxy-nav-ink, #ecfdf5);
  background: rgba(255, 255, 255, 0.1);
}

.nav-send {
  background: var(--oxy-nav-ink, #ecfdf5);
  color: var(--oxy-nav-bg, #134e4a);
}

.account {
  position: relative;
}

.avatar-btn {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 50%;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: var(--oxy-accent, #0f766e);
  color: var(--oxy-accent-ink, #ecfdf5);
  font-weight: 700;
}

.avatar-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.35rem);
  z-index: 20;
  min-width: 10rem;
  padding: 0.35rem;
  background: var(--oxy-surface, #fff);
  color: var(--oxy-ink, #1c1917);
  border: 1px solid var(--oxy-line, #e7e5e4);
  border-radius: 12px;
  box-shadow: var(--oxy-shadow, 0 8px 24px rgba(0, 0, 0, 0.12));
}

.account-menu :deep(button) {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  cursor: pointer;
}

.account-menu :deep(button:hover) {
  background: color-mix(in srgb, var(--oxy-accent, #0f766e) 10%, transparent);
}
</style>
