<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { AuthCard, AppAlert, validationRules } from '@mail/shared'
import { afterLoginLocation } from '@/router/gate'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const form = ref({ identifier: '', password: '' })
const fieldError = ref('')

async function handleLogin(e?: Event) {
  if (e) e.preventDefault()
  const id = validationRules.required('Username or Email')(form.value.identifier)
  const password = validationRules.required('Password')(form.value.password)
  fieldError.value = id !== true ? String(id) : password !== true ? String(password) : ''
  if (fieldError.value) return

  const ok = await auth.login(form.value)
  if (!ok) return

  await router.replace(afterLoginLocation(auth.user?.roles ?? [], route.query.returnUrl))
}
</script>

<template>
  <AuthCard title="Sign in">
    <form class="stack" @submit.prevent="handleLogin">
      <AppAlert v-if="auth.loginError" type="error" :message="auth.loginError" />
      <p v-if="fieldError" class="field-error">{{ fieldError }}</p>
      <label>
        Username or Email
        <input v-model="form.identifier" autocomplete="username" required />
      </label>
      <label>
        Password
        <input v-model="form.password" type="password" autocomplete="current-password" required />
      </label>
      <button class="btn" type="submit" :disabled="auth.isLoading">
        {{ auth.isLoading ? 'Signing in…' : 'Login' }}
      </button>
    </form>
  </AuthCard>
</template>
