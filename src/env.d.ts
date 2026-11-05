/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string
  readonly VITE_SIGNALR_HUB_URL?: string
  readonly VITE_RENDER_URL?: string
  readonly VITE_RENDER_API_KEY?: string
  readonly VITE_FLOW_URL?: string
  readonly VITE_FLOW_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
