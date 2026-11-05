import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const mail = 'http://127.0.0.1:5026'
const render = 'http://127.0.0.1:5066'
const flow = 'http://127.0.0.1:5077'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@mail': fileURLToPath(new URL('./src/mail', import.meta.url)),
      '@render': fileURLToPath(new URL('./src/render', import.meta.url)),
      '@flow': fileURLToPath(new URL('./src/flow', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v1': mail,
      '/hubs': { target: mail, ws: true },
      '/api/render': {
        target: render,
        rewrite: (path) => path.replace(/^\/api\/render/, ''),
      },
      '/api/flow': {
        target: flow,
        rewrite: (path) => path.replace(/^\/api\/flow/, ''),
      },
    },
  },
})
