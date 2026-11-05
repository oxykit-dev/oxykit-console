import axios from 'axios'
import { API_KEY_HEADER, getApiKey, getFlowBaseUrl } from '@flow/shared/config'
import { getAccessToken, redirectToLogin } from '@/shell'

export const api = axios.create({
  timeout: 60_000,
})

api.interceptors.request.use((config) => {
  config.baseURL = getFlowBaseUrl()
  const token = getAccessToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  const key = getApiKey()
  if (key) config.headers.set(API_KEY_HEADER, key)
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
    const data = err.response?.data as { message?: string; errors?: unknown } | undefined
    if (typeof data?.message === 'string') return data.message
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Request failed'
}
