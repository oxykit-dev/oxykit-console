import { computed, reactive } from 'vue'

export type ModuleId = 'mail' | 'render' | 'flow'

/** On unless `config.json` sets the key to false. Edited after deploy; no rebuild. */
export const modules = reactive<Record<ModuleId, boolean>>({
  mail: true,
  render: true,
  flow: true,
})

const links: { id: ModuleId; label: string; to: string }[] = [
  { id: 'mail', label: 'Mail', to: '/' },
  { id: 'render', label: 'Render', to: '/render' },
  { id: 'flow', label: 'Flow', to: '/flow' },
]

export const moduleNav = computed(() => links.filter((link) => modules[link.id]))

export function applyModuleConfig(data: unknown): void {
  const record = isRecord(data) ? data : {}
  modules.mail = enabled(record.mail)
  modules.render = enabled(record.render)
  modules.flow = enabled(record.flow)
}

/** `public/config.json`, copied next to `index.html`. A missing file leaves every module on. */
export async function loadModuleConfig(): Promise<void> {
  const base = import.meta.env.BASE_URL || '/'
  const url = `${base.endsWith('/') ? base : `${base}/`}config.json`
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      console.warn(`oxykit-console: ${url} returned ${response.status}; all modules stay on`)
      return
    }
    applyModuleConfig(await response.json())
  } catch (error) {
    console.warn('oxykit-console: could not read config.json; all modules stay on', error)
  }
}

function enabled(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase()
    if (text === '') return true
    return text !== 'false' && text !== '0'
  }
  return true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
