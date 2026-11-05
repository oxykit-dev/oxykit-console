import axios from 'axios'
import { API_KEY_HEADER, getApiKey, getRenderBaseUrl } from '@render/shared/config'
import { getAccessToken, redirectToLogin } from '@/shell'

export const api = axios.create({
  timeout: 120_000,
})

api.interceptors.request.use((config) => {
  config.baseURL = getRenderBaseUrl()
  const token = getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  // Dev override: API key wins when explicitly set in Connection panel / env.
  const key = getApiKey()
  if (key) {
    config.headers.set(API_KEY_HEADER, key)
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401 && !getApiKey()) {
      redirectToLogin()
    }
    return Promise.reject(err)
  },
)

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined
    if (data?.error) return data.error
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Request failed'
}
