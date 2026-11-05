<script setup lang="ts">
import { ref, computed } from 'vue'
import { sendEmail } from '../api/email'
import type { AttachmentRequest } from '../api/email'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useAsyncOperation, AppAlert, formatBytes, fileToBase64 } from '@mail/shared'

// Size limits (in bytes)
const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_BODY_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024 // 5MB per attachment

const form = ref({
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
  isHtml: true, // Quill produces HTML
  attachments: [] as AttachmentRequest[],
  scheduledFor: null as string | null,
})
const showCcBcc = ref(false)
const selectedFiles = ref<File[]>([])
const fileInputKey = ref(0) // For clearing file input

// Size validation
const bodySize = computed(() => new Blob([form.value.body]).size)
const isBodyTooLarge = computed(() => bodySize.value > MAX_BODY_SIZE)

const attachmentSizes = computed(() =>
  selectedFiles.value.map((file) => ({
    name: file.name,
    size: file.size,
    isTooLarge: file.size > MAX_ATTACHMENT_SIZE,
  })),
)

const totalAttachmentsSize = computed(() =>
  selectedFiles.value.reduce((sum, file) => sum + file.size, 0),
)

const totalSize = computed(() => bodySize.value + totalAttachmentsSize.value)
const isTotalTooLarge = computed(() => totalSize.value > MAX_TOTAL_SIZE)

const hasOversizedAttachments = computed(() => attachmentSizes.value.some((a) => a.isTooLarge))

const canSubmit = computed(
  () => !isBodyTooLarge.value && !hasOversizedAttachments.value && !isTotalTooLarge.value,
)

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  selectedFiles.value = Array.from(input.files)

  // Convert files to base64 for attachments
  try {
    form.value.attachments = await Promise.all(
      selectedFiles.value.map(async (file) => {
        const content = await fileToBase64(file)
        return {
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          content,
        }
      }),
    )
  } catch {
    sendOp.error.value = 'Failed to process file attachments'
    selectedFiles.value = []
    form.value.attachments = []
    fileInputKey.value++ // Reset file input
  }
}

// Use async operation for sending
const sendOp = useAsyncOperation<void>({
  onSuccess: () => {
    setTimeout(() => {
      emit('close')
    }, 1200)
  },
})

const emit = defineEmits(['close'])

async function handleSend() {
  // Validate sizes before sending
  if (!canSubmit.value) {
    sendOp.error.value = 'Please fix size errors before sending'
    return
  }

  await sendOp.execute(async () => {
    // Prepare scheduled time
    if (form.value.scheduledFor) {
      const dt = new Date(form.value.scheduledFor)
      form.value.scheduledFor = dt.toISOString()
    } else {
      form.value.scheduledFor = null
    }

    const result = await sendEmail(form.value)
    successMessage.value =
      result.message ||
      (result.status === 'sent'
        ? 'Email sent successfully!'
        : result.status === 'scheduled'
          ? 'Email scheduled successfully!'
          : 'Email accepted for delivery!')
  })
}

const successMessage = ref('Email accepted for delivery!')

const toolbar = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
]
</script>

