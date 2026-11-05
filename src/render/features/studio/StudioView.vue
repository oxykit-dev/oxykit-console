<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { errorMessage } from '@render/api/client'
import {
  deleteAsset,
  deleteTemplate,
  getTemplate,
  listTemplates,
  previewHtml,
  previewPdf,
  uploadAsset,
  uploadPack,
  type TemplateDetailResponse,
  type TemplateListItem,
} from '@render/api/templates'
import {
  getApiKey,
  getRenderBaseUrl,
  setApiKey,
  setRenderBaseUrl,
} from '@render/shared/config'

const baseUrl = ref(getRenderBaseUrl())
const apiKey = ref(getApiKey())
const templates = ref<TemplateListItem[]>([])
const selectedId = ref('')
const detail = ref<TemplateDetailResponse | null>(null)
const status = ref('')
const error = ref('')
const busy = ref(false)

const packId = ref('invoice')
const packFile = ref<File | null>(null)
const assetLabel = ref('logo.svg')
const assetFile = ref<File | null>(null)
const sampleJson = ref('{\n  "invoiceNumber": "INV-100",\n  "customerName": "Acme",\n  "total": 120.5,\n  "lines": [{ "description": "Widget", "amount": 120.5 }]\n}')
const htmlPreview = ref('')
const pdfUrl = ref<string | null>(null)

const canUploadPack = computed(() => Boolean(packId.value.trim() && packFile.value))
const canUploadAsset = computed(
  () => Boolean(selectedId.value && assetLabel.value.trim() && assetFile.value),
)

function saveConnection() {
  setRenderBaseUrl(baseUrl.value)
  setApiKey(apiKey.value)
  status.value = 'Connection saved.'
  error.value = ''
}

