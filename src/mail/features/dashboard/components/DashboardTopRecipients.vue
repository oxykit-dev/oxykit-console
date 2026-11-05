<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TopRecipientResponse } from '../api/dashboard'
import { getTopRecipients } from '../api/dashboard'

const topRecipients = ref<TopRecipientResponse[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    topRecipients.value = await getTopRecipients()
  } catch {
    error.value = 'Failed to load top recipients'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="panel" style="position: relative; min-height: 220px">
    <h2>Top Recipients</h2>
    <p v-if="error" class="error">{{ error }}</p>
    <table v-else class="data">
      <thead>
        <tr>
          <th>Recipient</th>
          <th>Emails received</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in topRecipients.slice(0, 5)" :key="item.recipient">
          <td>{{ item.recipient }}</td>
          <td>{{ item.emailsReceived }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="loading" class="dashboard-overlay-loading"><span class="spinner" /></div>
  </section>
</template>

<style src="@mail/assets/dashboard-overlay-loading.css"></style>