<template>
  <section class="panel dialog compose" role="dialog" aria-modal="true" aria-label="Send email">
    <header class="compose-head">
      <h2>Send email</h2>
      <button type="button" class="compose-close" aria-label="Close" @click="$emit('close')">×</button>
    </header>
    <form id="send-email" class="compose-scroll" @submit.prevent="handleSend">
      <div class="compose-to">
        <label>
          To
          <input v-model="form.to" required autocomplete="email" />
        </label>
        <button type="button" class="text-btn" @click="showCcBcc = !showCcBcc">
          {{ showCcBcc ? 'Hide Cc, Bcc' : 'Cc, Bcc' }}
        </button>
      </div>
      <div v-if="showCcBcc" class="compose-pair">
        <label>
          Cc
          <input v-model="form.cc" autocomplete="email" />
        </label>
        <label>
          Bcc
          <input v-model="form.bcc" autocomplete="email" />
        </label>
      </div>
      <label>
        Subject
        <input v-model="form.subject" required />
      </label>

      <div class="compose-pair">
        <label>
          Send later
          <input
            v-model="form.scheduledFor"
            type="datetime-local"
            :min="new Date().toISOString().slice(0, 16)"
          />
        </label>
        <label>
          Attachments
          <input :key="fileInputKey" type="file" multiple @change="handleFileChange" />
        </label>
      </div>

      <ul v-if="attachmentSizes.length" class="attach-list">
        <li v-for="att in attachmentSizes" :key="att.name" :class="{ error: att.isTooLarge }">
          {{ att.name }}
          <span>{{ formatBytes(att.size) }}</span>
        </li>
      </ul>

      <div class="compose-body">
        <div class="compose-body-head">
          <span>Message</span>
          <label class="check">
            <input v-model="form.isHtml" type="checkbox" />
            HTML
          </label>
        </div>
        <textarea v-if="!form.isHtml" v-model="form.body" required rows="8" class="plain-body" />
        <QuillEditor
          v-else
          v-model:content="form.body"
          content-type="html"
          theme="snow"
          :toolbar="toolbar"
          class="editor"
        />
      </div>

      <p class="hint" :class="{ error: isBodyTooLarge || isTotalTooLarge || hasOversizedAttachments }">
        <template v-if="isBodyTooLarge">Message exceeds {{ formatBytes(MAX_BODY_SIZE) }}. </template>
        <template v-if="hasOversizedAttachments">
          Each file must be under {{ formatBytes(MAX_ATTACHMENT_SIZE) }}.
        </template>
        <template v-else>
          {{ formatBytes(totalSize) }} of {{ formatBytes(MAX_TOTAL_SIZE) }}
        </template>
      </p>

      <AppAlert v-if="sendOp.success.value" type="success" :message="successMessage" />
      <AppAlert
        v-if="sendOp.error.value"
        type="error"
        :message="sendOp.error.value"
        dismissible
        @dismiss="sendOp.error.value = ''"
      />
    </form>
    <div class="compose-actions">
      <button type="button" class="btn ghost" @click="$emit('close')">Cancel</button>
      <button class="btn" type="submit" form="send-email" :disabled="!canSubmit || sendOp.loading.value">
        {{ sendOp.loading.value ? 'Sending…' : 'Send' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.compose {
  width: min(100%, 40rem);
  height: min(calc(100vh - 1rem), 40rem);
  max-height: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.compose-scroll {
  overflow: auto;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.compose-body {
  flex: 1 1 auto;
  min-height: 10rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.compose-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.compose-head h2 {
  margin: 0;
}

.compose-close {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.compose-close:hover {
  background: color-mix(in srgb, var(--oxy-ink) 8%, transparent);
  color: var(--ink);
}

.compose-to {
  display: flex;
  align-items: end;
  gap: 0.75rem;
}

.compose-to label {
  flex: 1;
}

.text-btn {
  border: 0;
  background: none;
  color: var(--accent);
  font-family: var(--oxy-font-ui);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.55rem 0.15rem;
  cursor: pointer;
  white-space: nowrap;
}

.compose-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.compose-body-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  color: var(--muted);
  font-family: var(--oxy-font-ui);
  font-size: 0.85rem;
}

.compose-body-head .check {
  flex: 0 0 auto;
  width: auto;
  display: inline-flex;
}

.plain-body {
  flex: 1;
  min-height: 6rem;
  resize: none;
}

.attach-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.attach-list li {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.error {
  color: var(--oxy-danger);
}

.compose-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex: none;
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--line);
}

.compose :deep(.editor) {
  flex: 1;
  min-height: 8rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.compose :deep(.ql-toolbar) {
  flex: none;
  border: 1px solid var(--line);
  border-bottom: 0;
  border-radius: 10px 10px 0 0;
  background: var(--oxy-field);
}

.compose :deep(.ql-container),
.compose :deep(.ql-editor) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.compose :deep(.ql-container) {
  border: 1px solid var(--line);
  border-radius: 0 0 10px 10px;
  background: var(--oxy-field);
  font-family: var(--oxy-font-ui);
  font-size: 0.95rem;
}

.compose :deep(.ql-editor) {
  color: var(--ink);
}

.compose :deep(.ql-stroke) {
  stroke: var(--ink);
}

.compose :deep(.ql-fill) {
  fill: var(--ink);
}

.compose :deep(.ql-picker) {
  color: var(--ink);
}

@media (max-width: 640px) {
  .compose-pair {
    grid-template-columns: 1fr;
  }
}
</style>
