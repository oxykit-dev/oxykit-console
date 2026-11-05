<script setup lang="ts">
import {
  DashboardStats,
  DashboardEmailsPerDayChart,
  DashboardLatestEmails,
  DashboardFailures,
  DashboardTopRecipients,
  DeadLetteredEmails,
} from '../components'
import { useAuthStore } from '@mail/features/identity'

const auth = useAuthStore()
</script>

<template>
  <main class="stack">
    <h1>Email Dashboard</h1>
    <div class="mail-grid">
      <DashboardStats />
      <DashboardEmailsPerDayChart />
    </div>
    <div class="mail-grid">
      <DashboardLatestEmails />
      <DashboardFailures />
    </div>
    <div class="mail-grid">
      <DashboardTopRecipients v-if="auth.isAdmin" />
      <DeadLetteredEmails />
    </div>
  </main>
</template>
