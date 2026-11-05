const STORAGE_KEY = 'oxykit-render-api-key'
const STORAGE_URL = 'oxykit-render-url'

/**
 * Empty string = same origin (Vite proxy / nginx → Render).
 * Override with VITE_RENDER_URL or the Connection panel for a direct API host.
 */
export function getRenderBaseUrl(): string {
  if (localStorage.getItem(STORAGE_URL) !== null) {
    return (localStorage.getItem(STORAGE_URL) || '').replace(/\/$/, '')
  }
  const env = import.meta.env.VITE_RENDER_URL
  if (typeof env === 'string' && env.trim()) return env.trim().replace(/\/$/, '')
  return '/api/render'
}

export function setRenderBaseUrl(url: string): void {
  localStorage.setItem(STORAGE_URL, url.trim().replace(/\/$/, ''))
}

/** Dev override only — empty means rely on Bearer JWT from suite session. */
export function getApiKey(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored.trim()
  return (import.meta.env.VITE_RENDER_API_KEY as string | undefined)?.trim() || ''
}

export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim())
}

export const API_KEY_HEADER = 'X-OxyKit-Render-Key'
