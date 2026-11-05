const STORAGE_KEY = 'oxykit-flow-api-key'
const STORAGE_URL = 'oxykit-flow-url'

/** Empty = gateway `/api/flow` or Vite proxy to :5077. */
export function getFlowBaseUrl(): string {
  if (localStorage.getItem(STORAGE_URL) !== null) {
    return (localStorage.getItem(STORAGE_URL) || '').replace(/\/$/, '')
  }
  const env = import.meta.env.VITE_FLOW_URL
  if (typeof env === 'string' && env.trim()) return env.trim().replace(/\/$/, '')
  return '/api/flow'
}

export function setFlowBaseUrl(url: string): void {
  localStorage.setItem(STORAGE_URL, url.trim().replace(/\/$/, ''))
}

export function getApiKey(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored.trim()
  return (import.meta.env.VITE_FLOW_API_KEY as string | undefined)?.trim() || ''
}

export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim())
}

export const API_KEY_HEADER = 'X-OxyKit-Flow-Key'
