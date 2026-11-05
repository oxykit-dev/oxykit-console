<template>
  <main class="stack">
    <h1>Ops</h1>
    <p class="muted">
      Admin helpers for DKIM setup. Keys and DNS records come from the Mail API; store the private
      key outside the app.
    </p>

    <section class="panel stack">
      <h2>DKIM DNS TXT record</h2>
      <p class="muted">Requires DKIM enabled in Mail configuration (<code>DkimSettings</code>).</p>
      <p v-if="dnsError" class="error">{{ dnsError }}</p>
      <button type="button" class="btn" :disabled="dnsLoading" @click="loadDns">
        {{ dnsLoading ? 'Loading…' : 'Load DNS record' }}
      </button>
      <template v-if="dns">
        <label>
          TXT value
          <textarea :value="dns.dnsTxtRecord" readonly rows="3" />
        </label>
        <div>
          <span class="hint">Instructions</span>
          <pre class="ops-pre">{{ dns.instructions }}</pre>
        </div>
      </template>
    </section>

    <section class="panel stack">
      <h2>Generate DKIM key pair</h2>
      <p class="muted">
        Creates a new RSA pair. Save the private key securely and point
        <code>DkimSettings:PrivateKeyPath</code> at it — the API does not persist the key.
      </p>
      <p v-if="keysError" class="error">{{ keysError }}</p>
      <button type="button" class="btn" :disabled="keysLoading" @click="generateKeys">
        {{ keysLoading ? 'Generating…' : 'Generate keys' }}
      </button>
      <template v-if="keys">
        <p class="alert warning">{{ keys.message }}</p>
        <label>
          Public key (DNS)
          <textarea :value="keys.publicKey" readonly rows="4" />
        </label>
        <label>
          Private key (PEM — keep secret)
          <textarea :value="keys.privateKey" readonly rows="8" />
        </label>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncOperation } from '@mail/shared'
import {
  generateDkimKeys,
  getDkimDnsRecord,
  type DnsRecordResponse,
  type GenerateKeysResponse,
} from '../api/dkim'

const dns = ref<DnsRecordResponse | null>(null)
const keys = ref<GenerateKeysResponse | null>(null)

const {
  loading: dnsLoading,
  error: dnsError,
  execute: executeDns,
} = useAsyncOperation<DnsRecordResponse>()

const {
  loading: keysLoading,
  error: keysError,
  execute: executeKeys,
} = useAsyncOperation<GenerateKeysResponse>()

async function loadDns() {
  const result = await executeDns(() => getDkimDnsRecord())
  if (result) dns.value = result
}

async function generateKeys() {
  const result = await executeKeys(() => generateDkimKeys())
  if (result) keys.value = result
}
</script>

<style scoped>
.ops-pre {
  white-space: pre-wrap;
  font-size: 0.85rem;
  margin: 0.35rem 0 0;
  padding: 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--oxy-ink) 6%, transparent);
}
</style>
