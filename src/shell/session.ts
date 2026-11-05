export const ACCESS_TOKEN_KEY = 'oxykit.access_token'

function readCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`
  for (const part of document.cookie.split('; ')) {
    if (!part.startsWith(prefix)) continue
    const value = decodeURIComponent(part.slice(prefix.length)).trim()
    return value || null
  }
  return null
}

function writeCookie(name: string, value: string | null): void {
  const key = encodeURIComponent(name)
  if (!value) {
    document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`
    return
  }
  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`
}

export function getAccessToken(): string | null {
  try {
    const fromCookie = readCookie(ACCESS_TOKEN_KEY)
    if (fromCookie) return fromCookie
    const legacy = sessionStorage.getItem(ACCESS_TOKEN_KEY)?.trim() || null
    if (legacy) writeCookie(ACCESS_TOKEN_KEY, legacy)
    return legacy
  } catch {
    return null
  }
}

export function setAccessToken(token: string | null): void {
  try {
    writeCookie(ACCESS_TOKEN_KEY, token)
    if (token) sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
    else sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch {
    /* ignore private mode / SSR */
  }
}

/** Suite sign-in. Mail issues the session; the page is not a Mail screen. */
export function loginUrl(returnUrl: string = window.location.href): string {
  const url = new URL('/login', window.location.origin)
  url.searchParams.set('returnUrl', returnUrl)
  return url.toString()
}

export function redirectToLogin(returnUrl?: string): void {
  if (window.location.pathname === '/login') return
  window.location.assign(loginUrl(returnUrl ?? window.location.href))
}

/** Accepts a same-origin path or absolute URL. Rejects other origins. */
export function safeReturnUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const value = raw.trim()
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const url = new URL(value, window.location.origin)
    if (url.origin === window.location.origin) return url.pathname + url.search + url.hash
  } catch {
    /* ignore */
  }
  return null
}
