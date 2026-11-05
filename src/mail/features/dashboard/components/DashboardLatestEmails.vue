<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { MessageLogResponse } from '../api/dashboard'
import { getLatestEmails } from '../api/dashboard'
import { humanizeDate, LoadingOverlay, AppAlert } from '@mail/shared'
import { useDashboardSignalR } from '../composables/useDashboardSignalR'

const emails = ref<MessageLogResponse[]>([])
const loading = ref(true)
const error = ref('')

const loadData = async () => {
  loading.value = true
  try {
    emails.value = await getLatestEmails()
  } catch {
    error.value = 'Failed to load latest emails'
  } finally {
    loading.value = false
  }
}

const { sentEmails } = useDashboardSignalR()

watch(sentEmails, async (newVal) => {
  if (newVal.length > 0) await loadData()
})

onMounted(loadData)
</script>

<template>
  <section class="panel" style="position: relative">
    <h2>Latest Sent Emails</h2>
    <AppAlert v-if="error" type="error" :message="error" />
    <table v-else class="data">
      <thead>
        <tr>
          <th>To</th>
          <th>Subject</th>
          <th>Status</th>
          <th>Sent</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="email in emails.slice(0, 5)" :key="email.id ?? email.loggedAt">
          <td>{{ email.to }}</td>
          <td>{{ email.subject }}</td>
          <td>{{ email.status }}</td>
          <td>{{ humanizeDate(email.loggedAt ?? '') }}</td>
        </tr>
      </tbody>
    </table>
    <LoadingOverlay :loading="loading" />
  </section>
</template>
