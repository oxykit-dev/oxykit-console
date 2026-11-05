const THEME_COOKIE = 'oxykit.theme'

export type OxyTheme = 'light' | 'dark'

function readThemeCookie(): OxyTheme | null {
  if (typeof document === 'undefined') return null
  const prefix = `${THEME_COOKIE}=`
  for (const part of document.cookie.split('; ')) {
    if (!part.startsWith(prefix)) continue
    const value = decodeURIComponent(part.slice(prefix.length)).trim()
    if (value === 'light' || value === 'dark') return value
  }
  return null
}

export function getTheme(): OxyTheme {
  return readThemeCookie() ?? 'light'
}

export function setTheme(theme: OxyTheme): void {
  if (typeof document === 'undefined') return
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`
  document.documentElement.dataset.theme = theme
  window.dispatchEvent(new CustomEvent<OxyTheme>('oxykit-theme', { detail: theme }))
}

export function toggleTheme(): OxyTheme {
  const next: OxyTheme = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

/** Apply the shared cookie before paint. Safe to call more than once. */
export function initTheme(): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = getTheme()
}

function cssColor(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** Vuetify light/dark themes sourced from tokens.css. Call after that stylesheet loads. */
export function oxyMailThemes() {
  const accent = cssColor('--oxy-accent', '#0f766e')
  const accentInk = cssColor('--oxy-accent-ink', '#ecfdf5')
  const danger = cssColor('--oxy-danger', '#b91c1c')
  const nav = cssColor('--oxy-nav-bg', '#134e4a')
  const brand = {
    primary: accent,
    'on-primary': accentInk,
    secondary: nav,
    'on-secondary': accentInk,
    error: danger,
  }

  return {
    light: {
      dark: false,
      colors: {
        ...brand,
        background: cssColor('--oxy-bg-light', '#f3f0ea'),
        surface: cssColor('--oxy-surface-light', '#fffcf7'),
        'on-background': cssColor('--oxy-ink-light', '#1c1917'),
        'on-surface': cssColor('--oxy-ink-light', '#1c1917'),
      },
    },
    dark: {
      dark: true,
      colors: {
        ...brand,
        background: cssColor('--oxy-bg-dark', '#121816'),
        surface: cssColor('--oxy-surface-dark', '#1c2422'),
        'on-background': cssColor('--oxy-ink-dark', '#ecfdf5'),
        'on-surface': cssColor('--oxy-ink-dark', '#ecfdf5'),
      },
    },
  }
}
