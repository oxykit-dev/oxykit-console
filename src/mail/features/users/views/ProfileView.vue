<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { uploadUserAvatar, deleteUserAvatar } from '../api/users'
import { changePassword, useAuthStore } from '@mail/features/identity'
import { validationRules, ValidationError } from '@mail/shared'
import { useAvatar } from '../composables/useAvatar'

const auth = useAuthStore()
const { avatarUrl, avatarExists, onAvatarError, getAvatarUserId, getInitials } = useAvatar()
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

function passwordErrorText(error: unknown): string {
  if (error instanceof ValidationError && error.errors) {
    const details = Object.values(error.errors).flat().filter(Boolean)
    if (details.length) return details.join(' ')
  }
  if (error instanceof Error && error.message) return error.message
  return 'Could not update password.'
}

async function onChangePassword() {
  passwordSuccess.value = false
  const current = validationRules.required('Current password')(currentPassword.value)
  const next = validationRules.strongPassword(newPassword.value)
  const confirm =
    confirmPassword.value === newPassword.value || 'Passwords do not match.'
  passwordError.value =
    current !== true ? String(current) : next !== true ? String(next) : confirm !== true ? String(confirm) : ''
  if (passwordError.value) return

  changingPassword.value = true
  try {
    await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordSuccess.value = true
  } catch (error) {
    passwordError.value = passwordErrorText(error)
  } finally {
    changingPassword.value = false
  }
}

function triggerFileInput() {
  if (!auth.isAdmin) return
  fileInputRef.value?.click()
}

onMounted(() => {
  avatarExists.value = true
})

async function onClearAvatar() {
  if (!auth.isAdmin) return
  const userId = getAvatarUserId()
  if (!userId) return
  uploading.value = true
  uploadError.value = ''
  try {
    await deleteUserAvatar(userId)
    avatarExists.value = false
    uploadSuccess.value = false
  } catch {
    uploadError.value = 'Failed to clear avatar.'
  } finally {
    uploading.value = false
  }
}

async function onAvatarChange(e: Event) {
  if (!auth.isAdmin) return
  const files = (e.target as HTMLInputElement).files
  const userId = getAvatarUserId()
  if (!files || files.length === 0 || !userId) return
  const file = files[0] as File
  uploading.value = true
  uploadError.value = ''
  uploadSuccess.value = false
  try {
    await uploadUserAvatar(userId, file)
    uploadSuccess.value = true
    avatarExists.value = true
  } catch {
    uploadError.value = 'Failed to upload avatar.'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <section class="panel profile">
    <h2>Profile</h2>
    <div class="row">
      <button
        type="button"
        class="avatar-btn"
        style="width: 96px; height: 96px; font-size: 2rem"
        :disabled="!auth.isAdmin"
        :title="auth.isAdmin ? 'Click to upload avatar' : undefined"
        @click="triggerFileInput"
      >
        <img
          v-if="auth.user?.userName && avatarExists"
          :src="avatarUrl"
          alt=""
          @error="onAvatarError"
        />
        <span v-else-if="auth.user?.userName">{{ getInitials(auth.user.userName) }}</span>
      </button>
      <div>
        <strong>{{ auth.user?.userName }}</strong>
        <p class="muted">{{ auth.user?.roles?.join(', ') }}</p>
        <button
          v-if="auth.isAdmin"
          type="button"
          class="btn ghost"
          :disabled="uploading || !avatarExists"
          @click="onClearAvatar"
        >
          Clear avatar
        </button>
      </div>
    </div>
    <input
      v-if="auth.isAdmin"
      ref="fileInputRef"
      type="file"
      accept="image/*"
      hidden
      :disabled="uploading"
      @change="onAvatarChange"
    />
    <p v-if="!auth.isAdmin" class="muted">Avatar changes require the Admin role.</p>
    <p v-if="uploadError" class="error">{{ uploadError }}</p>
    <p v-if="uploadSuccess" class="status">Avatar uploaded.</p>
    <h3>Password</h3>
    <form class="stack" @submit.prevent="onChangePassword">
      <label>
        Current password
        <input v-model="currentPassword" type="password" autocomplete="current-password" required />
      </label>
      <label>
        New password
        <input v-model="newPassword" type="password" autocomplete="new-password" required />
        <span class="hint">At least 12 characters, with upper and lower case, a number, and a symbol.</span>
      </label>
      <label>
        Confirm new password
        <input v-model="confirmPassword" type="password" autocomplete="new-password" required />
      </label>
      <p v-if="passwordError" class="error">{{ passwordError }}</p>
      <p v-if="passwordSuccess" class="status">Password updated.</p>
      <button class="btn" type="submit" :disabled="changingPassword">
        {{ changingPassword ? 'Updating…' : 'Update password' }}
      </button>
    </form>
  </section>
</template>
