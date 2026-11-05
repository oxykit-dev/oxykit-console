<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createSimpleFileJob, getJob, listJobs, retryJob, type JobResponse } from '@flow/api/jobs'
import { errorMessage } from '@flow/api/client'
import { getApiKey, getFlowBaseUrl, setApiKey, setFlowBaseUrl } from '@flow/shared/config'

const jobs = ref<JobResponse[]>([])
const selected = ref<JobResponse | null>(null)
const status = ref('')
const error = ref('')
const busy = ref(false)
const baseUrl = ref(getFlowBaseUrl())
const apiKey = ref(getApiKey())
const newName = ref('studio-demo')

function saveConnection() {
  setFlowBaseUrl(baseUrl.value)
  setApiKey(apiKey.value)
  status.value = 'Connection saved.'
  error.value = ''
}

async function refresh() {
  busy.value = true
  error.value = ''
  try {
    const res = await listJobs()
    jobs.value = res.items
    status.value = `Loaded ${res.count} of ${res.total} job(s).`
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function selectJob(id: string) {
  busy.value = true
  error.value = ''
  try {
    selected.value = await getJob(id)
  } catch (e) {
    selected.value = null
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function onCreate() {
  busy.value = true
  error.value = ''
  try {
    const job = await createSimpleFileJob(newName.value.trim() || 'studio-demo')
    status.value = `Created ${job.id}`
    await refresh()
    await selectJob(job.id)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function onRetry() {
  if (!selected.value) return
  busy.value = true
  error.value = ''
  try {
    selected.value = await retryJob(selected.value.id)
    status.value = `Retried ${selected.value.id}`
    await refresh()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <div class="studio">
    <header class="hero">
      <div>
        <p class="brand">OxyKit Flow</p>
        <h1>Jobs</h1>
        <p class="lede">List, inspect, create a sample file job, retry dead-lettered work.</p>
      </div>
      <button type="button" class="btn ghost" :disabled="busy" @click="refresh">Refresh</button>
    </header>

    <section class="panel">
      <h2>Connection <span class="muted">(dev override)</span></h2>
      <div class="row">
        <label>
          Base URL
          <input v-model="baseUrl" type="url" placeholder="/api/flow" />
        </label>
        <label>
          API key
          <input v-model="apiKey" type="password" autocomplete="off" placeholder="X-OxyKit-Flow-Key" />
        </label>
        <button type="button" class="btn" @click="saveConnection">Save</button>
      </div>
    </section>

    <p v-if="status" class="status">{{ status }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="grid">
      <section class="panel">
        <h2>Recent</h2>
        <ul v-if="jobs.length" class="list">
          <li
            v-for="j in jobs"
            :key="j.id"
            :class="{ active: selected?.id === j.id }"
            @click="selectJob(j.id)"
          >
            <strong>{{ j.name || j.id.slice(0, 8) }}</strong>
            <span>{{ j.status }}</span>
          </li>
        </ul>
        <p v-else class="muted">No jobs yet.</p>
        <div v-if="selected" class="detail">
          <h3>{{ selected.name || 'Job' }}</h3>
          <p><code>{{ selected.id }}</code> · {{ selected.status }}</p>
          <ul v-if="selected.deliveries?.length" class="files">
            <li v-for="d in selected.deliveries" :key="d.ordinal">
              {{ d.provider }} → {{ d.status }}
              <span v-if="d.destination"> ({{ d.destination }})</span>
            </li>
          </ul>
          <button
            v-if="selected.status === 'DeadLettered'"
            type="button"
            class="btn"
            :disabled="busy"
            @click="onRetry"
          >
            Retry
          </button>
        </div>
      </section>

      <section class="panel">
        <h2>Create sample (file)</h2>
        <label>
          Name
          <input v-model="newName" />
        </label>
        <button type="button" class="btn" :disabled="busy" @click="onCreate">
          Create table→html file job
        </button>
      </section>
    </div>
  </div>
</template>
