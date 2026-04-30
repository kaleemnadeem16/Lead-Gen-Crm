import { useState, type FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      setAuth(data.token, data.user)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-fg-1">X1Techs CRM</h1>
          <p className="text-sm text-fg-2 mt-1">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-line rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-fg-2 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@x1techs.com"
              className="w-full bg-elevated border border-line rounded-lg px-3 py-2 text-sm text-fg-1 placeholder-fg-3 focus:outline-none focus:ring-1 focus:ring-fg-3 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-fg-2 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-elevated border border-line rounded-lg px-3 py-2 text-sm text-fg-1 placeholder-fg-3 focus:outline-none focus:ring-1 focus:ring-fg-3 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-fg-1 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed text-base text-sm font-medium py-2 rounded-lg transition-opacity"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
