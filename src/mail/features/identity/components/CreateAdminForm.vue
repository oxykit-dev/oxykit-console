<script setup lang="ts">
import { ref } from 'vue'
import { createAdmin } from '../api/auth'
import type { CreateAdminRequest, CreateAdminResponse } from '../api/auth'
import { AuthCard, useAsyncOperation, AppAlert, validationRules } from '@mail/shared'

const emit = defineEmits(['admin-created'])

const { loading, error, execute } = useAsyncOperation<CreateAdminResponse>({
  errorMessage: 'Failed to create admin',
})

const form = ref<CreateAdminRequest>({ userName: '', email: '', password: '' })
const fieldError = ref('')

async function handleValidateClick(e?: Event) {
  if (e) e.preventDefault()
  const name = validationRules.required('Username')(form.value.userName)
  const email = validationRules.email(form.value.email)
  const password = validationRules.password(form.value.password)
  fieldError.value =
    name !== true ? String(name) : email !== true ? String(email) : password !== true ? String(password) : ''
  if (fieldError.value) return

  const resp = await execute(() => createAdmin(form.value))
  if (resp) emit('admin-created')
}
</script>

<template>
  <AuthCard title="Set up admin account">
    <form class="stack" @submit.prevent="handleValidateClick">
      <AppAlert v-if="error" type="error" :message="error" />
      <p v-if="fieldError" class="field-error">{{ fieldError }}</p>
      <label>
        Username
        <input v-model="form.userName" autocomplete="username" required />
      </label>
      <label>
        Email
        <input v-model="form.email" type="email" autocomplete="email" required />
      </label>
      <label>
        Password
        <input v-model="form.password" type="password" autocomplete="new-password" required />
      </label>
      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? 'Creating…' : 'Create Admin' }}
      </button>
    </form>
  </AuthCard>
</template>
