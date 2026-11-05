<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { EmailsPerDayResponse } from '../api/dashboard'
import { getEmailsPerDay } from '../api/dashboard'
import ApexLineChart from './ApexLineChart.vue'
import { useDashboardSignalR } from '../composables/useDashboardSignalR'

const emailsPerDay = ref<EmailsPerDayResponse[]>([])
const loading = ref(true)
const error = ref('')

const getDefaultRequest = () => {
  const now = new Date()
  const since = new Date(now)
  since.setDate(now.getDate() - 6)
  return {
    since: since.toISOString(),
    timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

const loadData = async () => {
  loading.value = true
  try {
    emailsPerDay.value = await getEmailsPerDay(getDefaultRequest())
  } catch {
    error.value = 'Failed to load emails per day'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

const { sentEmails } = useDashboardSignalR()

watch(sentEmails, async (newSent) => {
  if (newSent.length > 0) {
    await loadData()
  }
})

const data = computed(() => emailsPerDay.value.map((e) => e.emailsSent ?? 0))
const labels = computed(() =>
  emailsPerDay.value.map((e) => {
    if (!e.date) return ''
    const d = new Date(e.date)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }),
)
</script>
<template>
  <section class="panel" style="position: relative; min-height: 260px">
    <h2>Emails Per Day</h2>
    <p class="muted">Last 7 days</p>
    <p v-if="error" class="error">{{ error }}</p>
    <ApexLineChart v-else :series="data" :labels="labels" color="#0f766e" style="min-height: 220px" />
    <div v-if="loading" class="dashboard-overlay-loading"><span class="spinner" /></div>
  </section>
</template>
<style src="@mail/assets/dashboard-overlay-loading.css"></style>
