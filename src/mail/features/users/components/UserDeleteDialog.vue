<script setup lang="ts">
import { ref } from 'vue'
import { deleteUser, type UserResponse } from '../api/users'

const props = defineProps<{
  modelValue: boolean
  deletingUser: UserResponse | null
  currentUserName: string | null | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  deleted: []
}>()

const deleting = ref(false)
const deleteError = ref('')

function close() {
  emit('update:modelValue', false)
}

async function confirm() {
  if (!props.deletingUser) return
  deleting.value = true
  deleteError.value = ''
  try {
    await deleteUser(props.deletingUser.id)
    emit('deleted')
    close()
  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : 'Failed to delete user.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div v-if="modelValue" class="dialog-backdrop" @click.self="close">
    <section class="panel dialog" role="dialog" aria-modal="true">
      <h2>Confirm Delete</h2>
      <p v-if="deletingUser?.userName === currentUserName">You cannot delete yourself.</p>
      <p v-else>Are you sure you want to delete user "{{ deletingUser?.userName }}"?</p>
      <p v-if="deleteError" class="error">{{ deleteError }}</p>
      <div class="dialog-actions">
        <button type="button" class="btn ghost" :disabled="deleting" @click="close">Cancel</button>
        <button
          v-if="deletingUser?.userName !== currentUserName"
          type="button"
          class="btn danger"
          :disabled="deleting"
          @click="confirm"
        >
          {{ deleting ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </section>
  </div>
</template>
