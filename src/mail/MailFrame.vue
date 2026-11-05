<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useDashboardSignalR } from '@mail/features/dashboard'
import { SendEmailForm } from '@mail/features/email'
import { sendDialogOpen } from '@mail/features/email/sendDialog'
import { useAuthStore } from '@mail/features/identity'
import '@mail/shared/styles/global.css'
import '@mail/mail.css'

const { connect, disconnect } = useDashboardSignalR()
const auth = useAuthStore()

watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) void connect()
    else void disconnect()
  },
  { immediate: true },
)

onUnmounted(() => {
  sendDialogOpen.value = false
})
</script>

<template>
  <div class="mail-frame">
    <div class="app-content mail-page">
      <RouterView />
    </div>
    <div v-if="sendDialogOpen" class="dialog-backdrop" @click.self="sendDialogOpen = false">
      <SendEmailForm @close="sendDialogOpen = false" />
    </div>
  </div>
</template>

<style scoped>
.app-content {
  padding: 1.25rem;
}
</style>
