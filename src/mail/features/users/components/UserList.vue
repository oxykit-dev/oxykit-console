<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listUsers, type UserResponse } from '../api/users'

defineProps<{
  currentUserName: string | null | undefined
}>()

const emit = defineEmits<{
  edit: [user: UserResponse]
  delete: [user: UserResponse]
}>()

const users = ref<UserResponse[]>([])
const loading = ref(false)
const error = ref('')

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    users.value = await listUsers()
  } catch (err) {
    console.error('Failed to load users:', err)
    error.value = 'Failed to load users.'
  } finally {
    loading.value = false
  }
}

defineExpose({ loadUsers })

onMounted(loadUsers)
</script>

<template>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-else-if="loading" class="muted">Loading users…</p>
  <table v-else class="data">
    <thead>
      <tr>
        <th>Username</th>
        <th>Email</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>{{ user.userName }}</td>
        <td>{{ user.email }}</td>
        <td>
          <button type="button" class="btn ghost" @click="emit('edit', user)">Edit</button>
          <button
            type="button"
            class="btn danger"
            :disabled="user.userName === currentUserName"
            @click="emit('delete', user)"
          >
            Delete
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
