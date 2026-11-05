const STORAGE_KEY = 'oxykit_correlation_id'

/** Stable per-tab id for `X-Correlation-Id` (sessionStorage when available). */
export function getCorrelationId(): string {
  if (typeof sessionStorage !== 'undefined') {
    let id = sessionStorage.getItem(STORAGE_KEY)
    if (!id) {
      id = createId()
      sessionStorage.setItem(STORAGE_KEY, id)
    }
    return id
  }
  return createId()
}

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `web-${Date.now().toString(36)}`
}
