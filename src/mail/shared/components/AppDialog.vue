<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title: string
  maxWidth?: string | number
  loading?: boolean
  confirmText?: string
  cancelText?: string
  hideCancel?: boolean
  disableConfirm?: boolean
  persistent?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function onBackdrop() {
  if (!props.persistent) handleCancel()
}
</script>

<template>
  <div v-if="modelValue" class="dialog-backdrop" @click.self="onBackdrop">
    <section class="panel dialog" role="dialog" aria-modal="true" :aria-label="title">
      <h2>{{ title }}</h2>
      <slot />
      <div class="dialog-actions">
        <button v-if="!hideCancel" type="button" class="btn ghost" :disabled="loading" @click="handleCancel">
          {{ cancelText ?? 'Cancel' }}
        </button>
        <button type="button" class="btn" :disabled="loading || disableConfirm" @click="emit('confirm')">
          {{ confirmText ?? 'OK' }}
        </button>
      </div>
    </section>
  </div>
</template>