async function refresh() {
  busy.value = true
  error.value = ''
  try {
    templates.value = await listTemplates()
    if (selectedId.value && !templates.value.some((t) => t.id === selectedId.value)) {
      selectedId.value = templates.value[0]?.id ?? ''
    } else if (!selectedId.value && templates.value[0]) {
      selectedId.value = templates.value[0].id
    }
    status.value = `Loaded ${templates.value.length} template(s).`
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function loadDetail(id: string) {
  if (!id) {
    detail.value = null
    return
  }
  try {
    detail.value = await getTemplate(id)
  } catch (e) {
    detail.value = null
    error.value = errorMessage(e)
  }
}

watch(selectedId, (id) => {
  void loadDetail(id)
})

async function onUploadPack() {
  if (!packFile.value) return
  busy.value = true
  error.value = ''
  try {
    await uploadPack(packId.value.trim(), packFile.value)
    status.value = `Uploaded pack “${packId.value.trim()}”.`
    packFile.value = null
    await refresh()
    selectedId.value = packId.value.trim()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function onDeletePack() {
  if (!selectedId.value) return
  if (!confirm(`Delete template “${selectedId.value}”?`)) return
  busy.value = true
  error.value = ''
  try {
    await deleteTemplate(selectedId.value)
    status.value = `Deleted “${selectedId.value}”.`
    selectedId.value = ''
    await refresh()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function onUploadAsset() {
  if (!selectedId.value || !assetFile.value) return
  busy.value = true
  error.value = ''
  try {
    const res = await uploadAsset(
      selectedId.value,
      assetLabel.value.trim(),
      assetFile.value,
      assetFile.value.type || 'application/octet-stream',
    )
    status.value = `Asset saved as ${res.path} — use {{ asset "${res.path}" }}.`
    assetFile.value = null
    await loadDetail(selectedId.value)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function onDeleteAsset(path: string) {
  if (!selectedId.value) return
  const label = path.replace(/^assets\//i, '')
  if (!confirm(`Delete ${path}?`)) return
  busy.value = true
  error.value = ''
  try {
    await deleteAsset(selectedId.value, label)
    status.value = `Deleted ${path}.`
    await loadDetail(selectedId.value)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

function parseSample(): unknown {
  return JSON.parse(sampleJson.value) as unknown
}

async function onPreviewHtml() {
  if (!selectedId.value) return
  busy.value = true
  error.value = ''
  try {
    htmlPreview.value = await previewHtml(selectedId.value, parseSample())
    status.value = 'HTML preview ready.'
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function onPreviewPdf() {
  if (!selectedId.value) return
  busy.value = true
  error.value = ''
  try {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
    const blob = await previewPdf(selectedId.value, parseSample())
    pdfUrl.value = URL.createObjectURL(blob)
    status.value = 'PDF preview ready.'
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

function onPackFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  packFile.value = input.files?.[0] ?? null
}

function onAssetFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  assetFile.value = input.files?.[0] ?? null
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <div class="studio">
    <header class="hero">
      <div>
        <p class="brand">OxyKit Render</p>
        <h1>Template studio</h1>
        <p class="lede">List packs, upload zip or assets, preview HTML and PDF with sample JSON.</p>
      </div>
      <button type="button" class="btn ghost" :disabled="busy" @click="refresh">Refresh</button>
    </header>

    <section class="panel">
      <h2>Connection <span class="muted">(dev override)</span></h2>
      <p class="muted">Prefer suite login (Bearer). API key is optional for local Hoppscotch-style debugging.</p>
      <div class="row">
        <label>
          Base URL
          <input v-model="baseUrl" type="url" placeholder="(empty = same-origin proxy)" />
        </label>
        <label>
          API key
          <input v-model="apiKey" type="password" autocomplete="off" placeholder="X-OxyKit-Render-Key" />
        </label>
        <button type="button" class="btn" @click="saveConnection">Save</button>
      </div>
    </section>

    <p v-if="status" class="status">{{ status }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="grid">
      <section class="panel">
        <h2>Packs</h2>
        <ul v-if="templates.length" class="list">
          <li
            v-for="t in templates"
            :key="t.id"
            :class="{ active: t.id === selectedId }"
            @click="selectedId = t.id"
          >
            <strong>{{ t.id }}</strong>
            <span>{{ t.hasContract ? 'contract' : 'no contract' }}</span>
          </li>
        </ul>
        <p v-else class="muted">No templates (check connection / TemplatesRoot).</p>
        <div v-if="detail" class="detail">
          <h3>{{ detail.id }}</h3>
          <ul class="files">
            <li v-for="f in detail.files" :key="f">
              <code>{{ f }}</code>
              <button
                v-if="f.startsWith('assets/')"
                type="button"
                class="link"
                @click="onDeleteAsset(f)"
              >
                delete
              </button>
            </li>
          </ul>
          <button type="button" class="btn danger" :disabled="busy" @click="onDeletePack">
            Delete pack
          </button>
        </div>
      </section>

      <section class="panel">
        <h2>Upload pack</h2>
        <label>
          Template id
          <input v-model="packId" />
        </label>
        <label>
          Zip
          <input type="file" accept=".zip,application/zip" @change="onPackFile" />
        </label>
        <button type="button" class="btn" :disabled="!canUploadPack || busy" @click="onUploadPack">
          Upload / replace
        </button>

        <h2 class="spaced">Upload asset</h2>
        <p class="muted">Writes under the selected pack. Label <code>logo.svg</code> → <code>assets/logo.svg</code>.</p>
        <label>
          Label / path
          <input v-model="assetLabel" placeholder="logo.svg" />
        </label>
        <label>
          Image
          <input type="file" accept=".png,.jpg,.jpeg,.gif,.webp,.svg,image/*" @change="onAssetFile" />
        </label>
        <button
          type="button"
          class="btn"
          :disabled="!canUploadAsset || busy"
          @click="onUploadAsset"
        >
          Upload asset
        </button>
      </section>
    </div>

    <section class="panel">
      <h2>Preview — {{ selectedId || 'select a pack' }}</h2>
      <label>
        Sample JSON (<code>data</code>)
        <textarea v-model="sampleJson" rows="12" spellcheck="false" />
      </label>
      <div class="row">
        <button type="button" class="btn" :disabled="!selectedId || busy" @click="onPreviewHtml">
          Render HTML
        </button>
        <button type="button" class="btn" :disabled="!selectedId || busy" @click="onPreviewPdf">
          Render PDF
        </button>
      </div>
      <div v-if="htmlPreview" class="preview-frame">
        <iframe title="HTML preview" :srcdoc="htmlPreview" />
      </div>
      <div v-if="pdfUrl" class="preview-frame">
        <iframe title="PDF preview" :src="pdfUrl" />
      </div>
    </section>
  </div>
</template>
