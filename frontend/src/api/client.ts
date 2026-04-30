import axios from 'axios'

// In dev: Vite proxy rewrites /api → crm_backend:8000 (no env var needed)
// In prod: VITE_API_BASE_URL=https://api-crm.x1techs.com/api/v1
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const raw = localStorage.getItem('crm-auth')
  if (raw) {
    try {
      const token = JSON.parse(raw)?.state?.token
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {}
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
