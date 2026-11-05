<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getNeedsAdmin } from '@mail/features/identity/api/auth'
import CreateAdminForm from '@mail/features/identity/components/CreateAdminForm.vue'
import LoginForm from '@mail/features/identity/components/LoginForm.vue'
import { useAuthStore } from '@mail/features/identity'
import '@mail/shared/styles/global.css'
import '@mail/mail.css'

const needsAdmin = ref<boolean | null>(null)
const auth = useAuthStore()

onMounted(async () => {
  try {
    const resp = await getNeedsAdmin()
    needsAdmin.value = resp.needsAdmin ?? null
  } catch {
    needsAdmin.value = false
  }
})

function handleAdminCreated() {
  needsAdmin.value = false
}
</script>

<template>
  <main>
    <p v-if="needsAdmin === null || auth.isLoading" class="muted login-status">Loading…</p>
    <CreateAdminForm v-else-if="needsAdmin" @admin-created="handleAdminCreated" />
    <LoginForm v-else />
  </main>
</template>

<style scoped>
.login-status {
  text-align: center;
  padding: 4rem 1rem;
}
</style>
