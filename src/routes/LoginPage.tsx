import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/ui'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname: string } } }
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const loginAsAdmin = useAuthStore((s) => s.loginAsAdmin)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      const redirectTo = location.state?.from?.pathname || '/admin'
      navigate(redirectTo, { replace: true })
    }
  }, [isAdmin, location.state, navigate])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      setError('Admin credentials are not configured.')
      return
    }
    const isAdminMatch = email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD
    if (isAdminMatch) {
      loginAsAdmin(email.trim())
      navigate('/admin', { replace: true })
      return
    }
    setError('Invalid email or password')
  }

  return (
    <section style={{ maxWidth: 420, margin: '40px auto', padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </label>
        {error && (
          <div role="alert" style={{ color: 'var(--red-600)' }}>
            {error}
          </div>
        )}
        <button type="submit" className="primary" style={{ padding: '8px 12px', borderRadius: 999 }}>
          Sign in
        </button>
        <p style={{ color: '#777', fontSize: 12 }}>
          Admin access only. General signup is not available.
        </p>
      </form>
    </section>
  )
}


