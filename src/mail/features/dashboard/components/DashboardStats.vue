<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getEmailStats, getDeliverySuccessRate } from '../api/dashboard'
import ApexPieChart from './ApexPieChart.vue'
import { humanizeDate, LoadingOverlay, AppAlert } from '@mail/shared'
import { useDashboardSignalR } from '../composables/useDashboardSignalR'

const stats = ref()
const delivery = ref()
const apexSeries = ref([0, 0])
const apexLabels = ['Delivered', 'Failed']
const apexColors = ['#0f766e', '#b91c1c']
const hasPieData = ref(true)
const loading = ref(true)
const error = ref('')

const { sentEmails, queuedEmails } = useDashboardSignalR()

const loadData = async () => {
  loading.value = true
  try {
    stats.value = await getEmailStats()
    delivery.value = await getDeliverySuccessRate()
    const sent = delivery.value?.totalSent ?? 0
    const failed = delivery.value?.totalFailed ?? 0
    if (sent === 0 && failed === 0) {
      hasPieData.value = false
    } else {
      hasPieData.value = true
    }
    apexSeries.value = [sent, failed]
  } catch {
    error.value = 'Failed to load stats'
  } finally {
    loading.value = false
  }
}

watch([sentEmails, queuedEmails], async ([sent, queued]) => {
  if (sent.length > 0 || queued.length > 0) {
    await loadData()
  }
})

onMounted(async () => {
  await loadData()
})
</script>
<template>
  <section class="panel" style="position: relative; min-height: 260px">
    <h2>Email Stats</h2>
    <AppAlert v-if="error" type="error" :message="error" />
    <div v-else class="mail-split">
      <ApexPieChart
        v-if="hasPieData"
        :series="apexSeries"
        :labels="apexLabels"
        :colors="apexColors"
        width="100%"
        style="max-width: 340px"
      />
      <div class="stack">
        <div>Total Sent: {{ stats?.totalEmailsSent ?? 0 }}</div>
        <div>Total Failed: {{ stats?.totalEmailsFailed ?? 0 }}</div>
        <div>Total Queued: {{ stats?.totalEmailsQueued ?? 0 }}</div>
        <div>
          Last Sent:
          <span v-if="stats?.lastEmailSentAt && new Date(stats.lastEmailSentAt).getFullYear() > 2000">
            {{ humanizeDate(stats.lastEmailSentAt) }}
          </span>
          <span v-else>Never</span>
        </div>
        <div>Delivery Success Rate: {{ delivery?.successRate ?? 0 }}%</div>
        <div>Delivered: {{ delivery?.totalSent ?? 0 }}</div>
        <div>Failed: {{ delivery?.totalFailed ?? 0 }}</div>
      </div>
    </div>
    <LoadingOverlay :loading="loading" />
  </section>
</template>
