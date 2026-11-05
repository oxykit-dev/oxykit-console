<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  listApiKeys,
  createApiKey,
  deleteApiKey,
  regenerateApiKey,
} from '../api/apikeys'
import type { ApiKeyResponse } from '../api/apikeys'
import { humanizeDate, useAsyncOperation, AppAlert } from '@mail/shared'
import { useAuthStore } from '@mail/features/identity'

const auth = useAuthStore()
/** Create requires Admin; regenerate/delete are owner Bearer (any logged-in user with keys). */
const canCreateKeys = computed(() => auth.isAdmin)
const confirming = computed(
  () => deleteOperation.loading.value || regenerateOperation.loading.value,
)

const apiKeys = ref<ApiKeyResponse[]>([])
const newLabel = ref('')

const fetchOperation = useAsyncOperation<ApiKeyResponse[]>({
  errorMessage: 'Failed to load API keys',
})

const createOperation = useAsyncOperation<ApiKeyResponse>({
  errorMessage: 'Failed to create API key',
})

const deleteOperation = useAsyncOperation<void>({
  errorMessage: 'Failed to delete API key',
})

const regenerateOperation = useAsyncOperation<ApiKeyResponse>({
  errorMessage: 'Failed to regenerate API key',
})

async function fetchApiKeys() {
  const result = await fetchOperation.execute(() => listApiKeys())
  if (result) apiKeys.value = result
}

const newApiKey = ref('')
const showKeyDialog = ref(false)
const pending = ref<{ id: string; label: string; action: 'delete' | 'regenerate' } | null>(null)

async function handleCreateApiKey() {
  if (!newLabel.value || !canCreateKeys.value) return

  const result = await createOperation.execute(() =>
    createApiKey({ label: newLabel.value }),
  )

  if (result) {
    // Create response includes fields list omits; refresh list for consistent shape
    await fetchApiKeys()
    newApiKey.value = result.plainApiKey || ''
    showKeyDialog.value = true
    newLabel.value = ''
  }
}

function askDelete(id: string, label: string) {
  pending.value = { id, label, action: 'delete' }
}

function askRegenerate(id: string, label: string) {
  pending.value = { id, label, action: 'regenerate' }
}

function closePending() {
  if (deleteOperation.loading.value || regenerateOperation.loading.value) return
  pending.value = null
}

async function confirmPending() {
  const action = pending.value
  if (!action) return
  if (action.action === 'delete') {
    const result = await deleteOperation.execute(() => deleteApiKey(action.id))
    if (result !== null) {
      apiKeys.value = apiKeys.value.filter((k) => k.id !== action.id)
      pending.value = null
    }
    return
  }
  const result = await regenerateOperation.execute(() => regenerateApiKey(action.id))
  if (result) {
    pending.value = null
    await fetchApiKeys()
    newApiKey.value = result.plainApiKey || ''
    showKeyDialog.value = true
  }
}

const copied = ref(false)

const copyApiKey = () => {
  if (typeof window !== 'undefined' && window.navigator?.clipboard && newApiKey.value) {
    void window.navigator.clipboard.writeText(newApiKey.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  }
}

onMounted(fetchApiKeys)
</script>

<template>
  <section class="panel">
    <h2>API Key Management</h2>
    <AppAlert
      v-if="
        fetchOperation.error.value ||
        createOperation.error.value ||
        deleteOperation.error.value ||
        regenerateOperation.error.value
      "
      type="error"
      :message="
        fetchOperation.error.value ||
        createOperation.error.value ||
        deleteOperation.error.value ||
        regenerateOperation.error.value
      "
    />
    <AppAlert
      v-if="!canCreateKeys"
      type="info"
      message="Creating new API keys requires the Admin role. You can still regenerate or delete your existing keys."
    />
    <form v-if="canCreateKeys" class="row" @submit.prevent="handleCreateApiKey">
      <label style="flex: 1">
        New API Key Label
        <input v-model="newLabel" required />
      </label>
      <button class="btn" type="submit" :disabled="createOperation.loading.value">
        {{ createOperation.loading.value ? 'Creating…' : 'Create API Key' }}
      </button>
    </form>
    <table class="data">
      <thead>
        <tr>
          <th>Label</th>
          <th>Created At</th>
          <th>Last Used</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in apiKeys" :key="item.id">
          <td>{{ item.label }}</td>
          <td :title="item.createdAt">{{ humanizeDate(item.createdAt) }}</td>
          <td>
            <span v-if="item.lastUsedAt" :title="item.lastUsedAt">{{ humanizeDate(item.lastUsedAt) }}</span>
            <span v-else class="muted">Never</span>
          </td>
          <td>
            <button
              type="button"
              class="btn ghost"
              title="Regenerate"
              :disabled="regenerateOperation.loading.value"
              @click="askRegenerate(item.id, item.label)"
            >
              Regenerate
            </button>
            <button
              type="button"
              class="btn danger"
              title="Delete"
              :disabled="deleteOperation.loading.value"
              @click="askDelete(item.id, item.label)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <div v-if="pending" class="dialog-backdrop" @click.self="closePending">
    <section class="panel dialog" role="dialog" aria-modal="true">
      <h2>{{ pending.action === 'delete' ? 'Delete API key' : 'Regenerate API key' }}</h2>
      <p v-if="pending.action === 'delete'">
        Delete “{{ pending.label }}”? Callers using this key will stop working.
      </p>
      <p v-else>
        Regenerate “{{ pending.label }}”? The current key will stop working. The new key is shown once.
      </p>
      <div class="dialog-actions">
        <button type="button" class="btn ghost" :disabled="confirming" @click="closePending">Cancel</button>
        <button
          type="button"
          class="btn"
          :class="{ danger: pending.action === 'delete' }"
          :disabled="confirming"
          @click="confirmPending"
        >
          {{ confirming ? 'Working…' : pending.action === 'delete' ? 'Delete' : 'Regenerate' }}
        </button>
      </div>
    </section>
  </div>

  <div v-if="showKeyDialog" class="dialog-backdrop">
    <section class="panel dialog" role="dialog" aria-modal="true">
      <h2>API Key Created</h2>
      <p class="alert warning">This is the only time you will see this key. Copy and store it securely.</p>
      <div class="api-key-display">
        <span>{{ newApiKey }}</span>
        <button type="button" class="btn ghost" @click="copyApiKey">
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>
      <div class="dialog-actions">
        <button type="button" class="btn" @click="showKeyDialog = false">Close</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.api-key-display {
  font-size: 1.05rem;
  font-family: ui-monospace, 'Fira Mono', Consolas, monospace;
  background: var(--oxy-field);
  border: 1px solid var(--oxy-accent);
  border-radius: 8px;
  padding: 0.9rem 1rem;
  margin: 0.75rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  word-break: break-all;
  color: var(--oxy-ink);
}
</style>
