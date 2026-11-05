<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MessageLogResponse } from '../api/dashboard'
import { getMostRecentFailures } from '../api/dashboard'
import { humanizeDate } from '@mail/shared/utils/date'

const failures = ref<MessageLogResponse[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    failures.value = await getMostRecentFailures()
  } catch {
    error.value = 'Failed to load failures'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="panel" style="position: relative; min-height: 220px">
    <h2>Most Recent Failures</h2>
    <p v-if="error" class="error">{{ error }}</p>
    <table v-else class="data">
      <thead>
        <tr>
          <th>To</th>
          <th>Subject</th>
          <th>Error</th>
          <th>Logged</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in failures.slice(0, 5)" :key="item.id ?? item.loggedAt">
          <td>{{ item.to }}</td>
          <td>{{ item.subject }}</td>
          <td>{{ item.errorMessage }}</td>
          <td>{{ humanizeDate(item.loggedAt ?? '') }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="loading" class="dashboard-overlay-loading"><span class="spinner" /></div>
  </section>
</template>

<style src="@mail/assets/dashboard-overlay-loading.css"></style>
