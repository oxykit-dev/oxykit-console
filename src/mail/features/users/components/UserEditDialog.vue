<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  createUser,
  updateUser,
  type UserResponse,
  type CreateUserRequest,
} from '../api/users'
import { listAllRoles, listRolesForUser, assignRole, removeRole } from '../api/roles'
import { ValidationError } from '@mail/shared'

interface Props {
  modelValue: boolean
  editingUser: UserResponse | null
  currentUserName: string | null | undefined
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref<{ userName: string; email: string; password: string }>({
  userName: '',
  email: '',
  password: '',
})
const editingRoles = ref<string[]>([])
const saving = ref(false)
const saveError = ref('')
const allRoles = ref<string[]>([])
const userRoles = ref<string[]>([])
const loadingRoles = ref(false)

// Load all available roles
async function loadRoles() {
  try {
    const { roles } = await listAllRoles()
    allRoles.value = roles
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

// Load roles for specific user
async function loadUserRoles(userId: string) {
  loadingRoles.value = true
  try {
    const { roles } = await listRolesForUser(userId)
    userRoles.value = roles
    editingRoles.value = [...roles]
  } catch (error) {
    console.error('Failed to load user roles:', error)
    userRoles.value = []
    editingRoles.value = []
  } finally {
    loadingRoles.value = false
  }
}

// Watch for editingUser changes to populate form and load roles
watch(
  () => props.editingUser,
  (user) => {
    if (user) {
      form.value = { userName: user.userName, email: user.email, password: '' }
      loadUserRoles(user.id)
    } else {
      form.value = { userName: '', email: '', password: '' }
      editingRoles.value = []
      userRoles.value = []
    }
  },
  { immediate: true },
)

// Watch for dialog opening to ensure roles are loaded
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && !props.editingUser) {
      editingRoles.value = []
    }
  },
)

function close() {
  emit('update:modelValue', false)
}

function errorText(error: unknown): string {
  if (error instanceof ValidationError && error.errors) {
    const details = Object.values(error.errors).flat().filter(Boolean)
    if (details.length) return details.join(' ')
  }
  if (error instanceof Error && error.message) return error.message
  return 'Failed to save user.'
}

async function save() {
  saving.value = true
  saveError.value = ''
  try {
    if (props.editingUser) {
      // Update existing user
      await updateUser(props.editingUser.id, {
        userName: form.value.userName,
        email: form.value.email,
        password: form.value.password || undefined,
      })
      // Update roles if changed
      const userId = props.editingUser.id
      const currentRoles = userRoles.value
      // Assign new roles
      for (const role of editingRoles.value) {
        if (!currentRoles.includes(role)) {
          await assignRole({ userId, role })
        }
      }
      // Remove unchecked roles
      for (const role of currentRoles) {
        if (!editingRoles.value.includes(role)) {
          await removeRole({ userId, role })
        }
      }
    } else {
      // Create new user
      const newUser = await createUser(form.value as CreateUserRequest)
      // Assign roles to new user
      if (newUser && editingRoles.value.length > 0) {
        for (const role of editingRoles.value) {
          await assignRole({ userId: newUser.id, role })
        }
      }
    }
    emit('saved')
    close()
  } catch (error) {
    saveError.value = errorText(error)
  } finally {
    saving.value = false
  }
}

onMounted(loadRoles)
</script>

<template>
  <div v-if="modelValue" class="dialog-backdrop" @click.self="close">
    <section class="panel dialog" role="dialog" aria-modal="true">
      <h2>{{ editingUser ? 'Edit User' : 'Create User' }}</h2>
      <form class="stack" @submit.prevent="save">
        <label>
          Username
          <input v-model="form.userName" required />
        </label>
        <label>
          Email
          <input v-model="form.email" type="email" required />
        </label>
        <label>
          Password
          <input v-model="form.password" type="password" :required="!editingUser" autocomplete="new-password" />
          <span class="hint">
            {{
              editingUser
                ? 'Leave blank to keep the current password.'
                : 'At least 12 characters, with upper and lower case, a number, and a symbol.'
            }}
          </span>
        </label>
        <p v-if="saveError" class="error">{{ saveError }}</p>
        <div v-if="allRoles.length" class="stack">
          <span class="hint">Roles</span>
          <label v-for="role in allRoles" :key="role" class="check">
            <input
              v-model="editingRoles"
              type="checkbox"
              :value="role"
              :disabled="Boolean(editingUser && editingUser.userName === currentUserName)"
            />
            {{ role }}
          </label>
        </div>
        <div class="dialog-actions">
          <button type="button" class="btn ghost" :disabled="saving" @click="close">Cancel</button>
          <button class="btn" type="submit" :disabled="saving">
            {{ saving ? 'Saving…' : editingUser ? 'Save' : 'Create' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
