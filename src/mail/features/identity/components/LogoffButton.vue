<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

async function handleLogoff() {
  loading.value = true
  try {
    await auth.revoke()
    void router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button type="button" :disabled="loading" @click="handleLogoff">
    {{ loading ? 'Signing out…' : 'Log off' }}
  </button>
</template>
