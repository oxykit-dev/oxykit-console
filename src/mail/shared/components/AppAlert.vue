<script setup lang="ts">
defineProps<{
  type: 'error' | 'success' | 'warning' | 'info'
  message: string
  dismissible?: boolean
  dense?: boolean
  title?: string
}>()

const emit = defineEmits<{
  dismiss: []
}>()
</script>

<template>
  <p class="alert" :class="type" role="status">
    <strong v-if="title">{{ title }}. </strong>
    {{ message }}
    <button v-if="dismissible" type="button" class="btn ghost" @click="emit('dismiss')">Dismiss</button>
  </p>
</template>
