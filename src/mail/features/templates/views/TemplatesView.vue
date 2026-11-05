<template>
  <main class="stack">
    <h1>Templates</h1>
    <p class="muted">
      Mail packs on the API host (<code>subject.txt</code> + <code>body.html</code>). Upload a zip to
      create or replace; send with <code>templateId</code> + <code>data</code>.
    </p>
    <p v-if="listError" class="error">{{ listError }}</p>

    <section class="panel stack">
      <h2>Upload pack</h2>
      <label>
        Template id
        <input v-model="uploadId" />
        <span class="hint">Letters, digits, -, _</span>
      </label>
      <label>
        Zip file
        <input type="file" accept=".zip,application/zip" @change="onFile" />
      </label>
      <p v-if="uploadError" class="error">{{ uploadError }}</p>
      <button type="button" class="btn" :disabled="!canUpload || uploadLoading" @click="onUpload">
        {{ uploadLoading ? 'Uploading…' : 'Upload / replace' }}
      </button>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>Installed packs</h2>
        <button type="button" class="btn ghost" :disabled="listLoading" @click="refresh">
          {{ listLoading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>
      <ul v-if="templates.length" class="stack">
        <li v-for="t in templates" :key="t.id" class="row">
          <div>
            <strong>{{ t.id }}</strong>
            <p class="muted">{{ detailFiles[t.id]?.join(', ') || '…' }}</p>
          </div>
          <button
            type="button"
            class="btn ghost"
            :disabled="busyId === t.id"
            @click="onDownload(t.id)"
          >
            Download
          </button>
          <button type="button" class="btn danger" :disabled="busyId === t.id" @click="onDelete(t.id)">
            Delete
          </button>
        </li>
      </ul>
      <p v-else class="muted">No templates yet.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useAsyncOperation } from '@mail/shared'
import {
  deleteTemplate,
  downloadTemplatePack,
  getTemplate,
  listTemplates,
  uploadTemplate,
  type MailTemplateInfo,
} from '../api/templates'

const templates = ref<MailTemplateInfo[]>([])
const detailFiles = reactive<Record<string, string[]>>({})
const uploadId = ref('welcome')
const uploadFile = ref<File[] | File | null>(null)
const busyId = ref<string | null>(null)
const busyAction = ref<'download' | 'delete' | null>(null)

const {
  loading: listLoading,
  error: listError,
  execute: executeList,
} = useAsyncOperation<MailTemplateInfo[]>()

const {
  loading: uploadLoading,
  error: uploadError,
  execute: executeUpload,
} = useAsyncOperation<MailTemplateInfo>()

const canUpload = computed(() => {
  const id = uploadId.value.trim()
  const file = Array.isArray(uploadFile.value) ? uploadFile.value[0] : uploadFile.value
  return Boolean(id && file)
})

async function refresh() {
  const result = await executeList(() => listTemplates())
  if (!result) return
  templates.value = result
  for (const t of result) {
    try {
      const detail = await getTemplate(t.id)
      detailFiles[t.id] = detail.files
    } catch {
      detailFiles[t.id] = []
    }
  }
}

function onFile(event: Event) {
  uploadFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function onUpload() {
  const id = uploadId.value.trim()
  const file = Array.isArray(uploadFile.value) ? uploadFile.value[0] : uploadFile.value
  if (!id || !file) return
  const result = await executeUpload(() => uploadTemplate(id, file))
  if (result) {
    uploadFile.value = null
    await refresh()
  }
}

async function onDownload(id: string) {
  busyId.value = id
  busyAction.value = 'download'
  try {
    const blob = await downloadTemplatePack(id)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${id}.zip`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    busyId.value = null
    busyAction.value = null
  }
}

async function onDelete(id: string) {
  if (!confirm(`Delete template “${id}”?`)) return
  busyId.value = id
  busyAction.value = 'delete'
  try {
    await deleteTemplate(id)
    await refresh()
  } finally {
    busyId.value = null
    busyAction.value = null
  }
}

onMounted(() => {
  void refresh()
})
</script>
